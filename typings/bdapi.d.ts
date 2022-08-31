/**
 * @version 1.6.0
 */

import type * as ReactInstance from 'react';
import type * as ReactDOMInstance from 'react-dom';
import type { OpenDialogOptions } from 'electron';
import type { ReactNode } from 'react';

declare global {
    const BdApi: Readonly<BdApi>;
    interface Window {
        BdApi: Readonly<BdApi>;
    }
}
/**
 * A callback that modifies method logic.
 * This callback is called on each call of the original method and is provided all data about original call.
 * Any of the data can be modified if necessary, but do so wisely.
 * @param {Object} data Data object with information about current call and original method that you may need in your patching callback.
 * @param {any} thisObject
 * @returns Makes sense only when used as `instead` parameter in `monkeyPatch`. If something other than `undefined` is returned, the returned value replaces the value of `data.returnValue`.
 * If used as `before` or `after` parameters, return value is ignored.
 */
export type PatchFunction = (data: {
    thisObject: any;
    methodArguments: any[];
    CancelPatch: () => void;
    originalMethod: (...args: any[]) => any;
    callOriginalMethod: (...args: any[]) => any;
    returnValue: any;
}) => any;

export type ModuleFilter = (module: any) => boolean;

export interface BdApi {
    /**
     * The React module being used inside Discord.
     * @type React
     * */
    React: typeof ReactInstance;

    /**
     * The ReactDOM module being used inside Discord.
     * @type ReactDOM
     */
    ReactDOM: typeof ReactDOMInstance;

    /**
     * A reference object to get BD's settings.
     * @type object
     * @deprecated
     */
    settings: any;

    /**
     * A reference object for BD's emotes.
     * @type object
     * @deprecated
     */
    emotes: any;

    /**
     * A reference string for BD's version.
     * @type string
     */
    version: string;

    /**
     * Adds a `<style>` to the document with the given ID.
     *
     * @param {string} id ID to use for style element
     * @param {string} css CSS to apply to the document
     */
    injectCSS(id: string, css: string): void;

    /**
     * Removes a `<style>` from the document corresponding to the given ID.
     *
     * @param {string} id ID uses for the style element
     */
    clearCSS(id: string): void;

    /**
     * Automatically creates and links a remote JS script.
     *
     * @deprecated
     * @param {string} id ID of the script element
     * @param {string} url URL of the remote script
     * @returns {Promise<Event>} Resolves upon onload event
     */
    linkJS(id: string, url: string): Promise<Event>;

    /**
     * Removes a remotely linked JS script.
     *
     * @deprecated
     * @param {string} id ID of the script element
     */
    unlinkJS(id: string): void;

    /**
     * Shows a generic but very customizable modal.
     *
     * @param {string} title title of the modal
     * @param {ReactNode} content a string of text to display in the modal
     */
    alert(title: string, content: ReactNode): void;

    /**
     * Shows a generic but very customizable confirmation modal with optional confirm and cancel callbacks.
     *
     * @param {string} title title of the modal
     * @param {ReactNode} children a single or mixed array of react elements and strings. Everything is wrapped in Discord's `TextElement` component so strings will show and render properly.
     * @param {object} [options] options to modify the modal
     * @param {boolean} [options.danger=false] whether the main button should be red or not
     * @param {string} [options.confirmText=Okay] text for the confirmation/submit button
     * @param {string} [options.cancelText=Cancel] text for the cancel button
     * @param {callable} [options.onConfirm=NOOP] callback to occur when clicking the submit button
     * @param {callable} [options.onCancel=NOOP] callback to occur when clicking the cancel button
     */
    showConfirmationModal(
        title: string,
        content: ReactNode,
        options?: {
            danger?: boolean;
            confirmText?: boolean;
            cancelText?: boolean;
            onConfirm?(): void;
            onCancel?(): void;
        }
    ): void;

    /**
     * This shows a toast similar to android towards the bottom of the screen.
     *
     * @param {string} content The string to show in the toast.
     * @param {object} [options] Options object. Optional parameter.
     * @param {string} [options.type=""] Changes the type of the toast stylistically and semantically. Choices: "", "info", "success", "danger"/"error", "warning"/"warn". Default: ""
     * @param {boolean} [options.icon=true] Determines whether the icon should show corresponding to the type. A toast without type will always have no icon. Default: true
     * @param {number} [options.timeout=3000] Adjusts the time (in ms) the toast should be shown for before disappearing automatically. Default: 3000
     * @param {boolean} [options.forceShow=false] Whether to force showing the toast and ignore the bd setting
     */
    showToast(
        content: string,
        options?: {
            type?: string;
            icon?: boolean;
            timeout?: number;
            forceShow?: boolean;
        }
    ): boolean;

