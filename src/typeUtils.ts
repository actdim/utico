import { CallableConstructor, Constructor, ConstructorClass } from "./typeCore";

// @filename: typeUtils.ts

// typed version of Object.keys
export function keysOf<T extends object>(obj: T) {
    return Object.keys(obj) as Array<keyof T>;
}

export function entry<T extends object, TKey extends keyof T>(obj: T, name: TKey, caseInsensitive = true) {
    if (!obj || !name) {
        return undefined;
    }
    // name.toString()
    let nameStr = String(name).trim();
    const keys = keysOf(obj);
    let key: keyof T;
    if (caseInsensitive) {
        nameStr = nameStr.toLowerCase();
        key = keys.find((k) => String(k).toLowerCase().trim() === nameStr);
    } else {
        key = keys.find((k) => String(k).trim() === nameStr);
    }
    return [key, key == undefined ? undefined : (obj[key] as T[TKey])] as [TKey, T[TKey]];
}

export function satisfies<TShape>() {
    return <T extends TShape>(obj: T) => obj;
}
/** check also const strict = <T>() => <U extends T>(u: U & { [K in Exclude<keyof U, keyof T>]: never }) => u;
 */
export function strictSatisfies<T>() {
    return <U extends T>(u: U & Record<Exclude<keyof U, keyof T>, never>) => u;
}

// $keyOf
export const keyOf = <T extends object, TKey extends keyof T = keyof T>(key: TKey, obj?: T) => key;

// $nameOf/$n
export function nameOf<T extends object>(f: (x: T) => T[keyof T]): keyof T;
export function nameOf(f: (x: any) => any): keyof any {
    const p = new Proxy(
        {},
        {
            get: (target, key) => key
        }
    );
    return f(p);
}

type _KeyMap<T extends object> = {
    [K in keyof T]: K;
};

export function _keyMap<T extends object>(obj?: T) {
    return new Proxy(
        {},
        {
            get: (target, key) => key
        }
    ) as _KeyMap<T>;
}

// _NU
type _NH<T> = {
    nameOf(f: (x: T) => T[keyof T]): keyof T;
};

// $nu
// usage: $nh(obj).nameOf(x => x.prop) or $NH<ClassName>().nameOf(x => x.prop)
export function _nh<T>(obj?: T) {
    return {
        nameOf: (f: (x: any) => any) => {
            return nameOf(f);
        }
    } as _NH<T>;
}

export function getPropertyPath<T>(expr: (x: T) => any) {
    return getPropertyPathInternal(expr);
}

function getPropertyPathInternal<T>(expr: (x: T) => any, path?: (string | number | symbol)[]) {
    if (path == undefined) {
        path = [];
    }
    let createProxy: () => any;
    createProxy = () => {
        return new Proxy(
            {},
            {
                get: (target, key) => {
                    path.push(key);
                    return createProxy();
                }
            }
        );
    };
    expr(createProxy());
    return path;
}

export function combinePropertyPath(path?: (string | number | symbol)[]) {
    const builder: string[] = [];
    for (const key of path) {
        builder.push(`["${key.toString()}"]`);
    }
    return builder.join("");
}

const nonObjectTypes: Constructor[] = [String, Number];

// isNonObjectCtor
function isNonObjectType<TConstructor extends Constructor>(type: TConstructor) {
    return nonObjectTypes.indexOf(type) >= 0;
}

// getConstructor
export function createConstructor<TConstructor extends Constructor>(
    type: TConstructor // ctor
): CallableConstructor<TConstructor> {
    if (isNonObjectType(type)) {
        return type as CallableConstructor<TConstructor>;
    } else {
        function createInstance(...args: ConstructorParameters<TConstructor>): ConstructorClass<TConstructor> {
            // return Reflect.construct(type, args); // works too
            return new type(...args);
        }

        createInstance.prototype = type.prototype;
        return createInstance as CallableConstructor<TConstructor>;
    }
}

export function typed<TCtor extends Constructor>(ctor: TCtor) {
    return ctor as CallableConstructor<TCtor>;
}

export function getPrototypes(obj: any) {
    const result = [];
    let prototype;
    while (true) {
        prototype = Object.getPrototypeOf(prototype || obj);
        if (!prototype) {
            break;
        }
        result.push(prototype);
    }
    return result;
}

