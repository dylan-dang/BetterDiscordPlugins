import type { ModuleFilter } from '..';

/**
 * Generates a function that filters by a set of properties.
 * @param {...string} props List of property names
 * @returns {function} A filter that checks for a set of properties
 */
export function byProps(...props: string[]): ModuleFilter;

/**
 * Generates a function that filters by a set of properties on the object's prototype.
 * @param {...string} props List of property names
 * @returns {function} A filter that checks for a set of properties on the object's prototype.
 */
export function byPrototypeFields(...props: string[]): ModuleFilter;

/**
 * Generates a function that filters by a regex.
 * @param {RegExp} search A RegExp to check on the module
 * @param {function} filter Additional filter
 * @returns {function} A filter that checks for a regex match
 */
export function byRegex(regex: RegExp, filter: ModuleFilter): ModuleFilter;

/**
 * Generates a function that filters by strings.
 * @param {...String} strings A list of strings
 * @returns {function} A filter that checks for a set of strings
 */
export function byStrings(...strings: string[]): ModuleFilter;

/**
 * Generates a function that filters by a set of properties.
 * @param {string} name Name the module should have
 * @returns {function} A filter that checks for a set of properties
 */
export function byDisplayName(name: string): ModuleFilter;

/**
 * Generates a combined function from a list of filters.
 * @param {...function} filters A list of filters
 * @returns {function} Combinatory filter of all arguments
 */
export function combine(...filters: ModuleFilter[]): ModuleFilter;
