import { AsyncMutex } from "@/asyncMutex";
import { DataRecord, FieldDefTemplate, MetadataRecord, StoreBase, TransactionMode } from "./storeContracts";
import * as Dexie from "dexie";

const metadataTableName = "metadata";
const dataTableName = "data";
const dataFieldDefTemplate: FieldDefTemplate<keyof DataRecord> = ["&key", "value"];

const mutex = new AsyncMutex();

export class StoreDb<T extends MetadataRecord = MetadataRecord> extends Dexie.Dexie {
    // catalog/registry
    metadata: Dexie.Table<T, string>;
    data: Dexie.Table<DataRecord, string>;

    protected _isDisposed: boolean;

    constructor(name: string, metadataFieldDefTemplate: keyof T extends string ? FieldDefTemplate<keyof T> : never) {
        // navigator.storage.estimate()
        // navigator.webkitTemporaryStorage.queryUsageAndQuota()

        if (!name) {
            throw new Error("Invalid database name."); // cannot be empty
        }

        super(name); // {autoOpen: false}

        this._isDisposed = false;

        const db = this;

        db.version(1).stores({
            [metadataTableName]: metadataFieldDefTemplate.join(", "),
            [dataTableName]: dataFieldDefTemplate.join(", ")
        });

        // db.version(2).stores({
        // 	// ...
        // }).upgrade(trans => {
        // 	return trans.table(dataTableName).toCollection().modify((entry: MetadataRecord) => {
        // 		// ...
        // 	});
        // });

        this.metadata = db.table(metadataTableName);
        this.data = db.table(dataTableName);

        this.metadata.hook('creating', (key, obj) => {
            obj.createdAt = Date.now();
        });

        this.metadata.hook('updating', (mods, key, obj) => {
            return { ...mods, updatedAt: Date.now() };
        });

        // additional way to handle relationships
        // this.metadata.hook("deleting", (key, obj, transaction) => {
        //     // only synchronous code!
        //     transaction.table(dataTableName).delete(key);
        // });

        // this.metadata.mapToClass(MetadataRecord);
        // this.data.mapToClass(DataRecord);

        // this.on('populate', () => db.metadata.bulkAdd([
        // 	// ...
        // ]));
    }

    dispose() {
        if (!this._isDisposed) {
            if (this.isOpen()) {
                this.close();
            }
            this._isDisposed = true;
        }
    }

    async openAsync() {
        if (!this.isOpen()) {
            try {
                await this.open();
            } catch (err) {
                if (err instanceof Dexie.Dexie.OpenFailedError) {
                    await this.open();
                } else {
                    throw err;
                }
            }
            // TODO: log (this.verno, this._dbSchema etc)
        }
    }

    async execAsync<T>(
        action: () => Promise<T>, // scope
        transactionMode: TransactionMode = "r!") {
        await this.openAsync();
        try {
            const result = await this.transaction(transactionMode, this.metadata, this.data, async () => {
                return await action();
            });
            return result;
        } catch (err) {
            if (this.isOpen()) {
                // this._db.close(); // generally speaking: we don't (never) need to close a connection
            }
            throw err;
        }
    }

    async getKeysAsync() {
        return this.metadata.toCollection().primaryKeys();
    }

    async containsAsync(key: string, transactionMode: TransactionMode = "r") {
        return await this.execAsync(async () => {
            const metadataRecord = await this.metadata.get(key);
            return metadataRecord !== undefined;
        }, transactionMode);
    }

    async deleteAsync(key: string, transactionMode: TransactionMode = "rw") {
        await this.execAsync(async () => {
            await this.metadata.delete(key);
            await this.data.delete(key);
        }, transactionMode);
    }

    // deleteManyAsync
    async bulkDeleteAsync(keys: string[], transactionMode: TransactionMode = "rw") {
        await this.execAsync(async () => {
            await this.metadata.bulkDelete(keys);
            await this.data.bulkDelete(keys);
        }, transactionMode);
    }

    // clearAllAsync
    async clearAsync(transactionMode: TransactionMode = "rw") {
        await this.execAsync(async () => {
            await this.metadata.clear();
            await this.data.clear();
        }, transactionMode);
    }

    static async deleteAsync(name: string) {
        try {
            await mutex.dispatch(async () => {
                if (await StoreDb.exists(name)) {
                    await StoreDb.delete(name);
                }
            });
        } catch (err) {
            if (err instanceof Dexie.Dexie.InvalidStateError || err instanceof Dexie.Dexie.VersionError) {
                console.warn(`[DataStore] delete(${name}) failed:`, err);
            } else {
                throw err;
            }
        }
    }

    static existsAsync(name: string) {
        return Dexie.Dexie.exists(name);
    }

    static async openAsync<T extends StoreBase>(name: string, factory: (name: string) => T) {
        return await mutex.dispatch(async () => {
            const store = factory(name);
            await store.openAsync();
            return store;
        });
    }
}