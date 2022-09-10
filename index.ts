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
        const distDir = path.join(__dirname, 'dist');
        return pluginName ? path.join(distDir, pluginName) : distDir;
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

function createMeta(meta: any): Plugin {
    return {
        name: 'create-meta',
        renderChunk(code) {
            const fields = Object.entries(meta).map(([key, value]) => ` * @${key} ${value}`);
            return ['/**', ...fields, ' */', code].join('\n');
        },
    };
}

function propertyChain(...chain: string[]) {
    return chain.map((val): t.Expression => t.identifier(val)).reduce((prev, curr) => t.memberExpression(prev, curr));
}

const moduleReplacements: Record<string, t.Expression> = {
    react: propertyChain('BdApi', 'React'),
    'react-dom': propertyChain('BdApi', 'ReactDOM'),
    bdapi: t.identifier('BdApi'),
    'bdapi/patcher': propertyChain('BdApi', 'Patcher'),
    'bdapi/webpack': propertyChain('BdApi', 'Webpack'),
    'bdapi/webpack/filters': propertyChain('BdApi', 'Webpack', 'Filters'),
};

function getRootObject(path: NodePath<t.Node>) {
    while (path.isMemberExpression()) path = path.get('object');
    return path;
}

function originatesFromBdApi(path: NodePath<t.Node>): boolean {
    while (true) {
        const rootObject = getRootObject(path);
        if (rootObject.isCallExpression()) {
            // used when import bdapi from default
            const callee = rootObject.get('callee');
            if (!callee.isIdentifier()) return false;
            // _interopDefaultLegacy can't be shadowed
            if (callee.node.name !== '_interopDefaultLegacy') return false;
            const [interopModule] = rootObject.get('arguments');
            if (!interopModule.isExpression()) return false;
            path = interopModule;
            continue;
        }
        if (!rootObject.isIdentifier()) return false;
        if (rootObject.node.name == 'BdApi' && !path.scope.hasBinding('BdApi')) return true;
        const binding = path.scope.getBinding(rootObject.node.name);
        if (!binding) return false;
        // assume variable is not mutated
        if (!binding.path.isVariableDeclarator()) return false; // could be a parameter
        const init = binding.path.get('init');
        if (!init.isExpression()) return false;
        path = init;
    }
}

function tranformBdPlugin(pluginName: string): Plugin {
    const bdMethodsToBind = new Set([
        'injectCSS',
        'clearCSS',
        'loadData',
        'getData',
        'saveData',
        'setData',
        'deleteData',
        'before',
        'instead',
        'after',
    ]);

    const pureBdMethods = new Set([
        'findModule',
        'findAllModules',
        'findModuleByProps',
        'findModuleByPrototypes',
        'findModuleByDisplayName',
        'getInternalInstance',
        'suppressErrors',
        'testJSON',
        'isSettingEnabled',
        'getBDData',
        'isEnabled',
        'get',
        'getAll',
        'getData',
        'getPatchesByCaller',
        'combine',
        'byDisplayName',
        'byStrings',
        'byRegex',
        'byPrototypeFields',
        'byProps',
        'getModule',
        'getBulk',
        'waitForModule',
    ]);

    function removeIfUnreferenced(path: NodePath, identifierKey: string): void {
        const identifier = path.get(identifierKey);
        if (Array.isArray(identifier) || !identifier.isIdentifier()) return;
        const binding = path.scope.getBinding(identifier.node.name);
        if (!binding || binding.referenced) return;
        path.remove();
    }

    return {
        name: 'transform-better-discord-plugin',
        renderChunk(code) {
            const ast = parse(code);
            traverse(ast, {
                Statement(path) {
                    // remove pure Bd methods when called alone as a statement
                    // (assumes method was not renamed and that arguments are also pure (cuz i'm lazy))
                    if (!path.isExpressionStatement()) return;
                    const expression = getRootObject(path.get('expression'));
                    if (!expression.isCallExpression()) return;
                    const callee = expression.get('callee');
                    const lastMember = callee.isMemberExpression() ? callee.get('property') : callee;
                    if (!lastMember.isIdentifier()) return;
                    if (!pureBdMethods.has(lastMember.node.name)) return;
                    if (!originatesFromBdApi(callee)) return;
                    path.remove();
                },
                VariableDeclarator(path) {
                    // remove unreferenced destructures (assumes getter is pure)
                    path.get('id').traverse({
                        ObjectProperty: (path) => removeIfUnreferenced(path, 'value'),
                        RestElement: (path) => removeIfUnreferenced(path, 'argument'),
                    });
                },
                CallExpression(path) {
                    // replace bdapi and react modules with BdApi UMD
                    const callee = path.get('callee');
                    if (!callee.isIdentifier()) return;
                    if (callee.node.name !== 'require') return;
                    if (path.scope.hasBinding('require')) return;
                    const [moduleName] = path.get('arguments');
                    if (!moduleName.isStringLiteral()) return;
                    if (!(moduleName.node.value in moduleReplacements)) return;
                    path.replaceWith(moduleReplacements[moduleName.node.value]);
                    path.skip();
                },
                MemberExpression(path) {
                    // binds BdApi methods (guaranteed to be accessed by property unless explicitly destructured)
                    const property = path.get('property');
                    if (!property.isIdentifier()) return;
                    if (!bdMethodsToBind.has(property.node.name)) return;
                    const object = path.get('object');
                    if (!originatesFromBdApi(object)) return;
                    path.replaceWith(
                        t.callExpression(t.memberExpression(path.node, t.identifier('bind')), [
                            t.nullLiteral(), // should use `object.node`, but BdApi doesn't use `this` so it's fine
                            t.stringLiteral(pluginName),
                        ])
                    );
                    path.skip();
                },
                Program(path) {
                    // add module.exports = () => exports to top of file
                    path.unshiftContainer(
                        'body',
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

            return generate(ast).code;
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
        external: Object.keys(moduleReplacements),
        plugins: [
            nodeResolve({ preferBuiltins: true }),
            postcss({ inject: false }),
            commonjs(),
            ts(),
            json(),
            createMeta(meta),
            tranformBdPlugin(pluginName),
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