export function proxify<T extends object>(source: () => T): T {
    return new Proxy(
        {},
        {
            get: (target, key) => {
                return Reflect.get(source(), key);
                // return source()[key];
            },
            set: (target, key, value) => {
                return Reflect.set(source(), key, value);
                // source()[key] = value;
                // return true;
            }
        }
    ) as T;
}

export function getEnumValue<T>(enumType: T, name: string, defaultValue: T[keyof T]): T[keyof T] {
    let value = name ? enumType[name as keyof T] : defaultValue;
    if (value == undefined) {
        value = defaultValue;
    }
    return value;
}

export function getEnumValues<T extends object, K extends keyof T>(enumType: T): Array<T[K]> {
    return getEnumKeys<T, K>(enumType).map((x) => enumType[x]);
}

export function getEnumKeys<T extends object, K extends keyof T>(enumType: T): Array<K> {
    return Object.keys(enumType)
        .filter((x) => Number.isNaN(Number(x)))
        .map((x) => x as K);
}

// conditional assign with value factory
export function assignWith<T extends object, U extends object>(
    dst: T,
    src: U,
    callback?: (key: keyof U, value: U[keyof U], set: (value: U[keyof U]) => void) => any
): T & Partial<U> {
    const result: T & Partial<U> = dst;
    if (src) {
        for (const key in src) {
            let value = src[key];
            const set = (v: U[keyof U]) => {
                // result[key as PropertyKey] = value;
                Reflect.set(result, key, v);
            };
            if (callback) {
                callback(key, value, set);
            }
        }
    }
    return result;
}

// constrained and typed assign
export function update<T extends object, U extends Partial<T>>(dst: T, src: U, props?: [keyof U]): T & Partial<U> {
    const propSet = new Set(props);

    return assignWith(dst, src, (key, value, set) => {
        if (!propSet.size || propSet.has(key)) {
            set(value);
        }
    });

    // for (const prop of props) {
    //     // dst[prop as PropertyKey] = src[prop];
    //     Reflect.set(dst, prop, src[prop]);
    // }
    // return dst;
}

export function copy<T extends object, U extends object>(src: T, dst: U, props?: [keyof T]): U & Partial<T> {
    return update(dst, src, props);
}

export function isPlainObject(value) {
    if (Object.prototype.toString.call(value) !== '[object Object]') return false;
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
}

const sort = (() => {
    // It relies on Chrome's and Node's behaviour that the first key assigned to an object is outputted first by JSON.stringify.
    const noKeys = []; // emptyKeys
    function sortImpl(obj: any, keyCompareFn?: (a: string, b: string) => number) {
        const keys = obj ? Object.keys(obj) : noKeys;
        // const orderedKeys = desc ? keys.orderByDesc(k => k) : keys.orderBy(k => k);
        if (keyCompareFn) {
            // array sort method without compare function produces ascending but alphabetical, lexicographic (dictionary) order
            keyCompareFn = (a, b) => b.localeCompare(a);
        }
        const orderedKeys = keys.sort(keyCompareFn);
        // result
        const container = {}; // sortedObj
        for (const key of orderedKeys) {
            container[key] = isPlainObject(obj[key]) ? sortImpl(obj[key]) : obj[key];
        }
        return container;
    }
    return sortImpl;
})();

// stableStringify
export const orderedStringify = (() => {
    // https://www.gangofcoders.net/solution/sort-object-properties-and-json-stringify/
    // see also: https://www.npmjs.com/package/json-stable-stringify
    return (
        obj: any,
        keyCompareFn?: (a: string, b: string) => number,
        replacer?: (this: any, key: string, value: any) => any,
        // replacer?: (number | string)[] | null,
        space?: string | number
    ) => {
        return JSON.stringify(sort(obj, keyCompareFn), replacer, space);
    };
})();

// structural comparison helper
export function jsonEquals<T>(obj1: T, obj2: T) {
    // contentEquals
    return orderedStringify(obj1) === orderedStringify(obj2);
}

/** structuredClone alternative */
export function jsonClone<T extends object>(obj: T): T {
    const type = typeof obj;
    if (type !== "object") {
        throw new Error(`Unsupported object type: ${type}`);
    }
    if (!obj) {
        return obj;
    }
    return JSON.parse(JSON.stringify(obj));
}

