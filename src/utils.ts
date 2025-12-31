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

export const delayAsync = (ms: number) => {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
};

// scheduleErrorAsync
export const delayErrorAsync = (ms: number, errFactory?: () => Error) => {
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

export function withTimeoutAsync<T>(promise: Promise<T>, ms: number): Promise<T> {
    // return new Promise((resolve, reject) => {
    //   const timer = setTimeout(() => reject(new Error('Timeout exceeded')), ms);
    //   promise.then((value) => {
    //     clearTimeout(timer);
    //     resolve(value);
    //   }, reject);
    // });
    return Promise.race([delayErrorAsync(ms), promise]);
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
