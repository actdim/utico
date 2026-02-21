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
    // magnitude?: number;
    // score?: number;
    // startDate?/endDate?
    // validFrom?/validTo?
}

// DataEntry
export type DataRecord<TValue = unknown> = {
    key: string;
    value: TValue;
}

export type StoreItem<T extends MetadataRecord = MetadataRecord, TValue = unknown> = {
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

export type WhereFilter<T extends IndexableType, TResult = unknown> = {
    above(value: T): TResult;
    aboveOrEqual(value: T): TResult;
    anyOf(values: ReadonlyArray<T>): TResult;
    anyOfIgnoreCase(keys: T extends string ? T[] : never): T extends string ? TResult : never;
    below(value: T): TResult;
    belowOrEqual(value: T): TResult;
    between(lower: T, upper: T, includeLower?: boolean, includeUpper?: boolean): TResult;
    equals(value: T): TResult;
    equalsIgnoreCase(value: string): TResult;
    inAnyRange(ranges: ReadonlyArray<{
        0: T;
        1: T;
    }>, options?: {
        includeLowers?: boolean;
        includeUppers?: boolean;
    }): TResult;
    startsWith(prefix: T extends string ? T : never): T extends string ? TResult : never;
    startsWithAnyOf(prefixes: T extends string ? T[] : never): T extends string ? TResult : never;
    startsWithIgnoreCase(prefix: T extends string ? T : never): T extends string ? TResult : never;
    startsWithAnyOfIgnoreCase(prefixes: T extends string ? T[] : never): T extends string ? TResult : never;
    noneOf(values: ReadonlyArray<T>): TResult;
    notEqual(value: T): TResult;
}

export type StoreBase = {
    open(): PromiseLike<void>;
}

export interface IStoreCollection<T extends MetadataRecord = MetadataRecord, TValue = unknown> {
    toArray(orderBy?: keyof T, orderDirection?: OrderDirection, transactionMode?: TransactionMode): Promise<StoreItem<T, TValue>[]>;
    orderBy(field: keyof T, direction: OrderDirection, transactionMode?: TransactionMode): Promise<StoreItem<T, TValue>[]>;
    filter(filter: (x: T) => boolean): IStoreCollection<T, TValue>;
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

    get<TValue = unknown>(key: string): Promise<StoreItem<T, TValue> | undefined>;

    set<TValue = unknown>(metadataRecord: T, value: TValue): Promise<string>;

    getOrSet<TValue = unknown>(metadataRecord: MetadataRecord, factory: (metadataRecord: MetadataRecord) => TValue): Promise<StoreItem<T, TValue>>

    bulkGet<TValue = unknown>(keys: string[]): Promise<StoreItem<T, TValue>[]>;

    bulkSet<TValue = unknown>(metadataRecords: MetadataRecord[], dataRecords: DataRecord<TValue>[]): Promise<string[]>;

    orderBy(field: keyof T, direction: OrderDirection, distinct?: boolean): IStoreCollection<T>;

    distinct(field: keyof T): IStoreCollection<T>;

    query<TValue = unknown>(): IStoreCollection<T, TValue>;

    // filter
    where<K extends keyof T, TValue = unknown>(field: K extends string ? K : never): WhereFilter<T[K] extends IndexableType ? T[K] : never, IStoreCollection<T, TValue>>;

    update<TValue = unknown>(key: string, metadataChanges: KeyPathValueMap<T>, valueChanges?: KeyPathValueMap<TValue>, transactionMode?: TransactionMode): Promise<number>;

    bulkUpdate(metadataChangeSets: ChangeSet<T>[], dataChangeSets?: ChangeSet<DataRecord>[], transactionMode?: TransactionMode): Promise<number>;

    [Symbol.dispose]: () => void;
}