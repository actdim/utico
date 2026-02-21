import { describe, it, expect } from "vitest";
import { watch, toWatchable } from "@/watchable";
import { delay } from "@/utils";

// ─── watch ────────────────────────────────────────────────────────────────────

describe("watch", () => {
    it("status is 'pending' synchronously after creation", () => {
        const p = watch(() => new Promise<void>(() => {})); // never resolves
        expect(p.status).toBe("pending");
    });

    it("settled is false while pending", () => {
        const p = watch(() => new Promise<void>(() => {}));
        expect(p.settled).toBe(false);
    });

    it("status becomes 'fulfilled' after resolution", async () => {
        const p = watch(() => Promise.resolve(42));
        await p;
        expect(p.status).toBe("fulfilled");
    });

    it("settled becomes true after resolution", async () => {
        const p = watch(() => Promise.resolve());
        await p;
        expect(p.settled).toBe(true);
    });

    it("result holds the resolved value", async () => {
        const p = watch(() => Promise.resolve({ x: 1 }));
        await p;
        expect(p.result).toEqual({ x: 1 });
    });

    it("status becomes 'rejected' after the executor rejects", async () => {
        const p = watch(() => Promise.reject(new Error("fail")));
        await p.then(null, () => {}); // consume rejection
        expect(p.status).toBe("rejected");
    });

    it("result is undefined after rejection", async () => {
        const p = watch(() => Promise.reject(new Error("fail")));
        await p.then(null, () => {});
        expect(p.result).toBeUndefined();
    });

    it("settled is true after rejection", async () => {
        const p = watch(() => Promise.reject(new Error("fail")));
        await p.then(null, () => {});
        expect(p.settled).toBe(true);
    });

    it("propagates the rejection when awaited", async () => {
        const p = watch(() => { throw new Error("oops"); });
        await expect(p).rejects.toThrow("oops");
    });

    it("works with a sync executor", async () => {
        const p = watch(() => 99);
        await p;
        expect(p.result).toBe(99);
        expect(p.status).toBe("fulfilled");
    });

    it("settled transitions: false -> true", async () => {
        const p = watch(() => delay(10).then(() => 1));
        expect(p.settled).toBe(false);
        await p;
        expect(p.settled).toBe(true);
    });
});

// ─── toWatchable ──────────────────────────────────────────────────────────────

describe("toWatchable", () => {
    it("executing is falsy before any call", () => {
        const fn = toWatchable(() => {});
        expect(fn.executing).toBeFalsy();
    });

    it("executing is true while an async function is running", async () => {
        const fn = toWatchable(() => delay(30));
        fn();
        expect(fn.executing).toBe(true);
        await delay(60);
    });

    it("executing becomes false after async completion", async () => {
        const fn = toWatchable(() => delay(10));
        fn();
        await delay(40); // wait for completion and .then() microtask
        expect(fn.executing).toBe(false);
    });

    it("executing is false immediately after a sync call", () => {
        const fn = toWatchable(() => 42);
        fn();
        expect(fn.executing).toBe(false);
    });

    it("returns the value from the wrapped sync function", () => {
        const fn = toWatchable((x: number) => x * 2);
        expect(fn(5)).toBe(10);
    });

    it("propagates synchronous errors", () => {
        const fn = toWatchable(() => { throw new Error("sync-fail"); });
        expect(() => fn()).toThrow("sync-fail");
    });

    it("executing is false after a sync throw", () => {
        const fn = toWatchable(() => { throw new Error("err"); });
        try { fn(); } catch {}
        expect(fn.executing).toBe(false);
    });
});