    /**
     * Show a notice above discord's chat layer.
     *
     * @param {string|Node} content Content of the notice
     * @param {object} options Options for the notice.
     * @param {string} [options.type="info" | "error" | "warning" | "success"] Type for the notice. Will affect the color.
     * @param {Array<{label: string, onClick: function}>} [options.buttons] Buttons that should be added next to the notice text.
     * @param {number} [options.timeout=10000] Timeout until the notice is closed. Won't fire if it's set to 0;
     * @returns {function}
     */
    showNotice(
        content: string | Node,
        options: {
            type: 'info' | 'error' | 'warning' | 'success';
            buttons?: {
                label: string;
                onClick(event?: Event): void;
            }[];
            timeout?: number;
        }
    ): () => void;

    /**
     * Finds a webpack module using a filter
     *
     * @deprecated
     * @param {function} filter A filter given the exports, module, and moduleId. Returns true if the module matches.
     * @returns {any} Either the matching module or `undefined`
     */
    findModule(filter: ModuleFilter): any | undefined;

    /**
     * Finds multple webpack modules using a filter
     *
     * @deprecated
     * @param {function} filter A filter given the exports, module, and moduleId. Returns true if the module matches.
     * @returns {Array} Either an array of matching modules or an empty array
     */
    findAllModules(filter: ModuleFilter): any[];

    /**
     * Finds a webpack module by own properties
     *
     * @deprecated
     * @param {...string} props Any desired properties
     * @returns {any} Either the matching module or `undefined`
     */
    findModuleByProps(...props: string[]): any | undefined;

    /**
     * Finds a webpack module by own prototypes
     *
     * @deprecated
     * @param {...string} protos Any desired prototype properties
     * @returns {any} Either the matching module or `undefined`
     */
    findModuleByPrototypes(...protos: string[]): any | undefined;

    /**
     * Finds a webpack module by displayName property
     *
     * @deprecated
     * @param {string} name Desired displayName property
     * @returns {any} Either the matching module or `undefined`
     */
    findModuleByDisplayName(name: string): any | undefined;

    /**
     * Get the internal react data of a specified node
     *
     * @param {HTMLElement} node Node to get the react data from
     * @returns {object|undefined} Either the found data or `undefined`
     */
    getInternalInstance(node: HTMLElement): any | undefined;

    /**
     * Loads previously stored data.
     *
     * @param {string} pluginName Name of the plugin loading data
     * @param {string} key Which piece of data to load
     * @returns {any} The stored data
     */
    loadData(pluginName: string, key: string): any;

    /**
     * Loads previously stored data.
     * @alias loadData
     *
     * @param {string} pluginName Name of the plugin loading data
     * @param {string} key Which piece of data to load
     * @returns {any} The stored data
     * */
    getData(pluginName: string, key: string): any;

    /**
     * Saves JSON-serializable data.
     *
     * @param {string} pluginName Name of the plugin saving data
     * @param {string} key Which piece of data to store
     * @param {any} data The data to be saved
     */
    saveData(pluginName: string, key: string, data: any): void;

    /**
     * Saves JSON-serializable data
     * @alias saveData
     *
     * @param {string} pluginName Name of the plugin saving data
     * @param {string} key Which piece of data to store
     * @param {any} data The data to be saved
     */
    setData(pluginName: string, key: string, data: any): void;

    /**
     * Deletes a piece of stored data, this is different than saving as null or undefined.
     *
     * @param {string} pluginName Name of the plugin deleting data
     * @param {string} key Which piece of data to delete
     */
    deleteData(pluginName: string, key: string): void;

    /**
     * This function monkey-patches a method on an object. The patching callback may be run before, after or instead of target method.
     *
     *  - Be careful when monkey-patching. Think not only about original functionality of target method and your changes, but also about developers of other plugins, who may also patch this method before or after you. Try to change target method behaviour as little as possible, and avoid changing method signatures.
     *  - Display name of patched method is changed, so you can see if a function has been patched (and how many times) while debugging or in the stack trace. Also, patched methods have property `__monkeyPatched` set to `true`, in case you want to check something programmatically.
     *
     * @deprecated
     * @param {object} what Object to be patched. You can can also pass class prototypes to patch all class instances.
     * @param {string} methodName Name of the function to be patched.
     * @param {object} options Options object to configure the patch.
     * @param {function} [options.after] Callback that will be called after original target method call. You can modify return value here, so it will be passed to external code which calls target method. Can be combined with `before`.
     * @param {function} [options.before] Callback that will be called before original target method call. You can modify arguments here, so it will be passed to original method. Can be combined with `after`.
     * @param {function} [options.instead] Callback that will be called instead of original target method call. You can get access to original method using `originalMethod` parameter if you want to call it, but you do not have to. Can't be combined with `before` or `after`.
     * @param {boolean} [options.once=false] Set to `true` if you want to automatically unpatch method after first call.
     * @param {boolean} [options.silent=false] Set to `true` if you want to suppress log messages about patching and unpatching.
     * @returns {function} A function that cancels the monkey patch
     */
    monkeyPatch(
        what: any,
        methodName: string,
        options: {
            once?: boolean;
            silent?: boolean;
            displayName?: string;
            before?: PatchFunction;
            after?: PatchFunction;
            instead?: PatchFunction;
        }
    );

