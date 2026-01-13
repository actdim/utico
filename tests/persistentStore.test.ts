/* /// <reference types="node" /> */
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll, test } from "vitest";
import { delay, delayError, withTimeout } from "@/utils";
import { PersistentStore } from "@/store/persistentStore";
import { IPersistentStore, StoreItem } from "@/store/storeContracts";

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
    const data: StoreItem[] = [
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
        await store.bulkSet(data.map(x => x.metadata), data.map(x => x.data));
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
            expect(item.data).toEqual(data[0].data);
            item = (await store.get(dataKeys[1]));
            expect(item.data).toEqual(data[1].data);
            let items = await store.bulkGet(dataKeys);
            expect(items.map(x => x.data)).toEqual(data.map(x => x.data));
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
});
// expect(obj).toEqual(
//   expect.objectContaining({
//     prop: expect.any(Number),
//   })
// )
// + arrayContaining
// + toMatchObject