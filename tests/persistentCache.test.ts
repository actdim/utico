import { describe, it, expect, vi } from "vitest";
import { PersistentCache } from "@/cache/persistentCache";
import { CacheMetadataRecord } from "@/cache/cacheContracts";
import { delay } from "@/utils";

// ─── helpers ──────────────────────────────────────────────────────────────────

function uniqueName() {
    return `TestCache_${Math.random().toString(36).slice(2)}`;
}

async function openCache() {
    return PersistentCache.open(uniqueName());
}

// ─── PersistentCache ──────────────────────────────────────────────────────────

describe("PersistentCache", () => {

    // ─── constructor ──────────────────────────────────────────────────────────

    describe("constructor", () => {
        it("throws when name is empty", () => {
            expect(() => new PersistentCache("", undefined)).toThrow("Name cannot be empty");
        });
    });

    // ─── set / get ────────────────────────────────────────────────────────────

    describe("set / get", () => {
        it("stores and retrieves a value by key", async () => {
            const cache = await openCache();
            try {
                await cache.set({ key: "k1" }, { name: "Alice" }, {});
                const item = await cache.get<{ name: string }>("k1");
                expect(item.data.value).toEqual({ name: "Alice" });
                expect(item.metadata.key).toBe("k1");
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("auto-generates a UUID key when metadata.key is absent", async () => {
            const cache = await openCache();
            try {
                const meta: CacheMetadataRecord = {};
                await cache.set(meta, 42, {});
                expect(typeof meta.key).toBe("string");
                expect(meta.key.length).toBeGreaterThan(0);
                const item = await cache.get<number>(meta.key);
                expect(item.data.value).toBe(42);
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("stores primitive, array, and object values", async () => {
            const cache = await openCache();
            try {
                await cache.set({ key: "str" }, "hello", {});
                await cache.set({ key: "num" }, 3.14, {});
                await cache.set({ key: "arr" }, [1, 2, 3], {});
                expect((await cache.get<string>("str")).data.value).toBe("hello");
                expect((await cache.get<number>("num")).data.value).toBe(3.14);
                expect((await cache.get<number[]>("arr")).data.value).toEqual([1, 2, 3]);
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("throws when value is undefined", async () => {
            const cache = await openCache();
            try {
                await expect(cache.set({ key: "k1" }, undefined, {})).rejects.toThrow('Invalid parameter: "value"');
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("sets createdAt and updatedAt on create", async () => {
            const cache = await openCache();
            try {
                const before = Date.now();
                await cache.set({ key: "k1" }, "v", {});
                const item = await cache.get("k1");
                expect(item.metadata.createdAt).toBeGreaterThanOrEqual(before);
                expect(item.metadata.updatedAt).toBeGreaterThanOrEqual(before);
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("updates accessedAt on each get()", async () => {
            const cache = await openCache();
            try {
                await cache.set({ key: "k1" }, "v", {});
                const item1 = await cache.get("k1");
                const t1 = item1.metadata.accessedAt;
                await delay(5);
                const item2 = await cache.get("k1");
                expect(item2.metadata.accessedAt).toBeGreaterThan(t1);
            } finally {
                cache[Symbol.dispose]();
            }
        });
    });

    // ─── contains ─────────────────────────────────────────────────────────────

    describe("contains", () => {
        it("returns true for an existing key", async () => {
            const cache = await openCache();
            try {
                await cache.set({ key: "k1" }, "v", {});
                expect(await cache.contains("k1")).toBe(true);
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("returns false for a missing key", async () => {
            const cache = await openCache();
            try {
                expect(await cache.contains("nonexistent")).toBe(false);
            } finally {
                cache[Symbol.dispose]();
            }
        });
    });

    // ─── getKeys ──────────────────────────────────────────────────────────────

    describe("getKeys", () => {
        it("returns all stored keys", async () => {
            const cache = await openCache();
            try {
                await cache.set({ key: "k1" }, "v1", {});
                await cache.set({ key: "k2" }, "v2", {});
                const keys = (await cache.getKeys()).sort();
                expect(keys).toEqual(["k1", "k2"]);
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("returns an empty array for an empty cache", async () => {
            const cache = await openCache();
            try {
                expect(await cache.getKeys()).toHaveLength(0);
            } finally {
                cache[Symbol.dispose]();
            }
        });
    });

    // ─── delete / bulkDelete / clear ──────────────────────────────────────────

    describe("delete", () => {
        it("removes a single entry", async () => {
            const cache = await openCache();
            try {
                await cache.set({ key: "k1" }, "v1", {});
                await cache.set({ key: "k2" }, "v2", {});
                await cache.delete("k1");
                expect(await cache.contains("k1")).toBe(false);
                expect(await cache.contains("k2")).toBe(true);
            } finally {
                cache[Symbol.dispose]();
            }
        });
    });

    describe("bulkDelete", () => {
        it("removes multiple entries at once", async () => {
            const cache = await openCache();
            try {
                await cache.set({ key: "k1" }, "v1", {});
                await cache.set({ key: "k2" }, "v2", {});
                await cache.set({ key: "k3" }, "v3", {});
                await cache.bulkDelete(["k1", "k2"]);
                expect(await cache.contains("k1")).toBe(false);
                expect(await cache.contains("k2")).toBe(false);
                expect(await cache.contains("k3")).toBe(true);
            } finally {
                cache[Symbol.dispose]();
            }
        });
    });

    describe("clear", () => {
        it("removes all entries", async () => {
            const cache = await openCache();
            try {
                await cache.set({ key: "k1" }, "v1", {});
                await cache.set({ key: "k2" }, "v2", {});
                await cache.clear();
                expect(await cache.getKeys()).toHaveLength(0);
            } finally {
                cache[Symbol.dispose]();
            }
        });
    });

    // ─── sliding expiration ───────────────────────────────────────────────────
    //
    // NOTE: TTL and absoluteExpiration-only modes have a bug: onGetMetadata
    // initialises newExpiresAt to `record.expiresAt ?? now`, which for a new
    // record without a prior expiresAt evaluates to `now` regardless of the
    // absoluteExpiration value.  Only slidingExpiration forces
    // `newExpiresAt = now + slidingExpiration`, so expiry works correctly
    // only when slidingExpiration is provided.

    describe("sliding expiration", () => {
        it("sets expiresAt to now + slidingExpiration on create", async () => {
            const cache = await openCache();
            try {
                const before = Date.now();
                await cache.set({ key: "k1" }, "v", { slidingExpiration: 500 });
                const item = await cache.get("k1");
                expect(item.metadata.expiresAt).toBeGreaterThanOrEqual(before + 500 - 5);
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("extends expiresAt on each get()", async () => {
            const cache = await openCache();
            try {
                await cache.set({ key: "k1" }, "v", { slidingExpiration: 500 });
                const item1 = await cache.get("k1");
                const expiresAt1 = item1.metadata.expiresAt;
                await delay(5);
                const item2 = await cache.get("k1");
                expect(item2.metadata.expiresAt).toBeGreaterThan(expiresAt1);
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("caps expiresAt at absoluteExpiration", async () => {
            const cache = await openCache();
            try {
                const absoluteExp = Date.now() + 1000;
                await cache.set({ key: "k1" }, "v", {
                    slidingExpiration: 10_000,
                    absoluteExpiration: absoluteExp,
                });
                const item = await cache.get("k1");
                expect(item.metadata.expiresAt).toBeLessThanOrEqual(absoluteExp + 5);
            } finally {
                cache[Symbol.dispose]();
            }
        });
    });

    // ─── deleteExpired ────────────────────────────────────────────────────────

    describe("deleteExpired", () => {
        it("removes entries whose expiresAt is before the given timestamp", async () => {
            const cache = await openCache();
            try {
                const now = Date.now();
                await cache.set({ key: "k1" }, "v1", { slidingExpiration: 100 });
                await cache.set({ key: "k2" }, "v2", { slidingExpiration: 100 });
                await cache.deleteExpired(now + 500);
                expect(await cache.contains("k1")).toBe(false);
                expect(await cache.contains("k2")).toBe(false);
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("does not remove entries that have not yet expired", async () => {
            const cache = await openCache();
            try {
                const now = Date.now();
                await cache.set({ key: "k1" }, "v", { slidingExpiration: 10_000 });
                await cache.deleteExpired(now + 100);
                expect(await cache.contains("k1")).toBe(true);
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("uses Date.now() as default timestamp", async () => {
            const cache = await openCache();
            try {
                await cache.set({ key: "k1" }, "v", { slidingExpiration: 1 });
                await delay(10);
                await cache.deleteExpired();
                expect(await cache.contains("k1")).toBe(false);
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("fires the evict event with the expired records", async () => {
            const cache = await openCache();
            try {
                const now = Date.now();
                await cache.set({ key: "k1" }, "v1", { slidingExpiration: 100 });
                await cache.set({ key: "k2" }, "v2", { slidingExpiration: 100 });

                const evictedKeys: string[] = [];
                cache.addEventListener("evict", (e: any) => {
                    evictedKeys.push(...e.detail.records.map((r: any) => r.key));
                });

                await cache.deleteExpired(now + 500);
                expect(evictedKeys.sort()).toEqual(["k1", "k2"]);
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("does not fire the evict event when nothing has expired", async () => {
            const cache = await openCache();
            try {
                const now = Date.now();
                await cache.set({ key: "k1" }, "v", { slidingExpiration: 10_000 });
                const handler = vi.fn();
                cache.addEventListener("evict", handler);
                await cache.deleteExpired(now + 100);
                expect(handler).not.toHaveBeenCalled();
            } finally {
                cache[Symbol.dispose]();
            }
        });
    });

    // ─── bulkSet / bulkGet ────────────────────────────────────────────────────

    describe("bulkSet / bulkGet", () => {
        it("stores multiple entries and retrieves them by key", async () => {
            const cache = await openCache();
            try {
                const metaRecords: CacheMetadataRecord[] = [{ key: "k1" }, { key: "k2" }];
                const dataRecords = [
                    { key: "k1", value: "v1" },
                    { key: "k2", value: "v2" },
                ];
                await cache.bulkSet(metaRecords, dataRecords, () => ({}));
                const items = await cache.bulkGet(["k1", "k2"]);
                const valueMap = Object.fromEntries(items.map(i => [i.metadata.key, i.data?.value]));
                expect(valueMap).toEqual({ k1: "v1", k2: "v2" });
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("auto-generates keys for metadata records without a key", async () => {
            const cache = await openCache();
            try {
                const meta1: CacheMetadataRecord = {};
                const meta2: CacheMetadataRecord = {};
                await cache.bulkSet([meta1, meta2], [], () => ({}));
                expect(typeof meta1.key).toBe("string");
                expect(typeof meta2.key).toBe("string");
                expect(meta1.key).not.toBe(meta2.key);
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("throws when metadataRecords contains a null entry", async () => {
            const cache = await openCache();
            try {
                await expect(cache.bulkSet([null as any], [], () => ({}))).rejects.toThrow("Invalid metadata record");
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("throws when dataRecords contains an entry with an empty key or undefined value", async () => {
            const cache = await openCache();
            try {
                await expect(cache.bulkSet([], [{ key: "", value: undefined }], () => ({}))).rejects.toThrow("Invalid data record");
            } finally {
                cache[Symbol.dispose]();
            }
        });
    });

    // ─── getOrSet ─────────────────────────────────────────────────────────────

    describe("getOrSet", () => {
        it("throws when key is empty", async () => {
            const cache = await openCache();
            try {
                await expect(cache.getOrSet({} as CacheMetadataRecord, () => "v", {})).rejects.toThrow("Key cannot be empty");
            } finally {
                cache[Symbol.dispose]();
            }
        });

        it("returns the existing entry without calling the factory", async () => {
            const cache = await openCache();
            try {
                await cache.set({ key: "k1" }, "existing", {});
                const factory = vi.fn(() => "new");
                const item = await cache.getOrSet({ key: "k1" }, factory, {});
                expect(item.data.value).toBe("existing");
                expect(factory).not.toHaveBeenCalled();
            } finally {
                cache[Symbol.dispose]();
            }
        });
    });

    // ─── static helpers ───────────────────────────────────────────────────────

    describe("static helpers", () => {
        it("exists() returns false for a DB that was never created", async () => {
            expect(await PersistentCache.exists("__nonexistent_cache_xyz__")).toBe(false);
        });

        it("delete() does not throw for a non-existent DB", async () => {
            await expect(PersistentCache.delete("__nonexistent_cache_xyz__")).resolves.not.toThrow();
        });

        it("exists() returns true after a cache is opened", async () => {
            const name = uniqueName();
            const cache = await PersistentCache.open(name);
            try {
                expect(await PersistentCache.exists(name)).toBe(true);
            } finally {
                cache[Symbol.dispose]();
            }
        });
    });
});
