import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { delayAsync, delayErrorAsync, withTimeoutAsync } from "@/utils";
import { PersistentStore } from "@/store/persistentStore";
import { keysOf } from "@/typeUtils";
import { IPersistentStore } from "@/store/storeContracts";

describe("persistentStore", () => {
    process.on("unhandledRejection", (reason, promise) => {
        console.error("Unhandled Rejection at:", promise, "reason:", reason);
        process.exit(1);
    });

    // window.onerror = (message, source, lineno, colno, error) => {
    //     console.error("Caught error:", error);
    // };

    // window.onunhandledrejection = (event) => {
    //     console.error("Unhandled rejection:", event.reason);
    // };

    let sharedStore: PersistentStore;
    const name = "TEST_DB";

    const data = {
        "foo": "bar",
        "baz": "qux"
    }

    const dataKeys = (keysOf(data) as string[]).sort();

    beforeAll(async () => {
        sharedStore?.dispose();
        await PersistentStore.deleteAsync(name);
        sharedStore = new PersistentStore(name);
    });

    afterAll(async () => {
        sharedStore?.dispose();
    })

    // beforeEach(async () => {
    //     await sharedStore.clearAsync();
    // });

    // afterEach(async () => {
    //     await sharedStore.clearAsync();
    // });

    async function addTestRecordsAsync(store: IPersistentStore) {
        await store.setAsync(dataKeys[0], data[dataKeys[0]]);
        await store.setAsync(dataKeys[1], data[dataKeys[1]]);
    }

    it("can set and get data", async () => {
        const store = await PersistentStore.openAsync(`TestDB_${Date.now()}_${Math.random()}`);
        try {
            await addTestRecordsAsync(store);
            const storedKeys = (await store.getKeysAsync()).sort();
            expect(storedKeys.length).toBe(dataKeys.length);
            expect(dataKeys[0]).toBe(storedKeys[0]);
            expect(dataKeys[1]).toBe(storedKeys[1]);
            // expect(dataKeys.indexOf(storedKeys[0]) >= 0).toBe(true);
            // expect(dataKeys.indexOf(storedKeys[1]) >= 0).toBe(true);
            let v = (await store.getAsync(dataKeys[0])).value;
            expect(v).toBe(data[dataKeys[0]]);
            v = (await store.getAsync(dataKeys[1])).value;
            expect(v).toBe(data[dataKeys[1]]);
            let values = await store.bulkGetAsync(dataKeys);
            expect(values[0]).toBe(data[0]);
            expect(values[1]).toBe(data[1]);
        }
        finally {
            store.dispose();
        }
    });

    it("can delete data", async () => {
        const store = await PersistentStore.openAsync(`TestDB_${Date.now()}_${Math.random()}`);
        try {
            await addTestRecordsAsync(store);
            await store.deleteAsync(dataKeys[0]);
            const storedKeys = (await store.getKeysAsync()).sort();
            expect(storedKeys.length).toBe(dataKeys.length - 1);
            expect(dataKeys[1]).toBe(storedKeys[0]);
        }
        finally {
            store.dispose();
        }
    });
});
