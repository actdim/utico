import Dexie from "dexie";
// https://dexie.org/docs/Typescript

const registryTableName = "registry"; // "catalog"
const dataTableName = "data";

export interface IDataEntry {
    id: string; // should be called "id" for Dexie!
    createdAt: number;
    updatedAt: number; // lastModified
}
// isValid?
// tags?

export interface ICacheDataEntry extends IDataEntry {
    accessedAt?: number; // lastAccessed/lastAccessTime
    slidingExpiration?: number;
    // absoluteExpiration?: number;
    expiresAt?: number; // expiryTime
}

export type EntryTypes = {
    default: IDataEntry,
    cache: ICacheDataEntry
}

// IDataRecord
export interface IDataItem {
    readonly id: string;
    readonly value: any;
}

const dataItemPropertyNames: (keyof IDataItem)[] = ["id", "value"];

type DbColumnTemplate = string[];

// (registry/catalog)ColumnNames
const entryColumnTemplates: {
    [name in keyof EntryTypes]: DbColumnTemplate
} = {
    default: ["id", "createdAt", "updatedAt"] satisfies (keyof IDataEntry)[],
    cache: ["id", "createdAt", "accessedAt", "updatedAt", "expiresAt"] satisfies (keyof ICacheDataEntry)[]
};

export class DataEntry implements IDataEntry {
    id: string;
    createdAt: number;
    updatedAt: number;

    constructor(src: Partial<DataEntry>) {
        Object.assign(this, src);
        // Define navigation properties.
        // Making them non-enumerable will prevent them from being handled by indexedDB
        // when doing put() or add().
        // Object.defineProperties(this, {
        // ...: { value: [], enumerable: false, writable: true }
        // });
    }
}

export class CacheDataEntry extends DataEntry {
    accessedAt?: number; // lastAccessed/lastAccessTime
    slidingExpiration?: number;
    // absoluteExpiration?: number;
    expiresAt?: number; // expiryTime

    constructor(src: Partial<CacheDataEntry>) {
        super(src);
        Object.assign(this, src);
    }
}

// DataRecord
export class DataItem<T = any> implements IDataItem {
    id: string;
    value: T;

    constructor(src: Partial<DataItem>) {
        Object.assign(this, src);
    }

    // constructor(key: string, value: string) {
    //     this.key = key;
    //     this.value = value;
    // }
}

function toDexieColumnName(name: string) {
    return name.toLowerCase() == "id" ? "&id" : name;
}

export class StoreDb<TEntryTemplate extends keyof EntryTypes> extends Dexie {
    // catalog/entries
    registry: Dexie.Table<EntryTypes[TEntryTemplate], string>;
    data: Dexie.Table<IDataItem, string>;

    constructor(name: string, entryTemplate: TEntryTemplate) {
        // navigator.storage.estimate()
        // navigator.webkitTemporaryStorage.queryUsageAndQuota()

        if (!name) {
            throw new Error("Invalid database name"); // cannot be empty
        }

        super(name); // {autoOpen: false}

        const db = this;

        const entryColumnTemplate = entryColumnTemplates[entryTemplate];
        db.version(1).stores({
            [registryTableName]: entryColumnTemplate.map(toDexieColumnName).join(", "),
            [dataTableName]: dataItemPropertyNames.map(toDexieColumnName).join(", ")
        });

        // db.version(2).stores({
        // 	// ...
        // }).upgrade(trans => {
        // 	return trans.table(dataTableName).toCollection().modify((entry: IDataEntry) => {
        // 		// ...
        // 	});
        // });

        this.registry = db.table(registryTableName);
        this.data = db.table(dataTableName);

        // additional way to handle relationships
        // db.registry.hook("deleting", (key, obj, transaction) => {
        //     // only synchronous code!
        //     transaction.table(dataTableName).delete(key);
        // });

        // db.registry.mapToClass(DataEntry);
        // db.data.mapToClass(DataItem);

        // db.on('populate', () => db.registry.bulkAdd([
        // 	// ...
        // ]));
    }
}