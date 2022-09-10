type MethodName<T> = { [K in keyof T]: T[K] extends CallableFunction ? K : never }[keyof T];

/**
 * A callback that modifies method logic.
 * This callback is called on each call of the original method and is provided all data about original call.
 * Any of the data can be modified if necessary, but do so wisely.
 * @param {Object} thisObject `this` in the context of the original function.
 * @param {IArguments} arguments The original arguments of the original function.
 * @param {any} extraValue `undefined` for `before` patches, `originalFunction` for `instead` patches. and `returnValue` for `after` patches.
 * @returns {any} Makes sense only when using an instead or after patch. If something other than undefined is returned, the returned value replaces the value of returnValue. If used for before the return value is ignored.
 */
export type PatchCallback<Method, Extra> = (
    thisObject: any,
    arguments: Parameters<Method>,
    extraValue: Extra
) => ReturnValue<Method> | undefined;

/**
 * This method patches onto another function, allowing your code to run beforehand.
 * Using this, you are also able to modify the incoming arguments before the original method is run.
 * @param {object} moduleToPatch Object with the function to be patched. Can also be an object's prototype.
 * @param {string} functionName Name of the function to be patched.
 * @param {function} callback Function to run before the original method. The function is given the `this` context and the `arguments` of the original function.
 * @returns {function} Function that cancels the original patch.
 */
export function before<T, N extends MethodName<T>>(
    moduleToPatch: T,
    functionName: N,
    callback: PatchCallback<T[N], undefined>
): () => void;

/**
 * This method patches onto another function, allowing your code to run instead.
 * Using this, you are also able to modify the return value, using the return of your code instead.
 * @param {object} moduleToPatch Object with the function to be patched. Can also be an object's prototype.
 * @param {string} functionName Name of the function to be patched.
 * @param {function} callback Function to run before the original method. The function is given the `this` context, `arguments` of the original function, and also the original function.
 * @returns {function} Function that cancels the original patch.
 */
export function instead<T, N extends MethodName<T>>(
    moduleToPatch: T,
    functionName: N,
    callback: PatchCallback<T[N], T[N]>
): () => void;

/**
 * This method patches onto another function, allowing your code to run instead. Using this, you are also able to modify the return value, using the return of your code instead.
 * @param {object} moduleToPatch Object with the function to be patched. Can also be an object's prototype.
 * @param {string} functionName Name of the function to be patched.
 * @param {function} callback Function to run after the original method. The function is given the `this` context, the `arguments` of the original function, and the `return` value of the original function.
 * @returns {function} Function that cancels the original patch.
 */
export function after<T, N extends MethodName<T>>(
    moduleToPatch: T,
    functionName: N,
    callback: PatchCallback<T[N], ReturnType<T[N]>>
): () => void;

/**
 * Returns all patches. The patches all have an `unpatch()` method.
 * @returns {Array<Object>} Array of all the patch objects.
 */
export function getPatchesByCaller(): {
    callback(...args: any[]): any;
    caller: string;
    id: number;
    type: 'instead' | 'before' | 'after';
    unpatch(): void;
}[];

/**
 * Automatically cancels all patches
 */
export function unpatchAll(): void;
