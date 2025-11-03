import { keyOf } from "@/typeUtils";
import { StructEvent, StructEventTarget } from "@/structEvent";
import { v4 as uuid } from "uuid";
import { DataRecord, FieldDef, MetadataRecord, StoreItem, TransactionMode } from "@/store/storeContracts";
import { CacheMetadataRecord } from "./cacheContracts";
import { StoreDb } from "@/store/storeDb";

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
    slidingExpiration?: number; // "autoRenewOnUse" pattern
};

// CacheEntryEvictionEvent
export type CacheEvictionEvent = {
    records: CacheMetadataRecord[];
};

type PersistentCacheEventStruct = {
    evict: CacheEvictionEvent;
};

// (registry/catalog)fieldNames
const metadataFieldDefTemplate = ["&key", "createdAt", "updatedAt", "tags", "accessedAt", "expiresAt"] satisfies (FieldDef<keyof CacheMetadataRecord>)[];

// implements Struct<StructEventTarget<PersistentCacheEventStruct>>
// PersistentCacheManager
export class PersistentCache extends StructEventTarget<PersistentCacheEventStruct> {

    protected _db: StoreDb<CacheMetadataRecord>;

    protected _isDisposed: boolean;

    private _jobTimerId: number;

    private readonly _options: PersistentCacheOptions;

    static deleteAsync(name: string) {
        return StoreDb.deleteAsync(name);
    }

    static existsAsync(name: string) {
        return StoreDb.existsAsync(name);
    }

    static openAsync(name: string, options?: PersistentCacheOptions) {
        return StoreDb.openAsync(name, () => new PersistentCache(name, options));
    }

    // cleanupTimeout - serviceJobTimeout
    constructor(name: string, options: PersistentCacheOptions) {
        super();
        if (!name) {
            throw new Error("Name cannot be empty.");
        }
        this._options = { ...options, ...defaultPersistentCacheOptions };

        this._db = new StoreDb<CacheMetadataRecord>(name, metadataFieldDefTemplate);

        this._jobTimerId = null;

        // https://docs.nestjs.com/techniques/task-scheduling
        this.scheduleServiceJob();
    }

    dispose() {
        if (!this._isDisposed) {
            if (this._jobTimerId) {
                window.clearTimeout(this._jobTimerId);
                this._jobTimerId = null;
            }
        }
        this._db?.dispose();
        this._db = null;
    }

    openAsync() {
        return this._db.openAsync()
    }

    private execAsync<T>(
        action: () => Promise<T>, // scope
        transactionMode: TransactionMode = "r!") {
        return this._db.execAsync(action, transactionMode);
    }

    getKeysAsync() {
        return this._db.getKeysAsync();
    }

    containsAsync(key: string) {
        return this._db.containsAsync(key);
    }

    deleteAsync(key: string) {
        return this._db.deleteAsync(key);
    }

    // deleteManyAsync
    bulkDeleteAsync(keys: string[]) {
        return this._db.bulkDeleteAsync(keys);
    }

    // clearAllAsync
    clearAsync() {
        return this._db.clearAsync();
    }

