import type * as Dexie from "dexie";
import { v4 as uuid } from "uuid";
import { keyOf } from "@/typeUtils";
import { type KeyPathValueMap } from "@/typeCore";
import {
    type ChangeSet,
    type DataRecord,
    type FieldDefTemplate,
    type IndexableType,
    type IStoreCollection,
    type WhereFilter,
    type MetadataRecord,
    type OrderDirection,
    type StoreBase,
    type StoreItem,
    type TransactionMode
} from "./storeContracts";
import { StoreDb } from "@/store/storeDb";

function* reverseMapValues<K, V>(map: Map<K, V>) {
    const keys = [...map.keys()];
    for (let i = keys.length - 1; i >= 0; i--) {
        yield map.get(keys[i])!;
    }
}

class StoreCollection<T extends MetadataRecord = MetadataRecord, TValue = unknown> implements IStoreCollection<T, TValue> {
    private _metadata: Dexie.Collection<T>;

    constructor(metadata: Dexie.Collection<T>) {
        this._metadata = metadata;
    }

    private get db() {
        return this._metadata.db as StoreDb<T>;
    }

    async toArray(orderBy?: keyof T, orderDirection?: OrderDirection, transactionMode: TransactionMode = "r"): Promise<StoreItem<T, TValue>[]> {

        const db = this.db;

        // db.data.where(keyOf<DataRecord>("key")).equals(key).first();

        return db.exec(async () => {
            const map = new Map<string, StoreItem<T, TValue>>();
            let populate: (callback: (metadataRecord: T) => void) => void | PromiseLike<void> = this._metadata.each.bind(this._metadata);
            const effectiveDirection: OrderDirection | undefined = orderBy ? (orderDirection ?? "asc") : orderDirection;
            if (orderBy) {
                const metadataRecords = await this._metadata.sortBy(orderBy as string);
                populate = metadataRecords.forEach.bind(metadataRecords);
            }
            await populate(metadataRecord => {
                map.set(metadataRecord.key, {
                    metadata: metadataRecord,
                    // data: undefined
                });
            });
            const keys = [...map.keys()];
            const dataRecords = await db.data.bulkGet(keys);
            for (const dataRecord of dataRecords) {
                if (dataRecord) {
                    const item = map.get(dataRecord.key);
                    if (item) {
                        item.data = dataRecord as DataRecord<TValue>;
                    }
                }
            }
            // abandoned/orphaned entries:
            // Object.defineProperty(storeItem, keyOf<StoreItem>("data"), {
            //     writable: false,
            //     get: function () {
            //         throw new Error("Not found");
            //     }
            // });
            // Array.from(map.values()) can be slower!
            if (effectiveDirection === "desc") {
                return [...reverseMapValues(map)];
            }

            return [...map.values()];
        }, transactionMode);
    }

    orderBy(field: keyof T, direction: OrderDirection = "asc", transactionMode: TransactionMode = "r") {
        return this.toArray(field, direction, transactionMode);
    }





    filter(filter: ((x: T) => boolean)): IStoreCollection<T, TValue> {
        const metadata = this._metadata.filter(filter);

        return new StoreCollection<T, TValue>(metadata);
    }

    limit(n: number): IStoreCollection<T, TValue> {
        return new StoreCollection<T, TValue>(this._metadata.limit(n));
    }

    offset(n: number) {
        return new StoreCollection<T, TValue>(this._metadata.offset(n));
    }

    getKeys() {
        return this._metadata.primaryKeys() as Promise<T["key"][]>;
    }

    getCount() {
        return this._metadata.count();
    }

    getFilterKeys(distinct: boolean) {
        if (distinct) {
            return this._metadata.uniqueKeys();
        }

        return this._metadata.keys();
    }

    modifyMetadata(callback: (metadataRecord: T) => void, transactionMode: TransactionMode = "rw") {
        if (!callback) {
            throw new Error("callback cannot be undefined.");
        }

        return this.db.exec(async () => {
            return this._metadata.modify(r => {
                callback(r);
            });
        }, transactionMode);
    }

    modifyData(callback: (dataRecord: DataRecord) => void, transactionMode: TransactionMode = "rw") {
        if (!callback) {
            throw new Error("callback cannot be undefined.");
        }

        return this.db.exec(async () => {
            const rawKeys = await this.getKeys();
            const keys = rawKeys.filter((k): k is string => Boolean(k));
            if (keys.length === 0) {
                return 0;
            }

            return await this.db.data.where(keyOf<DataRecord>("key")).anyOf(keys).modify(r => {
                callback(r);
            });
        }, transactionMode);
    }

