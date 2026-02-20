import { Executor } from './typeCore';
/**
 * Example:
 * const mutex = new Mutex();
 * await mutex.dispatch(async () => {...});
 */
// type Executor<T> = () => Promise<T> | T;

class AsyncMutex { // or Mutex
    private mutex = Promise.resolve();

    private locked = false;

    async lock(timeoutMs?: number): Promise<() => void> {
        let begin: (unlock: () => void) => void = () => { };
        let timer: ReturnType<typeof setTimeout> | undefined;

        const previous = this.mutex;
        this.mutex = this.mutex.then(() => new Promise(begin));
        this.locked = true;

        const lockPromise = new Promise<() => void>((resolve, reject) => {
            begin = resolve;

            if (timeoutMs) {
                timer = setTimeout(() => {
                    reject(new Error("Mutex lock timeout"));
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
            this.mutex = previous;
            this.locked = false;
            throw err;
        }
    }

    tryLock(): (() => void) | null {
        if (this.locked) return null;

        this.locked = true;
        let resolve!: () => void;
        const promise = new Promise<void>(res => { resolve = res; });
        this.mutex = this.mutex.then(() => promise);
        return () => {
            this.locked = false;
            resolve();
        };
    }

    async dispatch<T>(fn: Executor<T>, timeoutMs?: number): Promise<T> {
        const unlock = await this.lock(timeoutMs);
        try {
            return await fn();
        } finally {
            unlock();
        }
    }
}


export {
    AsyncMutex
};