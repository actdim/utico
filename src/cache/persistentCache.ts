import { keyOf } from "@/typeUtils";
import { ICacheDataEntry, IDataEntry, IDataItem, EntryTypes, CacheDataEntry } from "../store/storeDb";
import { StructEvent } from "@/structEvent";
import { v4 as uuid } from "uuid";
import { DataStore } from "@/store/dataStore";

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
    entry: IDataEntry;
    // or optionsOverride?
    keepAliveOptions?: CacheOptions; // TODO: delayed eviction (pending eviction) after gracePeriod
};

type PersistentCacheEventStruct = {
    evict: CacheEvictionEvent;
};

// implements Struct<StructEventTarget<PersistentCacheEventStruct>>
// PersistentCacheManager
export class PersistentCache extends DataStore<"cache", PersistentCacheEventStruct> {

    private _jobTimerId: number;

    private readonly _options: PersistentCacheOptions;

    static deleteAsync(name: string) {
        return DataStore.$deleteAsync(name);
    }

    static existsAsync(name: string) {
        return DataStore.$existsAsync(name);
    }

    static openAsync(name: string, options: PersistentCacheOptions) {
        return DataStore.$openAsync(name, () => new PersistentCache(name, options));
    }

    // cleanupTimeout - serviceJobTimeout
    constructor(name: string, options: PersistentCacheOptions) {
        super(name, "cache");
        this._jobTimerId = null;
        this._options = { ...options, ...defaultPersistentCacheOptions };
        // https://docs.nestjs.com/techniques/task-scheduling
        this.scheduleServiceJob();
    }

    scheduleServiceJob() {
        if (this._options.cleanupTimeout) {
            const doWork = async () => {
                try {
                    // purge expired entries
                    await this.deleteExpiredAsync();
                } catch (err) {
                    console.error("Cache cleanup failed:", err);
                } finally {
                    setTimeout(doWork, this._options.cleanupTimeout);
                }
            };
            setTimeout(doWork, this._options.cleanupTimeout);
        }
    }

    // evictExpiredAsync/clearExpiredAsync
    async deleteExpiredAsync(date?: Date) {
        const result: string[] = []; // output ids
        if (!date) {
            date = new Date();
        }
        await this.$execAsync(async () => {
            const entries = await this._db.registry.where(keyOf<ICacheDataEntry>("expiresAt")).below(date.getTime()).toArray();
            for (const entry of entries) {
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
                this.deleteAsync(entry.id);
                result.push(entry.id);
                // TODO: use bulkDelete
            }
        });
        return result;
    }

    dispose() {
        if (!this._isDisposed) {
            if (this._jobTimerId) {
                window.clearTimeout(this._jobTimerId);
                this._jobTimerId = null;
            }
        }
        super.dispose();
    }

    async getAsync(key: string): Promise<Readonly<CacheDataEntry & IDataItem>> {
        return await this.$execAsync(async () => {
            const entry = await this._db.registry.get(key);
            if (entry) {
                const data = await this._db.data.get(key);
                // TODO: update data entry
                // accessedAt,
                // updatedAt,
                // expiresAt // for sliding expiration
                return { ...entry, ...data };
            }
            return null;
        }, "rw");
    }

    // getMany
    async bulkGetAsync(ids: string[]): Promise<{ [key: string]: Readonly<CacheDataEntry & IDataItem> }> {
        const result: { [key: string]: Readonly<EntryTypes["cache"] & IDataItem> } = {};
        return await this.$execAsync(async () => {
            const entries = await this._db.registry.bulkGet(ids);
            const entryMap: { [key: string]: CacheDataEntry } = entries.reduce((map, entry, i) => {
                map[entry.id] = entry;
                return map;
            }, {});
            const dataItems = await this._db.data.bulkGet(ids);
            // TODO: update data entries
            // accessedAt,
            // updatedAt,
            // expiresAt // for sliding expiration
            for (const dataItem of dataItems) {
                result[dataItem.id] = { ...entryMap[dataItem.id], ...dataItem };
                delete entryMap[dataItem.id];
            }
            for (const key of Object.keys(entryMap)) {
                // abandoned/orphaned entries:
                let dataItem: IDataItem = {
                    id: key,
                    value: undefined
                }
                result[key] = { ...entryMap[key], ...dataItem };
            }
            return result;
        }, "rw");
    }

    // upsertAsync
    async setAsync(key: string, value: any, options: CacheOptions) {
        return await this.$execAsync(async () => {
            let entry;
            const now = new Date().getTime();
            if (key) {
                entry = await this._db.registry.get(key);
            } else {
                key = uuid();
            }
            const expiresAt =
                typeof options.absoluteExpiration === "number" ? options.absoluteExpiration : options.absoluteExpiration?.getTime();
            const slidingExpiration =
                typeof options.slidingExpiration === "number" ? options.slidingExpiration : options.slidingExpiration?.getTime();
            await this._db.registry.put({
                id: key,
                createdAt: entry ? entry.createdAt : now,
                accessedAt: now,
                updatedAt: now,
                expiresAt: expiresAt,
                slidingExpiration: slidingExpiration
            });
            await this._db.data.put({
                id: key,
                value: value
            });
        });
    }

    // getOrAddAsync
    async getOrSetAsync(key: string, factory: (key: string) => any, options: CacheOptions) {
        return await this.$execAsync(async () => {
            if (!(await this.containsAsync(key))) {
                await this.setAsync(key, factory(key), options);
            }
            return await this.getAsync(key);
        });
    }

    // TODO: support bulkSetAsync
}

// extra links:
// https://demo.agektmr.com/storage/
// https://www.html5rocks.com/en/tutorials/offline/quota-research/
// https://www.raymondcamden.com/2015/04/17/indexeddb-and-limits
// https://github.com/jonnysmith1981/getIndexedDbSize/blob/master/getIndexedDbSize.js
// https://developer.chrome.com/apps/offline_storage#query
// https://golb.hplar.ch/2018/01/IndexedDB-programming-with-Dexie-js.html
// http://www.forerunnerdb.com/licensing.html
// https://github.com/ignasbernotas/dexie-relationships
// https://medium.com/square-corner-blog/useful-tools-headless-chrome-puppeteer-for-browser-automation-testing-1ac7707bad40
// https://developers.google.com/web/updates/2017/06/headless-karma-mocha-chai?hl=ru
// https://github.com/puppeteer/puppeteer
// https://medium.com/web-standards/puppeteer-crawl-to-markdown-7752dff36b68
