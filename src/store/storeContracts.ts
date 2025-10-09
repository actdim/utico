import { DataEntry, DataItem } from "./storeDb";

// IKVStore
export type IPersistentStore = {
    getAsync<T = any>(key: string): Promise<DataEntry & DataItem<T>>;
    setAsync<T = any>(key: string, value: T): Promise<void>;
    deleteAsync(key: string): Promise<void>;
}