    modify(metadataCallback?: (metadataRecord: T) => void, dataCallback?: (dataRecord: DataRecord) => void, transactionMode: TransactionMode = "rw") {
        return this.db.exec(async () => {
            let keys: string[] = [];
            let mc = 0;
            let dc = 0;
            if (metadataCallback) {
                mc = await this._metadata.modify(r => {
                    if (r.key) keys.push(r.key);
                    metadataCallback(r);
                });
            }
            else if (dataCallback) {
                const rawKeys = await this.getKeys();
                keys = rawKeys.filter((k): k is string => Boolean(k));
            }
            if (dataCallback && keys.length > 0) {
                dc = await this.db.data.where(keyOf<DataRecord>("key")).anyOf(keys).modify(r => {
                    dataCallback(r);
                });
            }

            return Math.max(mc, dc);
        }, transactionMode);
    }
}

function createWhereFilter<T extends IndexableType, TResult = unknown>(source: Dexie.WhereClause<unknown, unknown>, factory: (source: Dexie.Collection) => TResult) {
    const methodCache = new WeakMap<Function, Function>();

    return new Proxy(source as any, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (typeof value === "function") {
                if (!methodCache.has(value)) {
                    methodCache.set(value, new Proxy(value, {
                        apply(targetFn, thisArg, args) {
                            return factory(Reflect.apply(targetFn, target, args));
                        },
                    }));
                }

                return methodCache.get(value);
            }

            return value;
        },
    }) as WhereFilter<T, TResult>;
}

export class DataStore<T extends MetadataRecord> implements StoreBase {

    private _db: StoreDb<T> | undefined;

    constructor(name: string, metadataFieldDefTemplate: keyof T extends string ? FieldDefTemplate<keyof T> : never) {
        if (!name) {
            throw new Error("Name cannot be empty.");
        }
        this._db = new StoreDb<T>(name, metadataFieldDefTemplate);
    }

    protected get db(): StoreDb<T> {
        if (!this._db) {
            throw new Error("DataStore has been disposed.");
        }

        return this._db;
    }

    [Symbol.dispose]() {
        this._db?.[Symbol.dispose]();
        this._db = undefined;
    }

    async open() {
        return this.db.open();
    }

    async exec<T>(
        action: () => Promise<T>, // scope
        transactionMode: TransactionMode = "r!"
    ) {
        return this.db.exec(action, transactionMode);
    }

    getKeys() {
        return this.db.getKeys();
        // return this.query().getKeys();
    }

    contains(key: string, transactionMode: TransactionMode = "r") {
        return this.db.contains(key, transactionMode);
    }

    delete(key: string, transactionMode: TransactionMode = "rw") {
        return this.db.deleteOne(key, transactionMode);
    }

    // deleteMany
    bulkDelete(keys: string[], transactionMode: TransactionMode = "rw") {
        return this.db.bulkDelete(keys, transactionMode);
    }

    // clearAll
    clear(transactionMode: TransactionMode = "rw") {
        return this.db.clear(transactionMode);
    }

    private async getInternal<TValue>(key: string): Promise<StoreItem<T, TValue> | undefined> {
        const metadataRecord = await this.db.metadata.get(key);
        const dataRecord = await this.db.data.get(key);
        if (!metadataRecord && !dataRecord) return undefined;


        return { metadata: metadataRecord, data: dataRecord } as StoreItem<T, TValue>;
    }

    private async setInternal<TValue>(metadataRecord: T, value: TValue): Promise<string> {
        if (!metadataRecord.key) metadataRecord.key = uuid();
        const result = await this.db.metadata.put(metadataRecord);
        await this.db.data.put({ key: metadataRecord.key, value });

        return result;
    }

    get<TValue = unknown>(key: string, transactionMode: TransactionMode = "r?"): Promise<StoreItem<T, TValue> | undefined> {
        return this.exec(() => this.getInternal<TValue>(key), transactionMode);
    }

    // upsert
    async set<TValue = unknown>(metadataRecord: T, value: TValue, transactionMode: TransactionMode = "rw") {
        if (value === undefined) {
            throw new Error('Invalid parameter: "value".');
        }

        return this.exec(() => this.setInternal(metadataRecord, value), transactionMode);
    }

