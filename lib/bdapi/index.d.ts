export type ModuleFilter = (module: any) => boolean;

import type { ReactNode } from 'react';
/**
 * A callback that modifies method logic.
 * This callback is called on each call of the original method and is provided all data about original call.
 * Any of the data can be modified if necessary, but do so wisely.
 * @param {Object} data Data object with information about current call and original method that you may need in your patching callback.
 * @param {any} thisObject
 * @returns Makes sense only when used as `instead` parameter in `monkeyPatch`. If something other than `undefined` is returned, the returned value replaces the value of `data.returnValue`.
 * If used as `before` or `after` parameters, return value is ignored.
 */
export type MonkeyPatchFunction = (data: {
    thisObject: any;
    methodArguments: any[];
    CancelPatch: () => void;
    originalMethod: (...args: any[]) => any;
    callOriginalMethod: (...args: any[]) => any;
    returnValue: any;
}) => any;

/**
 * {@link Patcher} is a utility class for modifying existing functions.
 * @type Patcher
 */
export * as Patcher from './Patcher';

/**
 * {@link Webpack} is a utility class for getting internal webpack modules.
 * @type Webpack
 */
export * as Webpack from './Webpack';

/**
 * The React module being used inside Discord.
 * @type React
 * */
export * as React from 'react';

/**
 * The ReactDOM module being used inside Discord.
 * @type ReactDOM
 */
export * as ReactDOM from 'react-dom';

/**
 * A reference object to get BD's settings.
 * @type object
 * @deprecated
 */
export const settings: any;

/**
 * A reference object for BD's emotes.
 * @type object
 * @deprecated
 */
export const emotes: any;

/**
 * A reference string for BD's version.
 * @type string
 */
export const version: string;

/**
 * Adds a `<style>` to the document with the given ID.
 *
 * @param {string} id ID to use for style element
 * @param {string} css CSS to apply to the document
 */
export function injectCSS(css: string): void;

/**
 * Removes a `<style>` from the document corresponding to the given ID.
 *
 * @param {string} id ID uses for the style element
 */
export function clearCSS(): void;

/**
 * Automatically creates and links a remote JS script.
 *
 * @deprecated
 * @param {string} id ID of the script element
 * @param {string} url URL of the remote script
 * @returns {Promise<Event>} Resolves upon onload event
 */
export function linkJS(id: string, url: string): Promise<Event>;

/**
 * Removes a remotely linked JS script.
 *
 * @deprecated
 * @param {string} id ID of the script element
 */
export function unlinkJS(id: string): void;

/**
 * Shows a generic but very customizable modal.
 *
 * @param {string} title title of the modal
 * @param {ReactNode} content a string of text to display in the modal
 */
