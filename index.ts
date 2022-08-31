import path from 'path';
import { rollup, Plugin } from 'rollup';
import { access, readFile } from 'fs/promises';
import { readdirSync } from 'fs';
import nodeResolve from '@rollup/plugin-node-resolve';
import ts from 'rollup-plugin-ts';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import json from '@rollup/plugin-json';
import prettier from 'rollup-plugin-prettier';
import { argv, platform, env } from 'process';

import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

Promise.all(getPluginNames().map(build)).then(() => console.log(`Plugins saved to ${getOuputDir()}`));

function getPluginNames() {
    const provided = argv.slice(2).filter((arg) => !arg.startsWith('-'));
    if (provided.length) return provided;
    return readdirSync(getSourceDir());
}

function getSourceDir() {
    return path.join(__dirname, 'src');
}

function getOuputDir(pluginName?: string) {
    if (!(argv.includes('--install') || argv.includes('-i'))) {
        if (!pluginName) return path.join(__dirname, 'dist');
        return path.join(__dirname, pluginName, 'dist');
    }
    switch (platform) {
        case 'win32':
            if (!env.APPDATA) throw new Error('Could not find appdata folder');
            return path.join(env.APPDATA, 'BetterDiscord', 'plugins');
        case 'darwin':
            return path.join('/Library', 'Preferences', 'BetterDiscord');
        default:
            return path.join('.config', 'BetterDiscord', 'plugins');
    }
}

async function resolveEntryFile(pluginName: string) {
    for (const entryFile of [
        `${pluginName}/index.tsx`,
        `${pluginName}/index.ts`,
        `${pluginName}.tsx`,
        `${pluginName}.ts`,
    ].map((file) => path.join(getSourceDir(), file))) {
        try {
            await access(entryFile);
            return entryFile;
        } catch {}
    }
    throw new Error(`Could not resolve entry module for ${pluginName}.`);
}

interface TranformBdPluginOptions {
    meta?: any;
    pluginName: string;
}

function tranformBdPlugin({ meta, pluginName }: TranformBdPluginOptions): Plugin {
    // Performs unsafe transformations to eliminate dead code and add meta
    return {
        name: 'transform-better-discord-plugin',
        renderChunk(oldCode) {
            const ast = parse(oldCode);

            traverse(ast, {
                ExpressionStatement(path) {
                    path.traverse({
                        CallExpression({ node: { callee } }) {
                            if (callee.type !== 'Identifier') return;
                            const binding = path.scope.getBinding(callee.name);
                            if (!binding) return;
                            if (!binding.path.isVariableDeclarator()) return;
                            const init = binding.path.get('init');
                            if (!init.isIdentifier()) return;
                            if (init.node.name !== 'Webpack') return;
                            binding.dereference();
                            path.remove();
                        },
                    });
                },
            });

            traverse(ast, {
                VariableDeclarator(path) {
                    const unreferenced = new Set<string>();
                    function removeIfUnreferenced(path: NodePath, identifierKey: string): void {
                        const identifier = path.get(identifierKey);
                        if (Array.isArray(identifier) || !identifier.isIdentifier()) return;
                        const { name } = identifier.node;
                        const binding = path.scope.getBinding(name);
                        if (!binding || binding.referenced) return;
                        unreferenced.add(name);
                        path.remove();
                    }

                    function removePicksFromBindObject() {
                        const init = path.get('init');
                        if (!init.isCallExpression()) return;
                        const callee = init.get('callee');
                        if (!callee.isIdentifier()) return;
                        if (callee.node.name !== 'BindObject') return;
                        const [, bindingName, methodNames] = init.get('arguments');
                        if (bindingName.isIdentifier() && bindingName.node.name === '__PLUGIN_NAME__') {
                            bindingName.replaceWith(t.stringLiteral(pluginName));
                        }

                        if (!methodNames?.isArrayExpression()) return;
                        for (const methodName of methodNames.get('elements')) {
                            if (!methodName.isStringLiteral()) continue;
                            if (unreferenced.has(methodName.node.value)) methodName.remove();
                        }
                    }

                    path.get('id').traverse({
                        ObjectProperty: (path) => removeIfUnreferenced(path, 'value'),
                        RestElement: (path) => removeIfUnreferenced(path, 'argument'),
                    });
                    removePicksFromBindObject();
                },
                Program(path) {
                    const body = path.get('body');
                    const usesDefaultExport = body.some((statement) => {
                        if (!statement.isExpressionStatement()) return;
                        const expression = statement.get('expression');
                        if (!expression.isAssignmentExpression({ operator: '=' })) return;
                        const [left] = ([] as NodePath[]).concat(statement.get('left'));
                        if (!left.isMemberExpression()) return;
                        const object = left.get('object');
                        if (!object.isIdentifier()) return;
                        if (object.node.name !== 'module') return;
                        const property = left.get('property');
                        if (!property.isIdentifier()) return;
                        if (property.node.name !== 'exports') return;
                        return true;
                    });
                    if (!usesDefaultExport)
                        body.at(-1)?.insertAfter(
                            t.expressionStatement(
                                t.assignmentExpression(
                                    '=',
                                    t.memberExpression(t.identifier('module'), t.identifier('exports')),
                                    t.arrowFunctionExpression([], t.identifier('exports'))
                                )
                            )
                        );
                },
            });

            const { code } = generate(ast);
            if (!meta) return code;

            const fields = Object.entries(meta).map(([key, value]) => ` * @${key} ${value}`);
            if (!fields.length) return code;

            return ['/**', ...fields, ' */', code].join('\n');
        },
    };
}

async function build(pluginName: string) {
    const meta = JSON.parse(
        await readFile(path.join(getSourceDir(), pluginName, 'manifest.json'), { encoding: 'utf-8' })
    );

    console.log(`Building plugin ${pluginName}...`);
    const bundle = await rollup({
        input: await resolveEntryFile(pluginName),
        external: ['uuid'],
        plugins: [
            nodeResolve({ preferBuiltins: true }),
            postcss({ inject: false }),
            ts(),
            commonjs(),
            json(),
            tranformBdPlugin({ meta, pluginName }),
            prettier({ tabWidth: 4, singleQuote: true, printWidth: 120, parser: 'babel' }),
        ],
    });

    await bundle.write({
        file: path.join(getOuputDir(pluginName), `${pluginName}.plugin.js`),
        format: 'cjs',
        exports: 'auto',
        inlineDynamicImports: true,
        externalLiveBindings: true,
    });
}
