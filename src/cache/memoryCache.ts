export type IMemoryCache<TKey = any, TValue = any> = {
    get keys(): Iterable<TKey>;
    getKeys: () => Iterable<TKey>;
    get: (key: TKey) => TValue;
    contains: (key: TKey) => boolean;
    remove: (key: TKey) => void;
    set: (key: TKey, valueOrValueFactory: TValue | (() => TValue)) => void;
    get values(): Iterable<TValue>;
    getValues: () => Iterable<TValue>;
    getOrSet: (key: TKey, valueOrValueFactory: TValue | (() => TValue)) => TValue;
    clear: () => void;
    get entries(): Iterable<[TKey, TValue]>;
    getEntries: () => Iterable<[TKey, TValue]>;
};

export class MemoryCache<TKey = any, TValue = any> implements IMemoryCache {
    private map: Map<TKey, TValue>;

    constructor() {
        this.map = new Map<TKey, TValue>();
    }

    get keys() {
        return this.map.keys();
    }

    getKeys() {
        return this.keys;
    }

    get(key: TKey) {
        return this.map.get(key);
    }

    contains(key: TKey) {
        return this.map.has(key);
    }

    remove(key: TKey) {
        this.map.delete(key);
    }

    set(key: TKey, valueOrValueFactory: TValue | (() => TValue)) {
        if (valueOrValueFactory instanceof Function) {
            this.map.set(key, valueOrValueFactory());
        } else {
            this.map.set(key, valueOrValueFactory);
        }
    }

    get values() {
        return this.getValues();
    }

    getValues() {
        return this.values;
    }

    getOrSet(key: TKey, valueOrValueFactory: TValue | (() => TValue)) {
        if (!this.contains(key)) {
            // this.set(key, valueOrValueFactory);
            if (valueOrValueFactory instanceof Function) {
                // typeof valueOrValueFactory === "function"
                this.map.set(key, valueOrValueFactory());
            } else {
                this.map.set(key, valueOrValueFactory);
            }
        }
        return this.get(key);
    }

    clear() {
        this.map.clear();
    }

    get size() {
        return this.map.size;
    }

    getEntries() {
        return this.entries;
    }

    get entries() {
        return this.map.entries();
    }
}