    // getOrAdd
    async getOrSet<TValue = unknown>(metadataRecord: T, factory: (metadataRecord: T) => TValue, transactionMode: TransactionMode = "rw") {
        if (!metadataRecord.key) {
            throw new Error(`Key cannot be empty. Parameter: "metadataRecord".`);
        }

        return this.exec(async () => {
            const existing = await this.getInternal<TValue>(metadataRecord.key);
            if (existing) return existing;
            await this.setInternal(metadataRecord, factory(metadataRecord));

            return this.getInternal<TValue>(metadataRecord.key);
        }, transactionMode);
    }

    async update<TValue = unknown>(key: string, metadataChanges: KeyPathValueMap<T, false>, valueChanges?: KeyPathValueMap<TValue, false>, transactionMode: TransactionMode = "rw") {
        if (!key) {
            throw new Error('Key cannot be empty. Parameter: "key".');
        }
        if (!metadataChanges && !valueChanges) {
            throw new Error("No changes provided.");
        }

        return this.exec(async () => {
            let mc = 0, dc = 0;
            if (metadataChanges) {
                mc = await this.db.metadata.update(key, metadataChanges as any);
            }
            if (valueChanges) {
                dc = await this.db.data.update(key, valueChanges);
            }

            return Math.max(mc, dc);
        }, transactionMode);
    }

    async bulkUpdate(metadataChangeSets?: ChangeSet<T>[], dataChangeSets?: ChangeSet<DataRecord>[], transactionMode: TransactionMode = "rw") {
        let index: number;
        if (metadataChangeSets && (index = metadataChangeSets.findIndex((x) => !x.key)) >= 0) {
            throw new Error(`Key cannot be empty. Parameter: "metadataChangeSets". Invalid item index: ${index}.`);
        }
        if (dataChangeSets && (index = dataChangeSets.findIndex((x) => !x.key)) >= 0) {
            throw new Error(`Key cannot be empty. Parameter: "dataChangeSets". Invalid item index: ${index}.`);
        }
        if (!metadataChangeSets && !dataChangeSets) {
            throw new Error("No change sets provided.");
        }

        return this.exec(async () => {
            let cm = 0, dc = 0;
            if (metadataChangeSets) {
                cm = await this.db.metadata.bulkUpdate(metadataChangeSets as any);
            }
            if (dataChangeSets) {
                dc = await this.db.data.bulkUpdate(dataChangeSets);
            }

            return Math.max(cm, dc);
        }, transactionMode);
    }

    // getMany
    bulkGet<TValue = unknown>(keys: string[], transactionMode: TransactionMode = "r") {
        return this.exec(async () => {
            const map = new Map<string, StoreItem<T, TValue>>();
            const metadataRecords = await this.db.metadata.bulkGet(keys);
            for (const metadataRecord of metadataRecords) {
                if (metadataRecord) {
                    map.set(metadataRecord.key, { metadata: metadataRecord });
                }
            }
            const dataRecords = await this.db.data.bulkGet(keys);
            for (const dataRecord of dataRecords) {
                if (dataRecord) {
                    let item = map.get(dataRecord.key);
                    if (!item) {
                        item = {};
                        map.set(dataRecord.key, item);
                    }
                    item.data = dataRecord as DataRecord<TValue>;

                }
            }

            return [...map.values()];
        }, transactionMode);
    }

    async bulkSet<TValue = unknown>(metadataRecords?: T[], dataRecords?: DataRecord<TValue>[], transactionMode: TransactionMode = "rw") {
        let index: number;
        if (metadataRecords && (index = metadataRecords.findIndex(x => !x)) >= 0) {
            throw new Error(`Invalid metadata record. Parameter: "metadataRecords". Index: ${index}.`);
        }
        if (dataRecords && (index = dataRecords.findIndex(x => (!x || x.value === undefined))) >= 0) {
            throw new Error(`Invalid data record. Parameter: "dataRecords". Index: ${index}.`);
        }
        if (!metadataRecords && !dataRecords) {
            throw new Error("No data provided.");
        }
        if (metadataRecords && dataRecords && metadataRecords.length === dataRecords.length) {
            for (let i = 0; i < metadataRecords.length; i++) {
                const m = metadataRecords[i];
                const d = dataRecords[i];
                const key = m.key || d.key || uuid();
                m.key = key;
                d.key = key;
            }
        } else {
            if (metadataRecords) {
                for (const metadataRecord of metadataRecords) {
                    if (!metadataRecord.key) {
                        metadataRecord.key = uuid();
                    }
                }
            }
            if (dataRecords) {
                for (const dataRecord of dataRecords) {
                    if (!dataRecord.key) {
                        dataRecord.key = uuid();
                    }
                }
            }
        }





        return this.exec(async () => {
            let mKeys: string[] | undefined, dKeys: string[] | undefined;
            if (metadataRecords) {
                mKeys = await this.db.metadata.bulkPut(metadataRecords, undefined, { allKeys: true });
            }
            if (dataRecords) {
                dKeys = await this.db.data.bulkPut(dataRecords, undefined, { allKeys: true });
            }

            return mKeys ?? dKeys ?? [];
        }, transactionMode);
    }

