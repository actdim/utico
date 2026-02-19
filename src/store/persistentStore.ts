import { DataStore } from "./dataStore";
import { FieldDef, FieldDefTemplate, IPersistentStore, MetadataRecord } from "./storeContracts";
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
export const defaultMetadataFieldDefTemplate = ["&key", "createdAt", "updatedAt", "tags"] satisfies FieldDefTemplate<keyof MetadataRecord>;
// T extends MetadataRecord
export class PersistentStore<TMetadataRecord extends MetadataRecord = MetadataRecord> extends DataStore<TMetadataRecord> implements IPersistentStore<TMetadataRecord> {

    private _options: PersistentStoreOptions; // TODO: support

    static delete(name: string) {
        return StoreDb.delete(name);
    }

    static exists(name: string) {
        return StoreDb.exists(name);
    }

    static open<TMetadataRecord extends MetadataRecord = MetadataRecord>(name: string, metadataFieldDefTemplate?: keyof TMetadataRecord extends string ? FieldDefTemplate<keyof TMetadataRecord> : never, options?: PersistentStoreOptions) {
        return StoreDb.open(name, () => new PersistentStore(name, metadataFieldDefTemplate, options));
    }

    constructor(name: string, metadataFieldDefTemplate?: keyof TMetadataRecord extends string ? FieldDefTemplate<keyof TMetadataRecord> : never, options?: PersistentStoreOptions) {
        super(name, (metadataFieldDefTemplate ?? defaultMetadataFieldDefTemplate) as keyof TMetadataRecord extends string ? FieldDefTemplate<keyof TMetadataRecord> : never);
        this._options = { ...options, ...defaultPersistentStoreOptions };
    }
}
