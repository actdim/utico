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

    [Symbol.dispose]() {
        if (!this._isDisposed) {
            if (this.isOpen()) {
                this.close();
            }
            this._isDisposed = true;
        }
    }

    async open() {
        if (this.isOpen()) {
            return this;
        }
        try {
            return await super.open();
        } catch (err) {
            if (err instanceof Dexie.Dexie.OpenFailedError) {
                return await super.open();
            } else {
                throw err;
            }
        }
        // TODO: log (this.verno, this._dbSchema etc)

    }

    async exec<T>(
        action: () => Promise<T>, // scope
        transactionMode: TransactionMode = "r!") {
        await this.open();
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

    async getKeys() {
        return this.metadata.toCollection().primaryKeys();
    }

    async contains(key: string, transactionMode: TransactionMode = "r") {
        return await this.exec(async () => {
            const metadataRecord = await this.metadata.get(key);
            return metadataRecord !== undefined;
        }, transactionMode);
    }

    async deleteOne(key: string, transactionMode: TransactionMode = "rw") {
        await this.exec(async () => {
            await this.metadata.delete(key);
            await this.data.delete(key);
        }, transactionMode);
    }

    // deleteManyAsync
    async bulkDelete(keys: string[], transactionMode: TransactionMode = "rw") {
        await this.exec(async () => {
            await this.metadata.bulkDelete(keys);
            await this.data.bulkDelete(keys);
        }, transactionMode);
    }

    // clearAll
    async clear(transactionMode: TransactionMode = "rw") {
        await this.exec(async () => {
            await this.metadata.clear();
            await this.data.clear();
        }, transactionMode);
    }

    static async delete(name: string) {
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

    static exists(name: string) {
        return Dexie.Dexie.exists(name);
    }

    static async open<T extends StoreBase>(name: string, factory: (name: string) => T) {
        return await mutex.dispatch(async () => {
            const store = factory(name);
            await store.open();
            return store;
        });
    }
}