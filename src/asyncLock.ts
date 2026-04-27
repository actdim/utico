import { Executor } from './typeCore';
/**
 * Example:
 * const lock = new AsyncLock();
 * await lock.dispatch(async () => {...});
 */

export let defaultLockTimeout = 1000 * 5; // 5 seconds

class AsyncLock {
    private queue = Promise.resolve();

    private locked = false;

    async lock(timeoutMs = defaultLockTimeout): Promise<() => void> {
        let begin: (unlock: () => void) => void = () => { };
        let timer: ReturnType<typeof setTimeout> | undefined;

        const previous = this.queue;
        this.queue = this.queue.then(() => new Promise(begin));
        this.locked = true;

        const lockPromise = new Promise<() => void>((resolve, reject) => {
            begin = resolve;

            if (timeoutMs) {
                timer = setTimeout(() => {
                    reject(new Error("Lock timeout"));
                }, timeoutMs);
            }
        });

        try {
            const unlock = await lockPromise;
            clearTimeout(timer);
            return () => {
                this.locked = false;
                unlock();
            };
        } catch (err) {
            this.queue = previous;
            this.locked = false;
            throw err;
        }
    }

    tryLock(): (() => void) | null {
        if (this.locked) return null;

        this.locked = true;
        let resolve!: () => void;
        const promise = new Promise<void>(res => { resolve = res; });
        this.queue = this.queue.then(() => promise);
        return () => {
            this.locked = false;
            resolve();
        };
    }

    async dispatch<T>(fn: Executor<T>, timeoutMs = defaultLockTimeout): Promise<T> {
        const unlock = await this.lock(timeoutMs);
        try {
            return await fn();
        } finally {
            unlock();
        }
    }
}


export {
    AsyncLock
};
