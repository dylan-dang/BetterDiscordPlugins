/**
 * Series of {@link Filters} to be used for finding webpack modules.
 * @type Filters
 */
export * as Filters from './Filters';

/**
 * Finds a module using a filter function.
 * @param {function} filter A function to use to filter modules. It is given exports, module, and moduleID. Return true to signify match.
 * @param {object} [options] Whether to return only the first matching module
 * @param {Boolean} [options.first=true] Whether to return only the first matching module
 * @param {Boolean} [options.defaultExport=true] Whether to return default export when matching the default export
 * @return {any}
 */
export function getModule(
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
export function getBulk(...queries: { filter: ModuleFilter; first?: boolean; defaultExport?: boolean }[]): any[];

/**
 * Finds a module that lazily loaded.
 * @param {function} filter A function to use to filter modules. It is given exports. Return true to signify match.
 * @param {object} [options] Whether to return only the first matching module
 * @param {AbortSignal} [options.signal] AbortSignal of an AbortController to cancel the promise
 * @param {Boolean} [options.defaultExport=true] Whether to return default export when matching the default export
 * @returns {Promise<any>}
 */
export function waitForModule(
    filter: ModuleFilter,
    options?: {
        signal: AbortSignal;
        defaultExport?: boolean;
    }
): Promise<any>;