    /**
     * Adds a listener for when the node is removed from the document body.
     *
     * @param {HTMLElement} node Node to be observed
     * @param {function} callback Function to run when fired
     */
    onRemoved(node: HTMLElement, callback: (event: Event) => void);

    /**
     * Wraps a given function in a `try..catch` block.
     *
     * @deprecated
     * @param {function} method Function to wrap
     * @param {string} message Additional messasge to print when an error occurs
     * @returns {function} The new wrapped function
     */
    suppressErrors<T extends CallableFunction>(method: T, message: string): T;

    /**
     * Tests a given object to determine if it is valid JSON.
     *
     * @deprecated
     * @param {object} data Data to be tested
     * @returns {boolean} Result of the test
     */
    testJSON(data: any): boolean;

    /**
     * Gets a specific setting's status from BD
     *
     * @deprecated
     * @param {string} [collection="settings"] Collection ID
     * @param {string} category Category ID in the collection
     * @param {string} id Setting ID in the category
     * @returns {boolean} If the setting is enabled
     */
    isSettingEnabled(collection: string, category: string, id: string): boolean;

    /**
     * Enable a BetterDiscord setting by ids.
     *
     * @deprecated
     * @param {string} [collection="settings"] Collection ID
     * @param {string} category Category ID in the collection
     * @param {string} id Setting ID in the category
     */
    enableSetting(collection: string, category: string, id: string): void;

    /**
     * Disables a BetterDiscord setting by ids.
     *
     * @deprecated
     * @param {string} [collection="settings"] Collection ID
     * @param {string} category Category ID in the collection
     * @param {string} id Setting ID in the category
     */
    disableSetting(collection: string, category: string, id: string): void;

    /**
     * Toggle a BetterDiscord setting by ids.
     *
     * @deprecated
     * @param {string} [collection="settings"] Collection ID
     * @param {string} category Category ID in the collection
     * @param {string} id Setting ID in the category
     */
    toggleSetting(collection: string, category: string, id: string): void;

    /**
     * Gets some data in BetterDiscord's misc data.
     *
     * @deprecated
     * @param {string} key Key of the data to load.
     * @returns {any} The stored data
     */
    getBDData(key: string): any;

    /**
     * Gets some data in BetterDiscord's misc data.
     *
     * @deprecated
     * @param {string} key Key of the data to load.
     * @returns {any} The stored data
     */
    setBDData(key: string, data: any): void;

    /**
     * Gives access to the [Electron Dialog](https://www.electronjs.org/docs/latest/api/dialog/) api.
     * Returns a `Promise` that resolves to an `object` that has a `boolean` cancelled and a `filePath` string for saving and a `filePaths` string array for opening.
     *
     * @param {object} options Options object to configure the dialog.
     * @param {"open"|"save"} [options.mode="open"] Determines whether the dialog should open or save files.
     * @param {string} [options.defaultPath=~] Path the dialog should show on launch.
     * @param {Array<object<string, string[]>>} [options.filters=[]] An array of [file filters](https://www.electronjs.org/docs/latest/api/structures/file-filter).
     * @param {string} [options.title] Title for the titlebar.
     * @param {string} [options.message] Message for the dialog.
     * @param {boolean} [options.showOverwriteConfirmation=false] Whether the user should be prompted when overwriting a file.
     * @param {boolean} [options.showHiddenFiles=false] Whether hidden files should be shown in the dialog.
     * @param {boolean} [options.promptToCreate=false] Whether the user should be prompted to create non-existant folders.
     * @param {boolean} [options.openDirectory=false] Whether the user should be able to select a directory as a target.
     * @param {boolean} [options.openFile=true] Whether the user should be able to select a file as a target.
     * @param {boolean} [options.multiSelections=false] Whether the user should be able to select multiple targets.
     * @param {boolean} [options.modal=false] Whether the dialog should act as a modal to the main window.
     * @returns {Promise<object>} Result of the dialog
     */
    openDialog(options: OpenDialogOptions);