    orderBy(field: keyof T, direction: OrderDirection, distinct = false) {
        let metadata = this.db.metadata.orderBy(field as string);
        if (direction === "desc") {
            metadata = metadata.reverse();
        }
        if (distinct) {
            metadata = metadata.distinct();
        }

        return new StoreCollection(metadata);
    }

    distinct(field: keyof T) {
        const metadata = this.db.metadata.orderBy(field as string).distinct();

        return new StoreCollection(metadata);
    }

    query<TValue = unknown>() {
        return new StoreCollection<T, TValue>(this.db.metadata.toCollection());
    }

    // filter
    where<K extends keyof T, TValue = unknown>(field: K extends string ? K | K[] : never) {
        const source = this.db.metadata.where(field);

        return createWhereFilter<T[K] extends IndexableType ? T[K] : never, IStoreCollection<T, TValue>>(source, c => new StoreCollection<T, TValue>(c));
    }
}

// and(filter: (x: T) => boolean): Collection<T, TKey, TInsertType>;
// clone(props?: Object): Collection<T, TKey, TInsertType>;
// count<R>(thenShortcut: ThenShortcut<number, R>): PromiseExtended<R>;
// distinct(): Collection<T, TKey, TInsertType>;
// each(callback: (obj: T, cursor: {
//     key: IndexableType;
//     primaryKey: TKey;
// }) => any): PromiseExtended<void>;
// eachKey(callback: (key: IndexableType, cursor: {
//     key: IndexableType;
//     primaryKey: TKey;
// }) => any): PromiseExtended<void>;
// eachPrimaryKey(callback: (key: TKey, cursor: {
//     key: IndexableType;
//     primaryKey: TKey;
// }) => any): PromiseExtended<void>;
// eachUniqueKey(callback: (key: IndexableType, cursor: {
//     key: IndexableType;
//     primaryKey: TKey;
// }) => any): PromiseExtended<void>;
// filter<S extends T>(filter: (x: T) => x is S): Collection<S, TKey>;
// filter(filter: (x: T) => boolean): Collection<T, TKey, TInsertType>;
// first(): PromiseExtended<T | undefined>;
// first<R>(thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>;
// firstKey(): PromiseExtended<IndexableType | undefined>;
// keys<R>(thenShortcut: ThenShortcut<IndexableTypeArray, R>): PromiseExtended<R>;
// primaryKeys(): PromiseExtended<TKey[]>;
// primaryKeys<R>(thenShortcut: ThenShortcut<TKey[], R>): PromiseExtended<R>;
// last(): PromiseExtended<T | undefined>;
// last<R>(thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>;
// lastKey(): PromiseExtended<IndexableType | undefined>;
// or(indexOrPrimayKey: string): WhereClause<T, TKey, TInsertType>;
// raw(): Collection<T, TKey, TInsertType>;
// sortBy<R>(keyPath: string, thenShortcut: ThenShortcut<T[], R>): PromiseExtended<R>;
// toArray(): PromiseExtended<Array<T>>;
// toArray<R>(thenShortcut: ThenShortcut<T[], R>): PromiseExtended<R>;
// uniqueKeys(): PromiseExtended<IndexableTypeArray>;
// uniqueKeys<R>(thenShortcut: ThenShortcut<IndexableTypeArray, R>): PromiseExtended<R>;
// until(filter: (value: T) => boolean, includeStopEntry?: boolean): Collection<T, TKey, TInsertType>;
// // Mutating methods
// delete(): PromiseExtended<number>;
// modify(changeCallback: (obj: T, ctx: {
//     value: TInsertType;
// }) => void | boolean): PromiseExtended<number>;
// modify(changes: UpdateSpec<TInsertType>): PromiseExtended<number>;
