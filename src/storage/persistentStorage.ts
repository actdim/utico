// TODO: implement real encryption:
// https://stackoverflow.com/questions/18279141/javascript-string-encryption-and-decryption

import { IPersistentStorage } from "./storageContracts";

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

// KVStore
export class PersistentStorage<T> implements IPersistentStorage {
    private slotName: string;

    private useEncryption: boolean;

    constructor(useEncryption = false, slotName?: string) {
        this.useEncryption = useEncryption;
        this.slotName = slotName || "";
    }

    getKeyInSlot(key: string) {
        return this.slotName ? `${this.slotName}/${key}` : key;
    }

    get(key: string, useEncryption = this.useEncryption): string {
        key = this.getKeyInSlot(key);
        let value = localStorage.getItem(key);
        if (!value) {
            return value;
        }
        // localStorage.setItem(key, value);
        if (useEncryption) {
            // decrypt
            value = window.atob(value);
        }
        return value;
    }

    set(key: string, value: string, useEncryption = this.useEncryption) {
        key = this.getKeyInSlot(key);
        if (useEncryption) {
            // encrypt
            value = window.btoa(value);
        }
        localStorage.setItem(key, value);
    }

    remove(key: string): void {
        key = this.getKeyInSlot(key);
        localStorage.removeItem(key);
    }
}