    private onGetMetadata(record: CacheMetadataRecord) {
        const now = Date.now();
        record.accessedAt = now;

        let newExpiresAt = record.expiresAt ?? now;

        if (typeof record.slidingExpiration === 'number' && record.slidingExpiration > 0) {
            newExpiresAt = now + record.slidingExpiration;
        }

        if (
            typeof record.absoluteExpiration === 'number' &&
            record.absoluteExpiration > 0 &&
            newExpiresAt > record.absoluteExpiration
        ) {
            newExpiresAt = record.absoluteExpiration;
        }

        record.expiresAt = newExpiresAt;
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
    async deleteExpiredAsync(ts?: number) {
        const result: string[] = []; // output keys
        if (!ts) {
            ts = Date.now();
        }
        let metadataRecords: MetadataRecord[];
        await this.execAsync(async () => {
            metadataRecords = await this._db.metadata.where(keyOf<CacheMetadataRecord>("expiresAt")).below(ts).toArray();
            const keys = metadataRecords.map(x => x.key);
            await this.bulkDeleteAsync(keys);
        }, "rw");
        if (metadataRecords?.length) {
            const evt = new StructEvent<PersistentCacheEventStruct, this>("evict", {
                detail: {
                    records: metadataRecords
                },
                target: this,
                cancelable: true
            });
            this.dispatchEvent(evt);
        }
        return result;
    }

    getAsync<TValue = any>(key: string): Promise<StoreItem<CacheMetadataRecord, TValue>> {
        return this.execAsync(async () => {
            const metadataRecord = await this._db.metadata.get(key);
            this.onGetMetadata(metadataRecord);
            await this._db.metadata.put(metadataRecord);
            const dataRecord = await this._db.data.get(key);
            return {
                metadata: metadataRecord,
                data: dataRecord
            } as StoreItem<CacheMetadataRecord, TValue>;
        }, "rw");
    }

    private onCreateMetadata(record: CacheMetadataRecord, options: CacheOptions) {
        const now = Date.now();

        record.createdAt = now;
        record.updatedAt = now;
        record.accessedAt = now;

        record.slidingExpiration = options.slidingExpiration;
        if (typeof options.absoluteExpiration === "number") {
            record.absoluteExpiration = options.absoluteExpiration;
        } else if (options.absoluteExpiration instanceof Date) {
            record.absoluteExpiration = options.absoluteExpiration.getTime();
        }
        if (typeof options.ttl === "number") {
            record.absoluteExpiration = now + options.ttl;
        }
        if (record.absoluteExpiration == undefined) {
            record.absoluteExpiration = Infinity
        }

        this.onGetMetadata(record);

    }
    // upsertAsync
    setAsync<TValue = any>(metadataRecord: CacheMetadataRecord, value: TValue, options: CacheOptions) {
        if (value === undefined) {
            throw new Error('Invalid parameter: "value".');
        }
        if (!metadataRecord.key) {
            metadataRecord.key = uuid();
        }

        this.onCreateMetadata(metadataRecord, options);

        return this.execAsync(async () => {
            const result = await this._db.metadata.put(metadataRecord);
            await this._db.data.put({
                key: metadataRecord.key,
                value: value
            });
            return result;
        }, "rw");
    }

    // getOrAddAsync
    getOrSetAsync<TValue = any>(metadataRecord: CacheMetadataRecord, factory: (metadataRecord: CacheMetadataRecord) => TValue, options: CacheOptions) {
        if (!metadataRecord.key) {
            throw new Error(`Key cannot be empty. Parameter: "metadataRecord".`);
        }
        return this.execAsync(async () => {
            const existingStoreItem = await this.getAsync(metadataRecord.key);
            if (existingStoreItem) {
                return existingStoreItem;
            }
            await this.setAsync(metadataRecord, factory(metadataRecord), options);
            return this.getAsync(metadataRecord.key);
        }, "rw");
    }

    // getMany
    bulkGetAsync<TValue = any>(keys: string[]) {
        return this.execAsync(async () => {
            const map = new Map<string, StoreItem<CacheMetadataRecord, TValue>>();
            const metadataRecords = await this._db.metadata.bulkGet(keys);
            for (const metadataRecord of metadataRecords) {
                this.onGetMetadata(metadataRecord);
                map.set(metadataRecord.key, {
                    metadata: metadataRecord,
                    // data: undefined
                });
            }
            await this._db.metadata.bulkPut(metadataRecords);
            const dataRecords = await this._db.data.bulkGet(keys);
            for (const dataRecord of dataRecords) {
                map.get(dataRecord.key).data = dataRecord;
            }
            return [...map.values()];
        }, "rw");
    }

    // setMeny
    bulkSetAsync<TValue = any>(metadataRecords: CacheMetadataRecord[], dataRecords: DataRecord<TValue>[], optionsProvider: (record: MetadataRecord) => CacheOptions) {
        let index: number;
        if (metadataRecords && (index = metadataRecords.findIndex(x => !x)) >= 0) {
            throw new Error(`Invalid metadata record. Parameter: "metadataRecords". Index: ${index}.`);
        }
        if (dataRecords && (index = dataRecords.findIndex(x => (!x || !x.key || x.value === undefined))) >= 0) {
            throw new Error(`Invalid data record. Parameter: "dataRecords". Index: ${index}.`);
        }
        if (!metadataRecords && !dataRecords) {
            throw new Error("No data provided.");
        }
        for (const metadataRecord of metadataRecords) {
            if (!metadataRecord.key) {
                metadataRecord.key = uuid();
            }
            this.onCreateMetadata(metadataRecord, optionsProvider(metadataRecord));
        }
        return this.execAsync(async () => {
            let mKeys: string[], dKeys: string[];
            if (metadataRecords) {
                mKeys = await this._db.metadata.bulkPut(metadataRecords, undefined, { allKeys: true });
            }
            if (dataRecords) {
                dKeys = await this._db.data.bulkPut(dataRecords, undefined, { allKeys: true });
            }
            return mKeys;
        }, "rw");
    }
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

/*
(async () => {
    const alreadyPersisted = await window.navigator.storage?.persisted()

    if (alreadyPersisted) {
        return;
    }

    const persistentModeEnabled = await window.navigator.storage?.persist()

    if (!persistentModeEnabled) {        
        // Storage may be cleared by the UA under storage pressure
    } else {
        // Storage will be persistent
        // Storage will not be cleared except by explicit user action
    }
})();
*/