// freeze
const $lock = Symbol("__lock");

// IFreezable
export type ILockable<T = any> = Readonly<T> & { [$lock]?: (locked: boolean) => void };

// deepFreeze/lock
export function toReadOnly<T extends object>(obj: T, throwOnSet: boolean = false): ILockable<T> {
    return toReadOnlyInternal(obj, throwOnSet);
}

function toReadOnlyInternal<T extends object>(obj: T, throwOnSet: boolean = false, lockTest?: () => boolean): ILockable<T> {
    if (typeof obj !== "object" || !obj) {
        return obj;
    }

    let locked = true;
    if (!lockTest) {
        lockTest = () => locked;
    }

    const result = new Proxy(obj, {
        get: (target, property, receiver) => {
            // property in target
            if (Reflect.has(target, property)) {
                // Reflect.get(target, property)
                return toReadOnlyInternal(target[property], throwOnSet, lockTest);
            }
            return undefined;
        },
        set: (target, property, value, receiver) => {
            if (lockTest()) {
                if (throwOnSet) {
                    throw new Error("Cannot set the value of read-only property"); // read-only object
                }
                // return false; // will throw a TypeError exception in strict mode
                return true;
            } else {
                // target[property] = value;
                return Reflect.set(target, property, value);
            }
        }
    });

    obj[$lock] = (l: boolean) => {
        locked = l;
    };
    return result as Readonly<T> & { [$lock]: (locked: boolean) => void };
}

export type DeepPropertyKey = PropertyKey[];

export interface DeepProxyHandler<T extends object> {
    // getPrototypeOf?(target: T): object | null;
    // setPrototypeOf?(target: T, v: any): boolean;
    // isExtensible?(target: T): boolean;
    // preventExtensions?(target: T): boolean;
    // getOwnPropertyDescriptor?(target: T, p: DeepPropertyKey): PropertyDescriptor | undefined;
    // has?(target: T, p: DeepPropertyKey): boolean;
    // get?(target: T, p: DeepPropertyKey, receiver: any): any;
    set?(target: T, p: DeepPropertyKey, value: any, receiver: any): boolean;

    deleteProperty?(target: T, p: DeepPropertyKey): boolean;

    // defineProperty?(target: T, p: DeepPropertyKey, attributes: PropertyDescriptor): boolean;
    // enumerate?(target: T): DeepPropertyKey[];
    // ownKeys?(target: T): DeepPropertyKey[];
    // apply?(target: T, thisArg: any, argArray?: any): any; // assign
    // construct?(target: T, argArray: any, newTarget?: any): object;
}

export function createDeepProxy<T extends object>(target: T, handler: DeepProxyHandler<T>) {
    const proxyMap = new WeakMap();

    function makeHandler(path: DeepPropertyKey) {
        return {
            set(target: any, propertyKey: PropertyKey, value: any, receiver) {
                if (typeof value === "object") {
                    value = proxify(value, [...path, propertyKey]);
                }
                target[propertyKey] = value;

                if (handler.set) {
                    handler.set(target, [...path, propertyKey], value, receiver);
                }
                return true;
            },

            deleteProperty(target: any, propertyKey: PropertyKey) {
                if (Reflect.has(target, propertyKey)) {
                    unproxy(target, propertyKey);
                    let deleted = Reflect.deleteProperty(target, propertyKey);
                    if (deleted && handler.deleteProperty) {
                        handler.deleteProperty(target, [...path, propertyKey]);
                    }
                    return deleted;
                }
                return false;
            }
        };
    }

    function unproxy(obj: any, key: PropertyKey) {
        if (proxyMap.has(obj[key])) {
            // console.log('unproxy',key);
            obj[key] = proxyMap.get(obj[key]);
            proxyMap.delete(obj[key]);
        }

        for (let k of Object.keys(obj[key])) {
            if (typeof obj[key][k] === "object") {
                unproxy(obj[key], k);
            }
        }
    }

    function proxify(obj: any, path: DeepPropertyKey) {
        for (let key of Object.keys(obj)) {
            if (typeof obj[key] === "object") {
                obj[key] = proxify(obj[key], [...path, key]);
            }
        }
        let p = new Proxy(obj, makeHandler(path));
        proxyMap.set(p, obj);
        return p;
    }

    return proxify(target, []);
}
