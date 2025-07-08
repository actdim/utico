import { keyOf } from "@/typeUtils";
import { CacheDb, ICacheEntry, ICacheDataItem } from "./cacheDb";
import { StructEvent, StructEventTarget } from "@/structEvent";
import { v4 as uuid } from "uuid";

type Duration = number | { seconds?: number; minutes?: number; hours?: number };

export type PersistentCacheOptions = {
    cleanupTimeout: number;
};

const defaultPersistentCacheOptions = {
    cleanupTimeout: 1000
} satisfies PersistentCacheOptions;

export type CacheOptions = {
    absoluteExpiration?: Date | number;
    ttl?: Duration;
    slidingExpiration?: Date | number; // "autoRenewOnUse" pattern
};

// CacheEntryEvictionEvent
export type CacheEvictionEvent = {
    entry: ICacheEntry;
    // or optionsOverride?
    keepAliveOptions?: CacheOptions; // TODO: delayed eviction (pending eviction) after gracePeriod
};

type PersistentCacheEventStruct = {
    evict: CacheEvictionEvent;
};

// implements Struct<StructEventTarget<PersistentCacheEventStruct>>
// PersistentCacheManager
export class PersistentCache extends StructEventTarget<PersistentCacheEventStruct> {
    // https://demo.agektmr.com/storage/
    // https://www.html5rocks.com/en/tutorials/offline/quota-research/
    // https://www.raymondcamden.com/2015/04/17/indexeddb-and-limits
    // https://github.com/jonnysmith1981/getIndexedDbSize/blob/master/getIndexedDbSize.js
    // https://developer.chrome.com/apps/offline_storage#query
    // https://golb.hplar.ch/2018/01/IndexedDB-programming-with-Dexie-js.html
    // http://www.forerunnerdb.com/licensing.html
    // https://github.com/ignasbernotas/dexie-relationships

    private _db: CacheDb;

    private _isDisposed: boolean;

    private _jobTimerId: number;

    private readonly _options: PersistentCacheOptions;

    // cleanupTimeout - serviceJobTimeout
    constructor(db: CacheDb, options: PersistentCacheOptions) {
        super();
        if (!db) {
            throw new Error("Database cannot be null");
        }
        this._isDisposed = false;
        this._jobTimerId = null;

        this._db = db;
        // if (this._db.isOpen()) {
        // 	this._db.close();
        // }

        // https://docs.nestjs.com/techniques/task-scheduling
        this._options = { ...options, ...defaultPersistentCacheOptions };

        this.scheduleServiceJob();
    }

    scheduleServiceJob() {
        const doWork = async () => {
            try {
                // purge expired entries
                await this.deleteExpired();
            } catch (err) {
                console.error("Cache cleanup failed:", err);
            } finally {
                setTimeout(doWork, this._options.cleanupTimeout);
            }
        };

        setTimeout(doWork, this._options.cleanupTimeout);
    }

    // evictExpired/clearExpired
    async deleteExpired(date?: Date) {
        const result: string[] = []; // output ids
        if (!date) {
            date = new Date();
        }

        await this.exec(async () => {
            const entries = await this._db.registry.where(keyOf<ICacheEntry>("expiresAt")).below(date.getTime()).toArray();
            for (const entry of entries) {
                await this._db.data.delete(entry.id);
                await this._db.registry.delete(entry.id);
                result.push(entry.id);
                const evt = new StructEvent<PersistentCacheEventStruct, this>("evict", {
                    detail: {
                        entry: entry
                        // keepAliveOptions: {}
                    },
                    target: this,
                    cancelable: true
                });
                this.dispatchEvent(evt);
                // evt.defaultPrevented?
                // TODO: support evt.detail.keepAliveOptions
                await this._db.data.delete(entry.id);
                await this._db.registry.delete(entry.id);
                result.push(entry.id);
            }
        });
        return result;
    }

    dispose() {
        if (!this._isDisposed) {
            this._isDisposed = true;

            if (this._jobTimerId) {
                window.clearTimeout(this._jobTimerId);
                this._jobTimerId = null;
            }

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
        }
    }

    private async exec<T>(action: () => Promise<T>) {
        if (!this._db.isOpen()) {
            await this._db.open();
        }
        try {
            const result = await action();
            return result;
        } catch (err) {
            if (this._db.isOpen()) {
                // this._db.close(); // generally speaking: we don't (never) need to close a connection
            }
            throw err;
        }
    }

    async getKeys() {
        return await this._db.registry.filter((_) => true).primaryKeys();
    }

