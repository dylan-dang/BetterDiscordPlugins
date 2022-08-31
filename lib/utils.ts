export type BindedObject<Object> = {
    [Key in keyof Object]: Object[Key] extends (firstArgument: any, ...args: infer Args) => infer ReturnValue
        ? (...args: Args) => ReturnValue
        : Object[Key];
};

export function BindObject<T, P extends (keyof T & string)[]>(object: T, firstArgument: any, pick?: P) {
    const pickSet = pick && new Set<string>(pick);
    const entries = pickSet ? Object.entries(object).filter(([key]) => pickSet.has(key)) : Object.entries(object);
    return Object.fromEntries(
        entries.map(([key, value]) => [key, typeof value === 'function' ? value.bind(null, firstArgument) : value])
    ) as Pick<BindedObject<T>, P[number]>;
}
