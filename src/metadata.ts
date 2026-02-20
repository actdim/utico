export type IPropertyMetadataItem = { [propertyKey: PropertyKey]: any };

const propertyMetadataBag = new WeakMap<any, IPropertyMetadataItem>();

// updateMemberMetadata
export function updatePropertyMetadata<T extends object>(target: T, propertyName: keyof T, value: any, slotName: string) {
    // metadata container
    let metadataItem = propertyMetadataBag.get(target);
    if (!metadataItem) {
        metadataItem = {};
        propertyMetadataBag.set(target, metadataItem);
    }
    const propertyKey = propertyName as PropertyKey;
    if (!metadataItem[propertyKey]) {
        metadataItem[propertyKey] = {};
    }
    metadataItem[propertyKey][slotName] = value;

}

// getMemberMetadata
export function getPropertyMetadata<TInstance, TMetadata = unknown>(target: TInstance, propertyName: keyof TInstance, slotName?: string): TMetadata {
    // target - obj
    if (target && propertyName) {
        // metadata container
        const metadataItem = getPropertyMetadataItem(propertyMetadataBag, target);
        if (metadataItem) {
            const propertyKey = propertyName as PropertyKey;
            const propertyMetadata = metadataItem[propertyKey];
            if (propertyMetadata) {
                if (slotName) {
                    return propertyMetadata[slotName];
                } else {
                    return propertyMetadata;
                }
            }
        }

    }
    return undefined;
}

export function getPropertyMetadataItem<TMetadataItem = unknown>(metadata: WeakMap<any, TMetadataItem>, obj: any) {

    // using prototype chain

    let result: TMetadataItem = undefined;
    let prototype;
    while (true) {
        prototype = Object.getPrototypeOf(prototype || obj);
        // actually for the most cases we can stop traversal when prototype === Object.prototype, but it is possible to set metadata for any lavel in prototype chain
        if (!prototype) {
            break;
        }
        result = metadata.get(prototype);
        if (result) {
            break;
        }
    }

    return result;
}

export function metadata(value: unknown, slotName: string) {
    return function (target: any, propertyKey: PropertyKey) {
        updatePropertyMetadata(target, propertyKey, value, slotName);
    }
}