import Dexie from "dexie"; // https://dexie.org/docs/Typescript

const registryTableName = "registry"; // "catalog"
const dataTableName = "data";

export interface ICacheEntry {
    id: string;
    createdAt: number;
    // updatedAt: number; // lastModified
    accessedAt: number; // lastAccessed/lastAccessTime
    slidingExpiration?: number;
    // absoluteExpiration?: number;
    expiresAt: number; // expiryTime
}

// ICacheDataRecord
export interface ICacheDataItem {
    readonly id: string;
    readonly value: any;
}

// (registry/catalog)PropertyNames
const entryPropertyNames: (keyof ICacheEntry)[] = ["id", "createdAt", "accessedAt", "expiresAt"];

const dataItemPropertyNames: (keyof ICacheDataItem)[] = ["id", "value"];

export class CacheEntry implements ICacheEntry {
    id: string;
    createdAt: number;
    // updatedAt: number;
    accessedAt: number;
    expiresAt: number;

    constructor(src: Partial<CacheEntry>) {
        Object.assign(this, src);
        // Define navigation properties.
        // Making them non-enumerable will prevent them from being handled by indexedDB
        // when doing put() or add().
        // Object.defineProperties(this, {
        // ...: { value: [], enumerable: false, writable: true }
        // });
    }
}

// CacheDataRecord
export class CacheDataItem implements ICacheDataItem {
    id: string;
    value: any;

    constructor(src: Partial<CacheDataItem>) {
        Object.assign(this, src);
    }

    // constructor(key: string, value: string) {
    //     this.key = key;
    //     this.value = value;
    // }
}

export class CacheDb extends Dexie {
    // private _dbName: string;

    // catalog/entries
    registry: Dexie.Table<ICacheEntry, string>;
    data: Dexie.Table<ICacheDataItem, string>;

    constructor(dbName: string) {
        // navigator.storage.estimate()
        // navigator.webkitTemporaryStorage.queryUsageAndQuota()

        if (!dbName) {
            throw new Error("Invalid database name"); // cannot be empty
        }

        super(dbName); // {autoOpen: false}

        // this._dbName = dbName;

        const db = this;

        //
        // Define tables and indexes
        //

        db.version(1).stores({
            [registryTableName]: entryPropertyNames.join(", "),
            [dataTableName]: dataItemPropertyNames.join(", ")
        });

        // db.version(2).stores({
        // 	// ...
        // }).upgrade(trans => {
        // 	return trans.table(cacheEntryTableName).toCollection().modify((entry: ICacheEntry) => {
        // 		// ...
        // 	});
        // });

        this.registry = db.table(registryTableName);
        this.data = db.table(dataTableName);

        db.registry.hook("deleting", async (key, obj, transaction) => {
            await transaction.table(dataTableName).delete(key);
        });
        // db.data.hook("deleting", async (key, obj, transaction) => {
        //     await transaction.table(cacheRegistryTableName).delete(key);
        // });

        // db.registry.mapToClass(CacheEntry);
        // db.data.mapToClass(CacheDataItem);

        // db.on('populate', () => db.registry.bulkAdd([
        // 	// ...
        // ]));

        // Dexie.delete(this._dbName);
        // this.delete();
    }
}
