/**
 * This method patches onto another function, allowing your code to run beforehand.
 * Using this, you are also able to modify the incoming arguments before the original method is run.
 * @param {object} moduleToPatch Object with the function to be patched. Can also be an object's prototype.
 * @param {string} functionName Name of the function to be patched.
 * @param {function} callback Function to run before the original method. The function is given the `this` context and the `arguments` of the original function.
 * @returns {function} Function that cancels the original patch.
 */
export function before<T, N extends { [K in keyof T]: T[K] extends CallableFunction ? K : never }[keyof T]>(
    moduleToPatch: T,
    functionName: N,
    callback: PatchCallback<undefined>
): () => void;

/**
 * This method patches onto another function, allowing your code to run instead.
 * Using this, you are also able to modify the return value, using the return of your code instead.
 * @param {object} moduleToPatch Object with the function to be patched. Can also be an object's prototype.
 * @param {string} functionName Name of the function to be patched.
 * @param {function} callback Function to run before the original method. The function is given the `this` context, `arguments` of the original function, and also the original function.
 * @returns {function} Function that cancels the original patch.
 */
export function instead<T, N extends { [K in keyof T]: T[K] extends CallableFunction ? K : never }[keyof T]>(
    moduleToPatch: T,
    functionName: N,
    callback: PatchCallback<T[N]>
): () => void;

/**
 * This method patches onto another function, allowing your code to run instead. Using this, you are also able to modify the return value, using the return of your code instead.
 * @param {object} moduleToPatch Object with the function to be patched. Can also be an object's prototype.
 * @param {string} functionName Name of the function to be patched.
 * @param {function} callback Function to run after the original method. The function is given the `this` context, the `arguments` of the original function, and the `return` value of the original function.
 * @returns {function} Function that cancels the original patch.
 */
export function after<T, N extends { [K in keyof T]: T[K] extends CallableFunction ? K : never }[keyof T]>(
    moduleToPatch: T,
    functionName: N,
    callback: PatchCallback<T[N] extends (...args: any) => infer R ? R : never>
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