/* /// <reference types="node" /> */
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll, test } from "vitest";
import { delay, delayError, withTimeout } from "@/utils";
import { defaultMetadataFieldDefTemplate, PersistentStore } from "@/store/persistentStore";
import { IPersistentStore, MetadataRecord, StoreItem } from "@/store/storeContracts";

describe("persistentStore", () => {
    // process.on("unhandledRejection", (reason, promise) => {
    //     console.error("Unhandled Rejection at:", promise, "reason:", reason);
    //     process.exit(1);
    // });

    // window.onerror = (message, source, lineno, colno, error) => {
    //     console.error("Caught error:", error);
    // };

    // window.onunhandledrejection = (event) => {
    //     console.error("Unhandled rejection:", event.reason);
    // };tests/node/persistentStore.test.ts

    let sharedStore: IPersistentStore;
    const name = "TEST_DB";

    const dataKeys = ["key1", "key2"].sort();
    const storeItems: StoreItem[] = [
        {
            metadata: {
                key: dataKeys[0],
            },
            data: {
                key: dataKeys[0],
                value: {
                    foo: "test"
                }
            }
        },
        {
            metadata: {
                key: dataKeys[1],
            },
            data: {
                key: dataKeys[1],
                value: {
                    bar: 123
                }
            }
        }
    ];

    beforeAll(async () => {
        sharedStore?.[Symbol.dispose]();
        await PersistentStore.delete(name);
        sharedStore = new PersistentStore(name);
    });

    afterAll(async () => {
        sharedStore?.[Symbol.dispose]();
    })

    // beforeEach(async () => {
    //     await sharedStore.clear();
    // });

    // afterEach(async () => {
    //     await sharedStore.clear();
    // });

    async function addTestRecords(store: PersistentStore) {
        // await store.set(data[0].metadata, data[0].data.value);
        // await store.set(data[1].metadata, data[1].data.value);
        await store.bulkSet(storeItems.map(x => x.metadata), storeItems.map(x => x.data));
    }

    it("can set and get data", async () => {
        const store = await PersistentStore.open(`TestDB_${Date.now()}_${Math.random()}`);
        try {
            await addTestRecords(store);
            const storedKeys = (await store.getKeys()).sort();
            expect(storedKeys.length).toBe(dataKeys.length);
            expect(dataKeys[0]).toBe(storedKeys[0]);
            expect(dataKeys[1]).toBe(storedKeys[1]);
            // expect(dataKeys.indexOf(storedKeys[0]) >= 0).toBe(true);
            // expect(dataKeys.indexOf(storedKeys[1]) >= 0).toBe(true);
            let item = (await store.get(dataKeys[0]));
            expect(item.data).toEqual(storeItems[0].data);
            item = (await store.get(dataKeys[1]));
            expect(item.data).toEqual(storeItems[1].data);
            let items = await store.bulkGet(dataKeys);
            expect(items.map(x => x.data)).toEqual(storeItems.map(x => x.data));
        }
        finally {
            store[Symbol.dispose]();
        }
    });

    it("can delete data", async () => {
        const store = await PersistentStore.open(`TestDB_${Date.now()}_${Math.random()}`);
        try {
            await addTestRecords(store);
            await store.delete(dataKeys[0]);
            const storedKeys = (await store.getKeys()).sort();
            expect(storedKeys.length).toBe(dataKeys.length - 1);
            expect(dataKeys[1]).toBe(storedKeys[0]);
        }
        finally {
            store[Symbol.dispose]();
        }
    });

    it("can query data", async () => {
        const store = await PersistentStore.open(`TestDB_${Date.now()}_${Math.random()}`);
        try {
            await addTestRecords(store);
            const query = store.query();
            const c = await query.getCount();
            let items = await query.filter(x => x.key == dataKeys[0]).toArray();
            const item1 = items[0];
            items = await store.where("key").equals(dataKeys[1]).toArray();
            const item2 = items[0];
            expect(c).toBe(2);
            expect(item1.data.key).toBe(dataKeys[0]);
            expect(item2.data.key).toBe(dataKeys[1]);
        }
        finally {
            store[Symbol.dispose]();
        }
    });

    it("update modifies metadata fields", async () => {
        const store = await PersistentStore.open(`TestDB_${Date.now()}_${Math.random()}`);
        try {
            await addTestRecords(store);
            await store.update(dataKeys[0], { tags: ["updated"] });
            const item = await store.get(dataKeys[0]);
            expect(item.metadata.tags).toEqual(["updated"]);
        } finally {
            store[Symbol.dispose]();
        }
    });

    it("update returns 0 when key does not exist", async () => {
        const store = await PersistentStore.open(`TestDB_${Date.now()}_${Math.random()}`);
        try {
            const result = await store.update("nonexistent-key", { tags: ["x"] });
            expect(result).toBe(0);
        } finally {
            store[Symbol.dispose]();
        }
    });

    it("update throws when key is empty", async () => {
        const store = await PersistentStore.open(`TestDB_${Date.now()}_${Math.random()}`);
        try {
            await expect(store.update("", { tags: ["x"] })).rejects.toThrow("Key cannot be empty");
        } finally {
            store[Symbol.dispose]();
        }
    });

    it("update throws when no changes are provided", async () => {
        const store = await PersistentStore.open(`TestDB_${Date.now()}_${Math.random()}`);
        try {
            await expect(store.update("some-key", null, null)).rejects.toThrow("No changes provided");
        } finally {
            store[Symbol.dispose]();
        }
    });

    it("bulkUpdate modifies metadata fields for multiple records", async () => {
        const store = await PersistentStore.open(`TestDB_${Date.now()}_${Math.random()}`);
        try {
            await addTestRecords(store);
            await store.bulkUpdate([
                { key: dataKeys[0], changes: { tags: ["a"] } },
                { key: dataKeys[1], changes: { tags: ["b"] } },
            ]);
            const items = await store.bulkGet(dataKeys);
            const tagMap = Object.fromEntries(items.map(i => [i.metadata.key, i.metadata.tags]));
            expect(tagMap[dataKeys[0]]).toEqual(["a"]);
            expect(tagMap[dataKeys[1]]).toEqual(["b"]);
        } finally {
            store[Symbol.dispose]();
        }
    });

    it("bulkUpdate throws when a change set has an empty key", async () => {
        const store = await PersistentStore.open(`TestDB_${Date.now()}_${Math.random()}`);
        try {
            await expect(
                store.bulkUpdate([{ key: "", changes: { tags: ["x"] } }])
            ).rejects.toThrow("Key cannot be empty");
        } finally {
            store[Symbol.dispose]();
        }
    });

    it("can query custom metadata", async () => {
        type CutomMetadataRecord = MetadataRecord & {
            magnitude: number;
        };
        const dbName = `TestDB_${Date.now()}_${Math.random()}`;
        const store = await PersistentStore.open<CutomMetadataRecord>(dbName, [...defaultMetadataFieldDefTemplate, "magnitude"]);
        try {

            store.set({
                key: dataKeys[0],
                magnitude: 1,
            }, storeItems[0].data)
            store.set({
                key: dataKeys[0],
                magnitude: 2,
            }, storeItems[1].data)

            const items = await store.where("magnitude").above(1).toArray();
            expect(items.length).toBe(1);
        }
        finally {
            store[Symbol.dispose]();
        }
    });
});
// expect(obj).toEqual(
//   expect.objectContaining({
//     prop: expect.any(Number),
//   })
// )
// + arrayContaining
// + toMatchObject