import { DataStore } from "./dataStore";
import { FieldDef, IPersistentStore, MetadataRecord } from "./storeContracts";
import { StoreDb } from "./storeDb";

// TODO: implement real encryption:
// https://stackoverflow.com/questions/18279141/javascript-string-encryption-and-decryption

export type PersistentStoreOptions = {
    useEncryption: boolean;
};

const defaultPersistentStoreOptions = {
    useEncryption: false
} satisfies PersistentStoreOptions;

// (registry/catalog)fieldNames
const metadataFieldDefTemplate = ["&key", "createdAt", "updatedAt", "tags"] satisfies (FieldDef<keyof MetadataRecord>)[];
// T extends MetadataRecord
export class PersistentStore extends DataStore<MetadataRecord> implements IPersistentStore<MetadataRecord> {

    private _options: PersistentStoreOptions; // TODO: support

    static delete(name: string) {
        return StoreDb.delete(name);
    }

    static exists(name: string) {
        return StoreDb.exists(name);
    }

    static open(name: string, options?: PersistentStoreOptions) {
        return StoreDb.open(name, () => new PersistentStore(name, options));
    }

    constructor(name: string, options?: PersistentStoreOptions) {
        super(name, metadataFieldDefTemplate);
        this._options = { ...options, ...defaultPersistentStoreOptions };
    }
}
