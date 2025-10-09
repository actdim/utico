import { AsyncMutex } from "@/asyncMutex";
import { CommonPartFromSchema } from "@/typeCore";
import { EntryTypes, IDataItem, StoreDb } from "./storeDb";
import { StructEventTarget } from "@/structEvent";
import Dexie, { TransactionMode } from "dexie";
import { v4 as uuid } from "uuid";
import { strictSatisfies } from "@/typeUtils";

const mutex = new AsyncMutex();

// BaseEntry/EntryBase
type CommonEntry = CommonPartFromSchema<EntryTypes>;

// TODO: update
export type IDataStoreBase = {
    openAsync(): PromiseLike<void>;
}

export class DataStore<TEntryTemplate extends keyof EntryTypes, TEventStruct extends Record<string, any> = unknown> extends StructEventTarget<TEventStruct> implements IDataStoreBase {

    protected _db: StoreDb<TEntryTemplate>;

    protected _isDisposed: boolean;

    protected static async $deleteAsync(name: string) {
        try {
            await mutex.dispatch(async () => {
                if (await StoreDb.exists(name)) {
                    await StoreDb.delete(name);
                }
            });
        } catch (err) {
            if (err instanceof Dexie.InvalidStateError || err instanceof Dexie.VersionError) {
                console.warn(`[DataStore] delete(${name}) failed:`, err);
            } else {
                throw err;
            }
        }
    }

    protected static $existsAsync(name: string) {
        return Dexie.exists(name);
    }

    protected static async $openAsync<T extends IDataStoreBase>(name: string, factory: (name: string) => T) {
        return await mutex.dispatch(async () => {
            const store = factory(name);
            await store.openAsync();
            return store;
        });
    }

    constructor(name: string, entryTemplate: TEntryTemplate) {
        super();
        if (!name) {
            throw new Error("Name cannot be empty");
        }
        this._isDisposed = false;
        this._db = new StoreDb(name, entryTemplate);
    }

    async openAsync() {
        if (!this._db.isOpen()) {
            try {
                await this._db.open();
            } catch (err) {
                if (err instanceof Dexie.OpenFailedError) {
                    await this._db.open();
                } else {
                    throw err;
                }
            }
            // TODO: log (this._db.verno, this._db._dbSchema etc)
        }
    }

    dispose() {
        if (!this._isDisposed) {
            if (this._db) {
                // this.exec(async () => {
                // 	// ...
                // }).then(() => {
                // 	this._db = null;
                // });
                if (this._db.isOpen()) {
                    this._db.close();
                }
                this._db = null;
            }
            this._isDisposed = true;
        }
    }

    protected async $execAsync<T>(action: () => Promise<T>, transactionMode: TransactionMode = "rw") {
        await this.openAsync();
        try {
            const result = await this._db.transaction(transactionMode, this._db.registry, this._db.data, async () => {
                return await action();
            });
            return result;
        } catch (err) {
            if (this._db.isOpen()) {
                // this._db.close(); // generally speaking: we don't (never) need to close a connection
            }
            throw err;
        }
    }

    async getKeysAsync() {
        return await this._db.registry.filter((_) => true).primaryKeys();
    }

    async getAsync(key: string): Promise<Readonly<EntryTypes[TEntryTemplate] & IDataItem>> {
        return await this.$execAsync(async () => {
            const entry = await this._db.registry.get(key);
            // const entry = await this._db.registry.where(keyOf<IDataEntry>("id")).equals(key).first();
            if (entry) {
                const data = await this._db.data.get(key);
                // const data = await this._db.data.where(keyOf<IDataEntry>("id")).equals(key).first();
                return { ...entry, ...data };
            }
            return null;
        }, "readonly");
    }

    // getMany
    async bulkGetAsync(ids: string[]): Promise<{ [key: string]: Readonly<EntryTypes[TEntryTemplate] & IDataItem> }> {
        const result: { [key: string]: Readonly<EntryTypes[TEntryTemplate] & IDataItem> } = {};
        return await this.$execAsync(async () => {
            // const entries = await this._db.registry.where(keyOf<IDataEntry>("id")).anyOf(ids).toArray();
            const entries = await this._db.registry.bulkGet(ids);
            const entryMap: { [key: string]: EntryTypes[TEntryTemplate] } = entries.reduce((map, entry, i) => {
                map[entry.id] = entry;
                return map;
            }, {});

            // const dataItems = this._db.data.where(keyOf<IDataEntry>("id")).anyOf(ids);
            // await dataItems.each((dataItem) => {
            //     result[dataItem.id] = { ...entryMap[dataItem.id], ...dataItem };
            //     delete entryMap[dataItem.id];
            // });

            const dataItems = await this._db.data.bulkGet(ids);
            for (const dataItem of dataItems) {
                result[dataItem.id] = { ...entryMap[dataItem.id], ...dataItem };
                delete entryMap[dataItem.id];
            }

            // TODO: update data entry  
            // accessedAt,
            // updatedAt,
            // expiresAt // for sliding expiration

            for (const key of Object.keys(entryMap)) {
                // abandoned/orphaned entries:
                let dataItem: IDataItem = {
                    id: key,
                    value: undefined
                }
                result[key] = { ...entryMap[key], ...dataItem };
                // Object.defineProperty(result[key], keyOf<IDataItem>("value"), {
                //     writable: false,
                //     get: function () {
                //         throw new Error("Not found");
                //     }
                // });
            }

            return result;
        }, "readonly");
    }

    async containsAsync(key: string) {
        return await this.$execAsync(async () => {
            const entry = await this._db.registry.get(key);
            // const entry = await this._db.registry.where(keyOf<IDataEntry>("id")).equals(key).first();
            return entry != undefined;
        });
    }

    async deleteAsync(key: string) {
        await this.$execAsync(async () => {
            await this._db.registry.delete(key);
            await this._db.data.delete(key);
        });
    }

    // deleteManyAsync
    async bulkDeleteAsync(keys: string[]) {
        await this.$execAsync(async () => {
            await this._db.registry.bulkDelete(keys);
            await this._db.data.bulkDelete(keys);
        });
    }

    // upsertAsync
    protected async $setAsync(key: string, value: any) {
        return await this.$execAsync(async () => {
            let entry;
            const now = new Date().getTime();
            if (key) {
                entry = await this._db.registry.get(key);
                // entry = await this._db.registry.where(keyOf<IDataEntry>("id")).equals(key).first();
            } else {
                key = uuid();
            }
            await this._db.registry.put(strictSatisfies<CommonEntry>()({
                id: key,
                createdAt: entry ? entry.createdAt : now,
                updatedAt: now
            }));
            await this._db.data.put({
                id: key,
                value: value
            });
        });
    }

    // getOrAddAsync
    protected async $getOrSetAsync(key: string, factory: (key: string) => any,) {
        return await this.$execAsync(async () => {
            if (!(await this.containsAsync(key))) {
                await this.$setAsync(key, factory(key));
            }
            return await this.getAsync(key);
        });
    }

    // clearAllAsync/evictAllAsync
    async clearAsync() {
        await this.$execAsync(async () => {
            await this._db.registry.clear();
            await this._db.data.clear();
        });
    }

    // TODO: support bulkSetAsync
}