export function alert(title: string, content: ReactNode): void;

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
export function showConfirmationModal(
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
export function showToast(
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
export function showNotice(
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
export function findModule(filter: ModuleFilter): any | undefined;

/**
 * Finds multple webpack modules using a filter
 *
 * @deprecated
 * @param {function} filter A filter given the exports, module, and moduleId. Returns true if the module matches.
 * @returns {Array} Either an array of matching modules or an empty array
 */
export function findAllModules(filter: ModuleFilter): any[];

/**
 * Finds a webpack module by own properties
 *
 * @deprecated
 * @param {...string} props Any desired properties
 * @returns {any} Either the matching module or `undefined`
 */
export function findModuleByProps(...props: string[]): any | undefined;

/**
 * Finds a webpack module by own prototypes
 *
 * @deprecated
 * @param {...string} protos Any desired prototype properties
 * @returns {any} Either the matching module or `undefined`
 */
export function findModuleByPrototypes(...protos: string[]): any | undefined;

/**
 * Finds a webpack module by displayName property
 *
 * @deprecated
 * @param {string} name Desired displayName property
 * @returns {any} Either the matching module or `undefined`
 */
export function findModuleByDisplayName(name: string): any | undefined;

/**
 * Get the internal react data of a specified node
 *
 * @param {HTMLElement} node Node to get the react data from
 * @returns {object|undefined} Either the found data or `undefined`
 */
export function getInternalInstance(node: HTMLElement): any | undefined;

/**
 * Loads previously stored data.
 *
 * @param {string} key Which piece of data to load
 * @returns {any} The stored data
 */
export function loadData(key: string): any;

/**
 * Loads previously stored data.
 * @alias loadData
 *
 * @param {string} key Which piece of data to load
 * @returns {any} The stored data
 * */
export function getData(key: string): any;

/**
 * Saves JSON-serializable data.
 *
 * @param {string} key Which piece of data to store
 * @param {any} data The data to be saved
 */
export function saveData(key: string, data: any): void;

/**
 * Saves JSON-serializable data
 * @alias saveData
 *
 * @param {string} key Which piece of data to store
 * @param {any} data The data to be saved
 */
export function setData(key: string, data: any): void;

/**
 * Deletes a piece of stored data, this is different than saving as null or undefined.
 *
 * @param {string} key Which piece of data to delete
 */
export function deleteData(key: string): void;

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
export function monkeyPatch(
    what: any,
    methodName: string,
    options: {
        once?: boolean;
        silent?: boolean;
        displayName?: string;
        before?: MonkeyPatchFunction;
        after?: MonkeyPatchFunction;
        instead?: MonkeyPatchFunction;
    }
);

/**
 * Adds a listener for when the node is removed from the document body.
 *
 * @param {HTMLElement} node Node to be observed
 * @param {function} callback Function to run when fired
 */
export function onRemoved(node: HTMLElement, callback: (event: Event) => void);

/**
 * Wraps a given function in a `try..catch` block.
 *
 * @deprecated
 * @param {function} method Function to wrap
 * @param {string} message Additional messasge to print when an error occurs
 * @returns {function} The new wrapped function
 */
export function suppressErrors<T extends CallableFunction>(method: T, message: string): T;

/**
 * Tests a given object to determine if it is valid JSON.
 *
 * @deprecated
 * @param {object} data Data to be tested
 * @returns {boolean} Result of the test
 */
export function testJSON(data: any): boolean;

/**
 * Gets a specific setting's status from BD
 *
 * @deprecated
 * @param {string} [collection="settings"] Collection ID
 * @param {string} category Category ID in the collection
 * @param {string} id Setting ID in the category
 * @returns {boolean} If the setting is enabled
 */
export function isSettingEnabled(collection: string, category: string, id: string): boolean;

/**
 * Enable a BetterDiscord setting by ids.
 *
 * @deprecated
 * @param {string} [collection="settings"] Collection ID
 * @param {string} category Category ID in the collection
 * @param {string} id Setting ID in the category
 */
export function enableSetting(collection: string, category: string, id: string): void;

/**
 * Disables a BetterDiscord setting by ids.
 *
 * @deprecated
 * @param {string} [collection="settings"] Collection ID
 * @param {string} category Category ID in the collection
 * @param {string} id Setting ID in the category
 */
export function disableSetting(collection: string, category: string, id: string): void;

/**
 * Toggle a BetterDiscord setting by ids.
 *
 * @deprecated
 * @param {string} [collection="settings"] Collection ID
 * @param {string} category Category ID in the collection
 * @param {string} id Setting ID in the category
 */
export function toggleSetting(collection: string, category: string, id: string): void;

/**
 * Gets some data in BetterDiscord's misc data.
 *
 * @deprecated
 * @param {string} key Key of the data to load.
 * @returns {any} The stored data
 */
export function getBDData(key: string): any;

/**
 * Gets some data in BetterDiscord's misc data.
 *
 * @deprecated
 * @param {string} key Key of the data to load.
 * @returns {any} The stored data
 */
export function setBDData(key: string, data: any): void;

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
export function openDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue>;

/**
 * An instance of {@link AddonAPI} to access plugins.
 * @type AddonAPI
 */
export const Plugins: AddonAPI;

/**
 * An instance of {@link AddonAPI} to access themes.
 * @type AddonAPI
 */
export const Themes: AddonAPI;

/**
 * `AddonAPI` is a utility class for working with plugins and themes. Instances are accessible through the {@link BdApi}.
 */
interface AddonAPI {
    /**
     * The path to the addon folder.
     * @type string
     */
    readonly folder: string;

    /**
     * Determines if a particular adon is enabled.
     * @param {string} idOrFile Addon id or filename.
     * @returns {boolean}
     */
    readonly isEnabled(idOrFile: string): boolean;

    /**
     * Enables the given addon.
     * @param {string} idOrFile Addon id or filename.
     */
    readonly enable(idOrAddon: string): void;

    /**
     * Disables the given addon.
     * @param {string} idOrFile Addon id or filename.
     */
    readonly disable(idOrAddon: string): void;

    /**
     * Toggles if a particular addon is enabled.
     * @param {string} idOrFile Addon id or filename.
     */
    readonly toggle(idOrAddon: string): void;

    /**
     * Reloads if a particular addon is enabled.
     * @param {string} idOrFile Addon id or filename.
     */
    readonly reload(idOrFileOrAddon: string): void;

    /**
     * Gets a particular addon.
     * @param {string} idOrFile Addon id or filename.
     * @returns {object} Addon instance
     */
    readonly get(idOrFile: string): any;

    /**
     * Gets all addons of this type.
     * @returns {Array<object>} Array of all addon instances
     */
    readonly getAll(): any[];
}

interface OpenDialogOptions {
    title?: string;
    defaultPath?: string;
    /**
     * Custom label for the confirmation button, when left empty the default label will
     * be used.
     */
    buttonLabel?: string;
    filters?: FileFilter[];
    /**
     * Contains which features the dialog should use. The following values are
     * supported:
     */
    properties?: Array<
        | 'openFile'
        | 'openDirectory'
        | 'multiSelections'
        | 'showHiddenFiles'
        | 'createDirectory'
        | 'promptToCreate'
        | 'noResolveAliases'
        | 'treatPackageAsDirectory'
        | 'dontAddToRecent'
    >;
    /**
     * Message to display above input boxes.
     *
     * @platform darwin
     */
    message?: string;
    /**
     * Create security scoped bookmarks when packaged for the Mac App Store.
     *
     * @platform darwin,mas
     */
    securityScopedBookmarks?: boolean;
}

interface FileFilter {
    // Docs: https://electronjs.org/docs/api/structures/file-filter

    extensions: string[];
    name: string;
}

interface OpenDialogReturnValue {
    /**
     * whether or not the dialog was canceled.
     */
    canceled: boolean;
    /**
     * An array of file paths chosen by the user. If the dialog is cancelled this will
     * be an empty array.
     */
    filePaths: string[];
    /**
     * An array matching the `filePaths` array of base64 encoded strings which contains
     * security scoped bookmark data. `securityScopedBookmarks` must be enabled for
     * this to be populated. (For return values, see table here.)
     *
     * @platform darwin,mas
     */
    bookmarks?: string[];
}