    /**
     * {@link Patcher} is a utility class for modifying existing functions.
     * @type Patcher
     */
    Patcher: Readonly<Patcher>;

    /**
     * {@link Webpack} is a utility class for getting internal webpack modules.
     * @type Webpack
     */
    Webpack: Readonly<Webpack>;

    /**
     * An instance of {@link AddonAPI} to access plugins.
     * @type AddonAPI
     */
    Plugins: Readonly<AddonAPI>;

    /**
     * An instance of {@link AddonAPI} to access themes.
     * @type AddonAPI
     */
    Themes: Readonly<AddonAPI>;
}

/**
 * A callback that modifies method logic.
 * This callback is called on each call of the original method and is provided all data about original call.
 * Any of the data can be modified if necessary, but do so wisely.
 * @param {Object} thisObject `this` in the context of the original function.
 * @param {IArguments} arguments The original arguments of the original function.
 * @param {any} extraValue `undefined` for `before` patches, `originalFunction` for `instead` patches. and `returnValue` for `after` patches.
 * @returns {any} Makes sense only when using an instead or after patch. If something other than undefined is returned, the returned value replaces the value of returnValue. If used for before the return value is ignored.
 */
export type PatchCallback<Extra> = (thisObject: any, arguments: any, extraValue: Extra) => any;

/**
 * `Patcher` is a utility class for modifying existing functions. Instance is accessible through the {@link BdApi}.
 * This is extremely useful for modifying the internals of Discord by adjusting return value or React renders, or arguments of internal functions.
 */
export interface Patcher {
    /**
     * This method patches onto another function, allowing your code to run beforehand.
     * Using this, you are also able to modify the incoming arguments before the original method is run.
     * @param {string} caller Name of the caller of the patch function.
     * @param {object} moduleToPatch Object with the function to be patched. Can also be an object's prototype.
     * @param {string} functionName Name of the function to be patched.
     * @param {function} callback Function to run before the original method. The function is given the `this` context and the `arguments` of the original function.
     * @returns {function} Function that cancels the original patch.
     */
    before<T, N extends { [K in keyof T]: T[K] extends CallableFunction ? K : never }[keyof T]>(
        caller: string,
        moduleToPatch: T,
        functionName: N,
        callback: PatchCallback<undefined>
    ): () => void;

    /**
     * This method patches onto another function, allowing your code to run instead.
     * Using this, you are also able to modify the return value, using the return of your code instead.
     * @param {string} caller Name of the caller of the patch function.
     * @param {object} moduleToPatch Object with the function to be patched. Can also be an object's prototype.
     * @param {string} functionName Name of the function to be patched.
     * @param {function} callback Function to run before the original method. The function is given the `this` context, `arguments` of the original function, and also the original function.
     * @returns {function} Function that cancels the original patch.
     */
    instead<T, N extends { [K in keyof T]: T[K] extends CallableFunction ? K : never }[keyof T]>(
        caller: string,
        moduleToPatch: T,
        functionName: N,
        callback: PatchCallback<T[N]>
    ): () => void;

    /**
     * This method patches onto another function, allowing your code to run instead. Using this, you are also able to modify the return value, using the return of your code instead.
     * @param {string} caller Name of the caller of the patch function.
     * @param {object} moduleToPatch Object with the function to be patched. Can also be an object's prototype.
     * @param {string} functionName Name of the function to be patched.
     * @param {function} callback Function to run after the original method. The function is given the `this` context, the `arguments` of the original function, and the `return` value of the original function.
     * @returns {function} Function that cancels the original patch.
     */
    after<T, N extends { [K in keyof T]: T[K] extends CallableFunction ? K : never }[keyof T]>(
        caller: string,
        moduleToPatch: T,
        functionName: N,
        callback: PatchCallback<T[N] extends (...args: any) => infer R ? R : never>
    ): () => void;

    /**
     * Returns all patches by a particular caller. The patches all have an `unpatch()` method.
     * @param {string} caller ID of the original patches
     * @returns {Array<Object>} Array of all the patch objects.
     */
    getPatchesByCaller(caller: string): {
        callback(...args: any[]): any;
        caller: string;
        id: number;
        type: 'instead' | 'before' | 'after';
        unpatch(): void;
    }[];

    /**
     * Automatically cancels all patches created with a specific ID.
     * @param {string} caller ID of the original patches
     */
    unpatchAll(caller: string): void;
}

/**
 * Series of {@link Filters} to be used for finding webpack modules.
 */
