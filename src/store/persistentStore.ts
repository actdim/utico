
import { DataStore } from "./dataStore";
import { IPersistentStore } from "./storeContracts";

// TODO: implement real encryption:
// https://stackoverflow.com/questions/18279141/javascript-string-encryption-and-decryption

export type PersistentStoreOptions = {
    useEncryption: boolean;
};

const defaultPersistentStoreOptions = {
    useEncryption: false
} satisfies PersistentStoreOptions;

export class PersistentStore extends DataStore<"default"> implements IPersistentStore {

    private _options: PersistentStoreOptions; // TODO: support

    static deleteAsync(name: string) {
        return DataStore.$deleteAsync(name);
    }

    static existsAsync(name: string) {
        return DataStore.$existsAsync(name);
    }

    static openAsync(name: string, options?: PersistentStoreOptions) {
        return DataStore.$openAsync(name, () => new PersistentStore(name, options));
    }

    constructor(name: string, options?: PersistentStoreOptions) {
        super(name, "default");
        this._options = { ...options, ...defaultPersistentStoreOptions };
    }

    // upsertAsync
    setAsync(key: string, value: any) {
        return this.$setAsync(key, value);
    }

    // getOrAddAsync
    getOrSetAsync(key: string, factory: (key: string) => any) {
        return this.$getOrSetAsync(key, factory);
    }

    // TODO: support bulkSetAsync
}
