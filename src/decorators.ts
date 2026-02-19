// nonEnumerable
export function notEnumerable(target: any, propertyKey: string | symbol) {

    Object.defineProperty(target, propertyKey, {
        get() {
            return undefined;
        },
        set(value: any) {
            Object.defineProperty(this, propertyKey, {
                value,
                writable: true,
                enumerable: false,
                configurable: true
            });
        },
        enumerable: false,
        configurable: true
    });
}