export interface Filters {
    /**
     * Generates a function that filters by a set of properties.
     * @param {...string} props List of property names
     * @returns {function} A filter that checks for a set of properties
     */
    byProps(...props: string[]): ModuleFilter;

    /**
     * Generates a function that filters by a set of properties on the object's prototype.
     * @param {...string} props List of property names
     * @returns {function} A filter that checks for a set of properties on the object's prototype.
     */
    byPrototypeFields(...props: string[]): ModuleFilter;

    /**
     * Generates a function that filters by a regex.
     * @param {RegExp} search A RegExp to check on the module
     * @param {function} filter Additional filter
     * @returns {function} A filter that checks for a regex match
     */
    byRegex(regex: RegExp, filter: ModuleFilter): ModuleFilter;

    /**
     * Generates a function that filters by strings.
     * @param {...String} strings A list of strings
     * @returns {function} A filter that checks for a set of strings
     */
    byStrings(...strings: string[]): ModuleFilter;

    /**
     * Generates a function that filters by a set of properties.
     * @param {string} name Name the module should have
     * @returns {function} A filter that checks for a set of properties
     */
    byDisplayName(name: string): ModuleFilter;

    /**
     * Generates a combined function from a list of filters.
     * @param {...function} filters A list of filters
     * @returns {function} Combinatory filter of all arguments
     */
    combine(...filters: ModuleFilter[]): ModuleFilter;
}

/**
 * `Webpack` is a utility class for getting internal webpack modules. Instance is accessible through the {@link BdApi}.
 * This is extremely useful for interacting with the internals of Discord.
 */
export interface Webpack {
    /**
     * Series of {@link Filters} to be used for finding webpack modules.
     * @type Filters
     */
    Filters: Readonly<Filters>;

    /**
     * Finds a module using a filter function.
     * @param {function} filter A function to use to filter modules. It is given exports, module, and moduleID. Return true to signify match.
     * @param {object} [options] Whether to return only the first matching module
     * @param {Boolean} [options.first=true] Whether to return only the first matching module
     * @param {Boolean} [options.defaultExport=true] Whether to return default export when matching the default export
     * @return {any}
     */
    getModule(
        filter: ModuleFilter,
        options?: {
            first?: boolean;
            defaultExport?: boolean;
        }
    ): any;

    /**
     * Finds multiple modules using multiple filters.
     *
     * @param {...object} queries Whether to return only the first matching module
     * @param {Function} queries.filter A function to use to filter modules
     * @param {Boolean} [queries.first=true] Whether to return only the first matching module
     * @param {Boolean} [queries.defaultExport=true] Whether to return default export when matching the default export
     * @return {any}
     */
    getBulk(...queries: { filter: ModuleFilter; first?: boolean; defaultExport?: boolean }[]): any[];

    /**
     * Finds a module that lazily loaded.
     * @param {function} filter A function to use to filter modules. It is given exports. Return true to signify match.
     * @param {object} [options] Whether to return only the first matching module
     * @param {AbortSignal} [options.signal] AbortSignal of an AbortController to cancel the promise
     * @param {Boolean} [options.defaultExport=true] Whether to return default export when matching the default export
     * @returns {Promise<any>}
     */
    waitForModule(
        filter: ModuleFilter,
        options?: {
            signal: AbortSignal;
            defaultExport?: boolean;
        }
    ): Promise<any>;
}

/**
 * `AddonAPI` is a utility class for working with plugins and themes. Instances are accessible through the {@link BdApi}.
 */
export interface AddonAPI {
    /**
     * The path to the addon folder.
     * @type string
     */
    folder: string;

    /**
     * Determines if a particular adon is enabled.
     * @param {string} idOrFile Addon id or filename.
     * @returns {boolean}
     */
    isEnabled(idOrFile: string): boolean;

    /**
     * Enables the given addon.
     * @param {string} idOrFile Addon id or filename.
     */
    enable(idOrAddon: string): void;

    /**
     * Disables the given addon.
     * @param {string} idOrFile Addon id or filename.
     */
    disable(idOrAddon: string): void;

    /**
     * Toggles if a particular addon is enabled.
     * @param {string} idOrFile Addon id or filename.
     */
    toggle(idOrAddon: string): void;

    /**
     * Reloads if a particular addon is enabled.
     * @param {string} idOrFile Addon id or filename.
     */
    reload(idOrFileOrAddon: string): void;

    /**
     * Gets a particular addon.
     * @param {string} idOrFile Addon id or filename.
     * @returns {object} Addon instance
     */
    get(idOrFile: string): any;

    /**
     * Gets all addons of this type.
     * @returns {Array<object>} Array of all addon instances
     */
    getAll(): any[];
}
