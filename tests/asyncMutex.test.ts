import { describe, it, expect } from "vitest";
import { AsyncMutex } from "@/asyncMutex";

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ─── lock ─────────────────────────────────────────────────────────────────────

describe("AsyncMutex.lock", () => {
    it("resolves with an unlock function", async () => {
        const mutex = new AsyncMutex();
        const unlock = await mutex.lock();
        expect(typeof unlock).toBe("function");
        unlock();
    });

    it("allows immediate re-lock after unlock", async () => {
        const mutex = new AsyncMutex();
        const unlock1 = await mutex.lock();
        unlock1();
        const unlock2 = await mutex.lock();
        unlock2();
    });

    it("blocks a second lock until the first is released", async () => {
        const mutex = new AsyncMutex();
        const log: string[] = [];

        const unlock1 = await mutex.lock();

        const pending = mutex.lock().then(unlock2 => {
            log.push("second acquired");
            unlock2();
        });

        log.push("first held");
        unlock1();
        await pending;

        expect(log).toEqual(["first held", "second acquired"]);
    });

    it("queues multiple waiters and releases them in order", async () => {
        const mutex = new AsyncMutex();
        const log: number[] = [];

        const unlock1 = await mutex.lock();
        const p2 = mutex.lock().then(u => { log.push(2); u(); });
        const p3 = mutex.lock().then(u => { log.push(3); u(); });

        log.push(1);
        unlock1();
        await Promise.all([p2, p3]);

        expect(log).toEqual([1, 2, 3]);
    });

    it("blocks tryLock while held", async () => {
        const mutex = new AsyncMutex();
        const unlock = await mutex.lock();
        expect(mutex.tryLock()).toBeNull();
        unlock();
    });

    it("allows tryLock after unlock", async () => {
        const mutex = new AsyncMutex();
        const unlock = await mutex.lock();
        unlock();
        // tryLock() should return a function, not null, when the mutex is free
        expect(mutex.tryLock()).not.toBeNull();
    });

    it("rejects with timeout error when lock is held past the deadline", async () => {
        const mutex = new AsyncMutex();
        const unlock = await mutex.lock();

        await expect(mutex.lock(20)).rejects.toThrow("Mutex lock timeout");

        unlock();
    });

    it("restores usability after a timeout", async () => {
        const mutex = new AsyncMutex();
        const unlock = await mutex.lock();

        await expect(mutex.lock(20)).rejects.toThrow("Mutex lock timeout");

        unlock();

        // mutex must still be acquirable after the failed attempt
        const unlock2 = await mutex.lock();
        expect(typeof unlock2).toBe("function");
        unlock2();
    });
});

// ─── tryLock ──────────────────────────────────────────────────────────────────

describe("AsyncMutex.tryLock", () => {
    it("returns a function (not null) when not locked", () => {
        const mutex = new AsyncMutex();
        const unlock = mutex.tryLock();
        expect(typeof unlock).toBe("function");
    });

    it("returns null when already locked via lock()", async () => {
        const mutex = new AsyncMutex();
        const unlock = await mutex.lock();
        expect(mutex.tryLock()).toBeNull();
        unlock();
    });

    it("returns null when a second tryLock() is called while locked", () => {
        const mutex = new AsyncMutex();
        const unlock = mutex.tryLock();
        expect(typeof unlock).toBe("function");
        expect(mutex.tryLock()).toBeNull();
    });

    it("returns a function after lock() unlock", async () => {
        const mutex = new AsyncMutex();
        const unlock = await mutex.lock();
        unlock();
        expect(typeof mutex.tryLock()).toBe("function");
    });
});

// ─── dispatch ─────────────────────────────────────────────────────────────────

describe("AsyncMutex.dispatch", () => {
    it("returns the value produced by the executor", async () => {
        const mutex = new AsyncMutex();
        const result = await mutex.dispatch(() => 42);
        expect(result).toBe(42);
    });

    it("works with an async executor", async () => {
        const mutex = new AsyncMutex();
        const result = await mutex.dispatch(async () => {
            await delay(0);
            return "done";
        });
        expect(result).toBe("done");
    });

    it("propagates errors thrown by the executor", async () => {
        const mutex = new AsyncMutex();
        await expect(
            mutex.dispatch(() => { throw new Error("boom"); })
        ).rejects.toThrow("boom");
    });

    it("propagates rejections from async executors", async () => {
        const mutex = new AsyncMutex();
        await expect(
            mutex.dispatch(async () => { throw new Error("async fail"); })
        ).rejects.toThrow("async fail");
    });

    it("releases the lock even when the executor throws", async () => {
        const mutex = new AsyncMutex();

        await expect(
            mutex.dispatch(() => { throw new Error("kaboom"); })
        ).rejects.toThrow();

        // lock must be available again immediately
        const unlock = await mutex.lock();
        expect(typeof unlock).toBe("function");
        unlock();
    });

    it("serializes concurrent dispatch calls", async () => {
        const mutex = new AsyncMutex();
        const log: number[] = [];

        await Promise.all([
            mutex.dispatch(async () => {
                log.push(1);
                await delay(20);
                log.push(2);
            }),
            mutex.dispatch(async () => {
                log.push(3);
                await delay(0);
                log.push(4);
            }),
        ]);

        expect(log).toEqual([1, 2, 3, 4]);
    });

    it("rejects with timeout error when the lock cannot be acquired in time", async () => {
        const mutex = new AsyncMutex();
        const unlock = await mutex.lock();

        await expect(mutex.dispatch(() => {}, 20)).rejects.toThrow("Mutex lock timeout");

        unlock();
    });

    it("allows dispatch after a timed-out dispatch", async () => {
        const mutex = new AsyncMutex();
        const unlock = await mutex.lock();

        await expect(mutex.dispatch(() => {}, 20)).rejects.toThrow("Mutex lock timeout");

        unlock();

        const result = await mutex.dispatch(() => "recovered");
        expect(result).toBe("recovered");
    });
});
