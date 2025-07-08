import { Mutable, Executor, Func } from "./typeCore";

// PromiseState
export type PromiseStatus = "pending" | "fulfilled" | "rejected";

// TrackablePromise
export type WatchablePromise<T = void> = PromiseLike<T> & {
    readonly status?: PromiseStatus;
    readonly settled?: boolean;
    readonly result?: T;
};

// WatchableFn
export type WatchableFunc<TArgs extends any[] = any[], T = any> = Func<TArgs, T> & {
    executing?: boolean; // running/inProgress/pending
};

// we need promise wrapper because Promise [[PromiseState]] and [[PromiseResult]] symbols are not accessible
// exec and watch/track
export function watch<T = void>(fn: Executor<T>) {
    // type PromiseExecutorType = ConstructorParameters<typeof Promise<Awaited<T>>>[0];
    let resolve!: (value: Awaited<T>) => void;
    // let resolve: Parameters<PromiseExecutorType>[0];
    let reject!: (reason: any) => void;
    // let reject: Parameters<PromiseExecutorType>[1];

    const promise: Mutable<WatchablePromise<Awaited<T>>> = new Promise<Awaited<T>>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    promise.status = "pending";
    // TODO: create type-safe defineProperty utility method
    Object.defineProperty(promise, "settled" satisfies keyof typeof promise, {
        get: () => promise.status !== "pending"
    });

    (async () => {
        try {
            const retValue = (await Promise.resolve(fn())) as Awaited<T>;
            resolve(retValue);
            promise.result = retValue;
            promise.status = "fulfilled";
        } catch (err) {
            reject(err);
            promise.result = undefined;
            promise.status = "rejected";
        }
    })();

    return promise as WatchablePromise<Awaited<T>>;
}

// TODO: add Promise.prototype.finally support

// toTrackable
/** wrap to watchable func */
export function toWatchable<TArgs extends any[] = any[], T = void>(fn: Func<TArgs, T>): WatchableFunc<TArgs, T> {
    // result
    let watchable: Func<TArgs, T> & {
        executing?: boolean; // running/inProgress/pending
    };
    const complete = (err?: any) => {
        watchable.executing = false;
        // watchable result.executing;
        if (err) {
            // err instanceof Error
            throw err; // need to rethrow!
        }
    };
    watchable = (...args) => {
        watchable.executing = true;
        let isAsyncFn = false;
        try {
            const fnResult = fn(...args);
            if (fnResult instanceof Promise) {
                isAsyncFn = true;
                fnResult.catch(complete);
                fnResult.then(complete);
            }
            return fnResult;
        } finally {
            if (!isAsyncFn) {
                complete();
            }
        }
    };
    return watchable;
}
