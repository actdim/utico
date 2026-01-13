import { DataRecord, MetadataRecord, StoreItem } from "@/store/storeContracts";

// CacheMetadataEntry
export class CacheMetadataRecord extends MetadataRecord {
    accessedAt?: number; // lastAccessed/lastAccessTime
    slidingExpiration?: number;
    absoluteExpiration?: number;
    expiresAt?: number; // expiryTime
}

export interface IPersistentCache<T extends CacheMetadataRecord = CacheMetadataRecord> {

    open(): Promise<void>;

    getKeys(): Promise<string[]>;

    contains(key: string): Promise<boolean>;

    delete(key: string): Promise<void>;

    bulkDelete(keys: string[]): Promise<void>;

    clear(): Promise<void>;

    get<TValue = any>(key: string): Promise<StoreItem<T, TValue>>;

    set<TValue = any>(metadataRecord: T, value: TValue): Promise<string>;

    getOrSet<TValue = any>(metadataRecord: T, factory: (metadataRecord: T) => TValue): Promise<StoreItem<T, TValue>>

    bulkGet<TValue = any>(keys: string[]): Promise<StoreItem<T, TValue>[]>;

    bulkSet<TValue = any>(metadataRecords: T[], dataRecords: DataRecord<TValue>[]): Promise<string[]>;
}