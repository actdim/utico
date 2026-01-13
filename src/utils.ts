import { v4 as uuid } from "uuid";

// @filename: util.ts

// export function guid() {
//     function s4() {
//         return Math.floor((1 + Math.random()) * 0x10000)
//             .toString(16)
//             .substring(1);
//     }
//     return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
// }

export const normalize = (v: number) => (!v || !isFinite(v) ? 0 : v);

// numericalOr
export function numericOr(...values: number[]) {
    for (const value of values) {
        if (value != undefined) {
            return value;
        }
    }
    return undefined;
}

// funcArgCacheKeyResolver(Provider/Builder)
export const buildFuncArgCacheKey = (() => {
    const weakMap = new WeakMap<any, string>();
    return (...args: any[]) => {
        const keys: string[] = [];
        for (const arg of args) {
            let key: string = undefined;
            if (typeof arg === "number" || typeof arg === "string" || typeof arg === "boolean" || arg == undefined) {
                key = "" + arg;
            } else {
                key = weakMap.get(arg);
                if (!key) {
                    key = uuid();
                    weakMap.set(arg, key);
                }
            }
            keys.push(key);
        }
        return `"${keys.join("/")}"`;
    };
})();

export const delay = (ms: number) => {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
};

// scheduleError
export const delayError = (ms: number, errFactory?: () => Error) => {
    return new Promise<never>((_, reject) =>
        setTimeout(
            () => {
                // Do not throw!
                const err = errFactory ? errFactory() : new Error("Timeout exceeded");
                reject(err);
            },
            ms
        )
    );
};

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    // return new Promise((resolve, reject) => {
    //   const timer = setTimeout(() => reject(new Error('Timeout exceeded')), ms);
    //   promise.then((value) => {
    //     clearTimeout(timer);
    //     resolve(value);
    //   }, reject);
    // });
    return Promise.race([delayError(ms), promise]);
}

/**
 * Search node in a tree
 * @param predicate filter
 * @param childSelector
 * @param treeNodes
 */
export function searchTree<T>(treeNodes: T[], predicate: (item: T) => boolean, childSelector: (item: T) => T[]) {
    if (!treeNodes) {
        return undefined;
    }
    for (const treeNode of treeNodes) {
        if (predicate(treeNode)) {
            return treeNode;
        }
        const node = searchTree(childSelector(treeNode), predicate, childSelector);
        if (node) {
            return node;
        }
    }
    return undefined;
}

export const suppressConsole = (action: () => void) => {
    const origConsole: any = {};
    const result: {
        method: keyof Console;
        args: any[];
    }[] = [];
    const keys: (keyof Console)[] = ["log" /*, "debug", "warn", "info"*/];
    for (const key of keys) {
        origConsole[key] = console[key];
        console[key] = function (...args: any[]) {
            result.push({
                method: key,
                args: args
            });
        } as any;
    }
    try {
        action();
    } finally {
        for (const key of keys) {
            console[key] = origConsole[key];
        }
    }
    return result;
};

export function removePrefix(str: string, prefixes: string[]): string {
    let removed = true;
    while (removed) {
        removed = false;
        for (const prefix of prefixes) {
            if (prefix && str.startsWith(prefix)) {
                str = str.slice(prefix.length);
                removed = true;
                break;
            }
        }
    }
    return str;
}

export function removeSuffix(str: string, suffixes: string[]): string {
    let removed = true;
    while (removed) {
        removed = false;
        for (const suffix of suffixes) {
            if (suffix && str.endsWith(suffix)) {
                str = str.slice(0, -suffix.length);
                removed = true;
                break;
            }
        }
    }
    return str;
}

// another comparator example
// const deepEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);
// depEffect
export function memoEffect<TDep, TResult>(
    getValue: () => TDep, // getDep
    callback: (v: TDep) => TResult, // onChange/action
    comparator: (a: TDep, b: TDep) => boolean = (a, b) => a === b // equals
) {
    let val: TDep | undefined;
    let initialized = false;
    let retVal: TResult;
    return () => {
        const next = getValue();
        if (!initialized || !comparator(next, val!)) {
            val = next;
            initialized = true;
            retVal = callback(next);
        }
        return retVal;
    };
}

export function lazy<T>(factory: () => T): () => T {
    let instance: T | undefined;
    let initialized = false;

    return () => {
        if (!initialized) {
            instance = factory();
            initialized = true;
        }
        return instance!;
    };
}

export function makeNonEnumerable<T>(obj: T, propertyNames: (keyof T)[]) {
    let propertyDescriptorMap: PropertyDescriptorMap = {};
    for (const propertyName of propertyNames) {
        propertyDescriptorMap[propertyName] = {
            enumerable: false
        };
    }
    Object.defineProperties(obj, propertyDescriptorMap);
}

// TODO:
/*
function getMetadata<T>(
    store: WeakMap<object, Map<PropertyKey, T>>,
    target: object,
    prop: PropertyKey,
): T | undefined {
    return store.get(target)?.get(prop) as T | undefined;
}

function setMetadata<T>(
    store: WeakMap<object, Map<PropertyKey, T>>,
    target: object,
    prop: PropertyKey,
    value: T,
) {
    let propMap = store.get(target);
    if (!propMap) {
        propMap = new Map();
        store.set(target, propMap);
    }
    propMap.set(prop, value);
}

function hasMetadata(
    store: WeakMap<object, Map<PropertyKey, any>>,
    target: object,
    prop: PropertyKey,
): boolean {
    return store.get(target)?.has(prop) ?? false;
}
*/

/*
export function memoizeThrottle<T extends Func>(
    func: T,
    wait = 0,
    options?: Parameters<typeof _.throttle<T>>[2],
    resolver?: Parameters<typeof _.memoize<(...args: Parameters<T>) => ReturnType<typeof _.throttle<T>>>>[1]
) {
    const mem = _.memoize<(...args: Parameters<T>) => ReturnType<typeof _.throttle<T>>>(() => {
        return _.throttle<T>(func, wait, options);
    }, resolver);

    return (...args: Parameters<T>) => {
        return mem(...args)(...args);
    };
}

export function memoizeDebounce<T extends Func>(
    func: T,
    wait = 0,
    options?: Parameters<typeof _.debounce<T>>[2],
    resolver?: Parameters<typeof _.memoize<(...args: Parameters<T>) => ReturnType<typeof _.debounce<T>>>>[1]
) {
    const mem = _.memoize<(...args: Parameters<T>) => ReturnType<typeof _.debounce<T>>>(() => {
        return _.debounce<T>(func, wait, options);
    }, resolver);

    return (...args: Parameters<T>) => {
        return mem(...args)(...args);
    };
}
*/
