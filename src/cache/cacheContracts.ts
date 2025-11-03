import { DataRecord, MetadataRecord, StoreItem } from "@/store/storeContracts";

// CacheMetadataEntry
export class CacheMetadataRecord extends MetadataRecord {
    accessedAt?: number; // lastAccessed/lastAccessTime
    slidingExpiration?: number;
    absoluteExpiration?: number;
    expiresAt?: number; // expiryTime
}

export interface IPersistentCache<T extends CacheMetadataRecord = CacheMetadataRecord> {

    openAsync(): Promise<void>;

    getKeysAsync(): Promise<string[]>;

    containsAsync(key: string): Promise<boolean>;

    deleteAsync(key: string): Promise<void>;

    bulkDeleteAsync(keys: string[]): Promise<void>;

    clearAsync(): Promise<void>;

    getAsync<TValue = any>(key: string): Promise<StoreItem<T, TValue>>;

    setAsync<TValue = any>(metadataRecord: T, value: TValue): Promise<string>;

    getOrSetAsync<TValue = any>(metadataRecord: T, factory: (metadataRecord: T) => TValue): Promise<StoreItem<T, TValue>>

    bulkGetAsync<TValue = any>(keys: string[]): Promise<StoreItem<T, TValue>[]>;

    bulkSetAsync<TValue = any>(metadataRecords: T[], dataRecords: DataRecord<TValue>[]): Promise<string[]>;
}