    async get(key: string): Promise<Readonly<ICacheEntry & ICacheDataItem>> {
        return await this.exec(async () => {
            const entry = await this._db.registry.get(key);
            // const entry = await this._db.registry.where(keyOf<ICacheEntry>("id")).equals(key).first();
            if (entry) {
                const data = await this._db.data.get(key);
                // const data = await this._db.data.where(keyOf<ICacheEntry>("id")).equals(key).first();
                return { ...entry, ...data };
            }
            return null;
        });
    }

    // getMany
    async bulkGet(ids: string[]): Promise<{ [key: string]: Readonly<ICacheEntry & ICacheDataItem> }> {
        const result: { [key: string]: Readonly<ICacheEntry & ICacheDataItem> } = {};
        return await this.exec(async () => {
            // const entries = await this._db.registry.where(keyOf<ICacheEntry>("id")).anyOf(ids).toArray();
            const entries = await this._db.registry.bulkGet(ids);
            const entryMap: { [key: string]: ICacheEntry } = entries.reduce((map, entry, i) => {
                map[entry.id] = entry;
                return map;
            }, {});

            // const dataItems = this._db.data.where(keyOf<ICacheEntry>("id")).anyOf(ids);
            // await dataItems.each((dataItem) => {
            //     result[dataItem.id] = { ...entryMap[dataItem.id], ...dataItem };
            //     delete entryMap[dataItem.id];
            // });

            const dataItems = await this._db.data.bulkGet(ids);
            for (const dataItem of dataItems) {
                result[dataItem.id] = { ...entryMap[dataItem.id], ...dataItem };
                delete entryMap[dataItem.id];
            }

            for (const key of Object.keys(entryMap)) {
                // abandoned/orphaned entries:
                result[key] = { ...entryMap[key], value: undefined };

                // Object.defineProperty(result[key], keyOf<ICacheDataItem>("value"), {
                //     writable: false,
                //     get: function () {
                //         throw new Error("Not found");
                //     }
                // });
            }

            return result;
        });
    }

    async getValue(key: string, defaultValue = undefined) {
        const item = await this.get(key);
        if (!item) {
            return defaultValue;
        } else {
            return item.value;
        }
    }

    // getManyValues
    async bulkGetValues(ids: string[]) {
        const result: { [kes: string]: any } = {};
        const items = this.bulkGet(ids);
        for (const key of Object.keys(items)) {
            result[key] = items[key].value;
        }
        return result;
    }

    async contains(key: string) {
        return await this.exec(async () => {
            const entry = await this._db.registry.get(key);
            // const entry = await this._db.registry.where(keyOf<ICacheEntry>("id")).equals(key).first();
            return entry != undefined;
        });
    }

    async delete(key: string) {
        await this.exec(async () => {
            await this._db.registry.delete(key);
        });
    }

    // deleteMany
    async bulkDelete(ids: string[]) {
        await this.exec(async () => {
            await this._db.registry.bulkDelete(ids);
        });
    }

    async set(id: string, value: any, options: CacheOptions) {
        return await this.exec(async () => {
            const entry = await this._db.registry.get(id);
            // const entry = await this._db.registry.where(keyOf<ICacheEntry>("id")).equals(key).first();
            const now = new Date().getTime();
            if (!id) {
                id = uuid();
            }
            const expiresAt =
                typeof options.absoluteExpiration === "number" ? options.absoluteExpiration : options.absoluteExpiration?.getTime();
            const slidingExpiration =
                typeof options.slidingExpiration === "number" ? options.slidingExpiration : options.slidingExpiration?.getTime();

            await this._db.registry.put({
                id: id,
                createdAt: entry ? entry.createdAt : now,
                accessedAt: entry ? entry.accessedAt : null, // now
                // updatedAt: now,
                expiresAt: expiresAt,
                slidingExpiration: slidingExpiration
            });
            await this._db.data.put({
                id: id,
                value: value
            });
        });
    }

    // getOrUpdate
    async getOrSet(key: string, factory: () => any, options: CacheOptions) {
        await this.exec(async () => {
            if (!(await this.contains(key))) {
                await this.set(key, factory(), options);
            }
            return await this.get(key);
        });
    }

    // clearAll/evictAll
    async clear() {
        await this.exec(async () => {
            await this._db.registry.clear();
            await this._db.data.clear();
        });
    }

    // TODO: support update bulkUpdate, bulkSet
}

// https://medium.com/square-corner-blog/useful-tools-headless-chrome-puppeteer-for-browser-automation-testing-1ac7707bad40
// https://developers.google.com/web/updates/2017/06/headless-karma-mocha-chai?hl=ru
// https://github.com/puppeteer/puppeteer
// https://medium.com/web-standards/puppeteer-crawl-to-markdown-7752dff36b68
