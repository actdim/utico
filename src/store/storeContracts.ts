import { CommonPartFromSchema, KeyPathValueMap } from "@/typeCore";
import * as Dexie from "dexie";

// Making some navigation properties non-enumerable will prevent them from being handled by IndexedDB
// when doing put() or add().
// Object.defineProperties(obj, {
// ...: { value: [], enumerable: false, writable: true }
// });

// MetadataEntry
export class MetadataRecord {
    key?: string;
    createdAt?: number;
    updatedAt?: number; // lastModified
    tags?: string[];
    // timestamp?: number;
    // weight?: number;
    // score?: number;
    // startDate?/endDate?
    // validFrom?/validTo?
}

// DataEntry
export type DataRecord<TValue = any> = {
    key: string;
    value: TValue;
}

export type StoreItem<T extends MetadataRecord = MetadataRecord, TValue = any> = {
    metadata?: T,
    data?: DataRecord<TValue>;
}

export type ChangeSet<T, TKey = string> = {
    key: TKey;
    changes: KeyPathValueMap<T>;
}

export type BaseMetadataField = keyof MetadataRecord;
// ++: auto-increment primary key
// &: unique
// *: array
export type FieldDef<T extends string> = T | `&${T}` | `*${T}` | `++${T}`;
export type BaseFieldDef = FieldDef<BaseMetadataField>;

// DbFieldTemplate
export type FieldDefTemplate<T extends string> = FieldDef<T>[];

export type IndexableType = Dexie.IndexableTypePart;
export type IndexableTypeArray = Dexie.IndexableTypeArray;
export type TransactionMode = Dexie.TransactionMode;
export type OrderDirection = "asc" | "desc";

export type StoreBase = {
    open(): PromiseLike<void>;
}

export interface IStoreCollection<T extends MetadataRecord = MetadataRecord, TValue = any> {

    toArray(orderBy?: keyof T, orderDirection?: OrderDirection, transactionMode?: TransactionMode): Promise<StoreItem<T, TValue>[]>;

    orderBy(field: keyof T, direction: OrderDirection, transactionMode?: TransactionMode): Promise<StoreItem<T, TValue>[]>;

    filter<S extends T>(filter: (x: T) => x is S): IStoreCollection<S, TValue>;

    limit(n: number): IStoreCollection<T, TValue>;

    offset(n: number): IStoreCollection<T, TValue>;

    getKeys(): Promise<T["key"][]>;

    getCount(): Promise<number>;

    modifyMetadata(callback: (metadataRecord: T) => void, transactionMode?: TransactionMode): Promise<number>;

    modifyData(callback: (dataRecord: DataRecord) => void, transactionMode?: TransactionMode): Promise<number>;

    modify(metadataCallback: (metadataRecord: T) => void, dataCallback: (dataRecord: DataRecord) => void, transactionMode?: TransactionMode): Promise<number>;
}

// IKVStore
export interface IPersistentStore<T extends MetadataRecord = MetadataRecord> {

    open(): Promise<void>;

    getKeys(): Promise<string[]>;

    contains(key: string): Promise<boolean>;

    delete(key: string): Promise<void>;

    bulkDelete(keys: string[]): Promise<void>;

    clear(): Promise<void>;

    get<TValue = any>(key: string): Promise<StoreItem<T, TValue>>;

    set<TValue = any>(metadataRecord: T, value: TValue): Promise<string>;

    getOrSet<TValue = any>(metadataRecord: MetadataRecord, factory: (metadataRecord: MetadataRecord) => TValue): Promise<StoreItem<T, TValue>>

    bulkGet<TValue = any>(keys: string[]): Promise<StoreItem<T, TValue>[]>;

    bulkSet<TValue = any>(metadataRecords: MetadataRecord[], dataRecords: DataRecord<TValue>[]): Promise<string[]>;

    [Symbol.dispose]: () => void;
}