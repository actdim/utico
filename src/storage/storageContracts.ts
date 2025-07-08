// IKVStore
export type IPersistentStorage = {
    get(key: string, useEncryption?: boolean): string;
    set(key: string, value: string, useEncryption?: boolean): void;
    remove(key: string): void;
}