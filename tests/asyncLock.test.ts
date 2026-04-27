import { describe, it, expect } from "vitest";
import { AsyncLock } from "@/asyncLock";

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ─── lock ─────────────────────────────────────────────────────────────────────

describe("AsyncLock.lock", () => {
    it("resolves with an unlock function", async () => {
        const lock = new AsyncLock();
        const unlock = await lock.lock();
        expect(typeof unlock).toBe("function");
        unlock();
    });

    it("allows immediate re-lock after unlock", async () => {
        const lock = new AsyncLock();
        const unlock1 = await lock.lock();
        unlock1();
        const unlock2 = await lock.lock();
        unlock2();
    });

    it("blocks a second lock until the first is released", async () => {
        const lock = new AsyncLock();
        const log: string[] = [];

        const unlock1 = await lock.lock();

        const pending = lock.lock().then(unlock2 => {
            log.push("second acquired");
            unlock2();
        });

        log.push("first held");
        unlock1();
        await pending;

        expect(log).toEqual(["first held", "second acquired"]);
    });

    it("queues multiple waiters and releases them in order", async () => {
        const lock = new AsyncLock();
        const log: number[] = [];

        const unlock1 = await lock.lock();
        const p2 = lock.lock().then(u => { log.push(2); u(); });
        const p3 = lock.lock().then(u => { log.push(3); u(); });

        log.push(1);
        unlock1();
        await Promise.all([p2, p3]);

        expect(log).toEqual([1, 2, 3]);
    });

    it("blocks tryLock while held", async () => {
        const lock = new AsyncLock();
        const unlock = await lock.lock();
        expect(lock.tryLock()).toBeNull();
        unlock();
    });

    it("allows tryLock after unlock", async () => {
        const lock = new AsyncLock();
        const unlock = await lock.lock();
        unlock();
        expect(lock.tryLock()).not.toBeNull();
    });

    it("rejects with timeout error when lock is held past the deadline", async () => {
        const lock = new AsyncLock();
        const unlock = await lock.lock();

        await expect(lock.lock(20)).rejects.toThrow("Lock timeout");

        unlock();
    });

    it("restores usability after a timeout", async () => {
        const lock = new AsyncLock();
        const unlock = await lock.lock();

        await expect(lock.lock(20)).rejects.toThrow("Lock timeout");

        unlock();

        const unlock2 = await lock.lock();
        expect(typeof unlock2).toBe("function");
        unlock2();
    });
});

// ─── tryLock ──────────────────────────────────────────────────────────────────

describe("AsyncLock.tryLock", () => {
    it("returns a function (not null) when not locked", () => {
        const lock = new AsyncLock();
        const unlock = lock.tryLock();
        expect(typeof unlock).toBe("function");
    });

    it("returns null when already locked via lock()", async () => {
        const lock = new AsyncLock();
        const unlock = await lock.lock();
        expect(lock.tryLock()).toBeNull();
        unlock();
    });

    it("returns null when a second tryLock() is called while locked", () => {
        const lock = new AsyncLock();
        const unlock = lock.tryLock();
        expect(typeof unlock).toBe("function");
        expect(lock.tryLock()).toBeNull();
    });

    it("returns a function after lock() unlock", async () => {
        const lock = new AsyncLock();
        const unlock = await lock.lock();
        unlock();
        expect(typeof lock.tryLock()).toBe("function");
    });
});

// ─── dispatch ─────────────────────────────────────────────────────────────────

describe("AsyncLock.dispatch", () => {
    it("returns the value produced by the executor", async () => {
        const lock = new AsyncLock();
        const result = await lock.dispatch(() => 42);
        expect(result).toBe(42);
    });

    it("works with an async executor", async () => {
        const lock = new AsyncLock();
        const result = await lock.dispatch(async () => {
            await delay(0);
            return "done";
        });
        expect(result).toBe("done");
    });

    it("propagates errors thrown by the executor", async () => {
        const lock = new AsyncLock();
        await expect(
            lock.dispatch(() => { throw new Error("boom"); })
        ).rejects.toThrow("boom");
    });

    it("propagates rejections from async executors", async () => {
        const lock = new AsyncLock();
        await expect(
            lock.dispatch(async () => { throw new Error("async fail"); })
        ).rejects.toThrow("async fail");
    });

    it("releases the lock even when the executor throws", async () => {
        const lock = new AsyncLock();

        await expect(
            lock.dispatch(() => { throw new Error("kaboom"); })
        ).rejects.toThrow();

        const unlock = await lock.lock();
        expect(typeof unlock).toBe("function");
        unlock();
    });

    it("serializes concurrent dispatch calls", async () => {
        const lock = new AsyncLock();
        const log: number[] = [];

        await Promise.all([
            lock.dispatch(async () => {
                log.push(1);
                await delay(20);
                log.push(2);
            }),
            lock.dispatch(async () => {
                log.push(3);
                await delay(0);
                log.push(4);
            }),
        ]);

        expect(log).toEqual([1, 2, 3, 4]);
    });

    it("rejects with timeout error when the lock cannot be acquired in time", async () => {
        const lock = new AsyncLock();
        const unlock = await lock.lock();

        await expect(lock.dispatch(() => {}, 20)).rejects.toThrow("Lock timeout");

        unlock();
    });

    it("allows dispatch after a timed-out dispatch", async () => {
        const lock = new AsyncLock();
        const unlock = await lock.lock();

        await expect(lock.dispatch(() => {}, 20)).rejects.toThrow("Lock timeout");

        unlock();

        const result = await lock.dispatch(() => "recovered");
        expect(result).toBe("recovered");
    });
});
