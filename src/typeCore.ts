// @filename: typeCore.ts

// type SplitStringToUnion<T extends string, Separator extends string> = T extends `${infer First}${Separator}${infer Rest}`
//   ? First | SplitStringToUnion<Rest, Separator>
//   : T;

// more useful version of Omit

export type Skip<T extends object, K extends keyof T> = Pick<T, Exclude<keyof T, K>>; // FilterOut
// export type Skip<T, K extends keyof T> = {
//     [P in keyof T as P extends K ? never : P]: T[P];
// };

// export type PickEx<T extends object, TKeys extends keyof T | Array<keyof T>> = {
//     [K in TKeys extends Array<keyof T> ? TKeys[number] : TKeys]: T[K];
// };

export type Filter<T extends object, V> = {
    [K in keyof T as T[K] extends V ? K : never]: T[K];
};

export type Diff<T, U> = Omit<T, keyof U>;
export type StrictDiff<T, U> = {
    [K in keyof T as K extends keyof U ? (T[K] extends U[K] ? (U[K] extends T[K] ? never : K) : K) : K]: T[K];
};

/** Mathematical (real) intersection */
export type CommonPart<T, U> = Pick<T, CommonKeys<T, U>>;
export type CommonPartEx<T extends object[]> =
    T extends [infer A extends object, infer B extends object, ...infer Rest extends object[]]
    ? CommonPartEx<[Pick<A, Extract<keyof A, keyof B>>, ...Rest]>
    : T extends [infer Only extends object]
    ? Only
    : unknown;

export type CommonPartFromSchema<T extends Record<string, object>> =
    keyof T extends infer K ?
    K extends any ?
    CommonPart<T[K & keyof T], CommonPartFromSchema<Omit<T, K & keyof T>>>
    : unknown
    : unknown;

export type CommonKeys<T, U> = Extract<keyof T, keyof U>;
export type CommonKeysEx<T extends object[]> =
    T extends [infer A extends object, infer B extends object, ...infer Rest extends object[]]
    ? CommonKeysEx<[{ [K in Extract<keyof A, keyof B>]: any }, ...Rest]>
    : T extends [infer Only extends object]
    ? keyof Only
    : never;

export type UnionToIntersection<U> =
    (U extends any ? (x: U) => void : never) extends (x: infer R) => void ? R : never;

export type ValueUnion<T> = T[keyof T];

export type TupleFromKeys<T, K extends readonly (keyof T)[]> = {
    [I in keyof K]: K[I] extends keyof T ? T[K[I]] : never
};

export type Extend<T extends object, U extends object, K extends keyof U> = T & { [P in K]: U[K] };

// Validation
export type ValueOf<T extends object> = T[keyof T];
export type OneOnly<T, Key extends keyof T> = { [key in Exclude<keyof T, Key>]: null } & Pick<T, Key>;
export type OneOfByKey<T> = { [key in keyof T]: OneOnly<T, key> };
export type OneOfType<T> = ValueOf<OneOfByKey<T>>;

// Extract version
export type KeyOfType<FromType extends object, KeepType = any, Include = true> = {
    [K in keyof FromType]: FromType[K] extends KeepType ? (Include extends true ? K : never) : Include extends true ? never : K;
}[keyof FromType];

export type Weaken<T, K extends keyof T> = {
    [P in keyof T]: P extends K ? any : T[P];
};

export type Mutable<T extends object> = {
    -readonly [K in keyof T]: T[K];
};

export type Constructor = new (...args: any[]) => any;
// export type ConstructorParameters<TConstructor extends Constructor> = TConstructor extends new (...args: infer TArgs) => any ? TArgs : never;

// Extracts class instance type from class constructor
export type ConstructorClass<TConstructor extends Constructor> = TConstructor extends new (...args: any[]) => infer TClass ? TClass : never;

// This is what we want: to be able to create new class instances
// either with or without "new" keyword
export type CallableConstructor<TConstructor extends Constructor> = TConstructor &
    ((...args: ConstructorParameters<TConstructor>) => ConstructorClass<TConstructor>);

// ToUpperCase
export type ToUpper<T> = T extends string
    ? Uppercase<T>
    : {
        [K in keyof T as K extends string ? Uppercase<K> : K]: T[K];
    };

// ToLowerCase
export type ToLower<T> = T extends string
    ? Lowercase<T>
    : {
        [K in keyof T as K extends string ? Lowercase<K> : K]: T[K];
    };

export type AddPrefix<T, TPrefix extends string> = T extends string
    ? `${TPrefix}${T}`
    : {
        [K in keyof T as AddPrefix<K, TPrefix>]: T[K];
    };

export type AddSuffix<T, TSuffix extends string> = T extends string
    ? `${T}${TSuffix}`
    : {
        [K in keyof T as AddSuffix<K, TSuffix>]: T[K];
    };

export type RemovePrefix<T, TPrefix extends string> = T extends string
    ? T extends `${TPrefix}${infer Tail}`
    ? RemovePrefix<Tail, TPrefix>
    : T // never?
    : {
        [K in keyof T as RemovePrefix<K, TPrefix>]: T[K];
    };

export type RemoveSuffix<T, TSuffix extends string> = T extends string
    ? T extends `${infer Head}${TSuffix}`
    ? RemoveSuffix<Head, TSuffix>
    : T // never?
    : {
        [K in keyof T as RemoveSuffix<K, TSuffix>]: T[K];
    };

export const getPrefixer = (prefix: string) => (value: string) => {
    return `${prefix}${value}`;
};

export const getValuePrefixer =
    <T extends { [key: string]: string }>(prefix: string) =>
        (dict: T): T => {
            return Object.fromEntries(Object.keys(dict).map((k) => [k, `${prefix}${dict[k]}`])) as T;
        };

export const getKeyPrefixer =
    <T extends { [key: string]: any }>(prefix: string) =>
        (obj: T): object => {
            return Object.fromEntries(Object.keys(obj).map((k) => [`${prefix}${k}`, obj[k]]));
        };

// export type MaybePromise<T> = T extends undefined ? void : T | PromiseLike<Awaited<T>>; // TODO: check
export type MaybePromise<T> = T extends undefined ? void : T | PromiseLike<T>;

export type Func<TArgs extends any[] = any[], T = any> = {
    (...args: TArgs): T;
    name?: string;
};

export type Action<TArgs extends any[] = any[]> = Func<TArgs, void>;

export type AsyncFunc<TArgs extends any[] = any[], T = any> = Func<TArgs, PromiseLike<T>>;

// use built-in ReturnType:
// type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
// my version:
// export type ReturnType<TFunc> = TFunc extends Func<infer TArgs, infer TResult> ? TResult : never;

// use built-in Awaited type:
/*
// Recursively unwraps the "awaited type" of a type. 
// Non-promise "thenables" should resolve to `never`. 
// This emulates the behavior of `await`.
type Awaited<T> = T extends null | undefined ? T : // special case for `null | undefined` when not in `--strictNullChecks` mode
    T extends object & { then(onfulfilled: infer F, ...args: infer _): any; } ? // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
        F extends ((value: infer V, ...args: infer _) => any) ? // if the argument to `then` is callable, extracts the first argument
            Awaited<V> : // recursively unwrap the value
        never : // the argument to `then` was not callable
    T; // non-object or non-thenable
*/

// my simple version (PromiseType):
// export type Awaited<TPromise> = TPromise extends PromiseLike<infer TResult> ? TResult : TPromise;

// AsyncReturnType
export type AwaitedReturnType<TFunc extends Func> = Awaited<ReturnType<TFunc>>;

export type Factory<T = any, TArgs extends any[] = []> = Func<TArgs, T>;

export type IProvider<TFactory = Factory> = {
    get: TFactory;
};

// (Func)ParameterType
// type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
/** see also built-in Parameters type */
export type ParameterType<TFunc, TParamIndex extends number> = TFunc extends Func<infer TArgs extends any[], infer TResult>
    ? TArgs[TParamIndex]
    : never;

// Lambda?
// export type Executor<T = void, TArgs extends any[] = []> = Func<TArgs, T> | AsyncFunc<[], T>; // same
export type Executor<T = void, TArgs extends any[] = []> = Func<TArgs, T | PromiseLike<T>>;

export type Overwrite<Base extends object, Overrides extends object> = Omit<Base, keyof Overrides> & Overrides;
// or
// export type Overwrite<Base extends object, Overrides extends object> = Pick<Base, Exclude<keyof Base, keyof Overrides>> & Overrides;

export type Extends<T extends object, TBase extends object> = T extends TBase ? true : false;

// more strict than Extract
export type RequireExtends<T extends TBase, TBase extends object> = T;

export type Strict<T, U extends T> =
    Exclude<keyof U, keyof T> extends never ? U : never;

export type MaybeExtends<T, TShape> = T extends TShape ? T : never;

export type KeyOf<T extends object, TKey extends keyof T> = TKey;

export type IsKeyOf<T, TKey extends object> = TKey extends keyof T ? true : false;

export type KeysOf<T extends object, TKeys extends keyof T | Array<keyof T>> = TKeys extends Array<keyof T> ? TKeys[number] : TKeys;

export type SafeKey<T extends object, K extends PropertyKey> = K extends keyof T ? K : never;

export type IsTuple<T> = T extends readonly [...infer Elements] ? (number extends Elements["length"] ? false : true) : false;

// for classes only:
// export type ExtractInterface<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R
//     ? { [K in keyof R]: R[K] }
//     : never;

// Struct(Copy), Shape, Interface 
export type Struct<T> = { [K in keyof T]: T[K] };

type NonFunctionPropertyKeys<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K
}[keyof T];

type NextDepthMap = {
    0: 1;
    1: 2;
    2: 3;
    3: 4;
    4: 5;
    5: 5;
};
type NextDepth<D extends number> = D extends keyof NextDepthMap ? NextDepthMap[D] : 5;

export type KeyPath<T, D extends number = 0> =
    D extends 5 ? never :
    T extends readonly any[]
    ? `${number}` | `${number}.${KeyPath<T[number], NextDepth<D>>}`
    : T extends object
    ? {
        [K in NonFunctionPropertyKeys<T> & (string | number)]:
        T[K] extends readonly any[]
        ? `${K}` |
        `${K}.${number}` |
        `${K}.${number}.${KeyPath<T[K][number], NextDepth<D>>}`
        : T[K] extends object
        ? `${K}` | `${K}.${KeyPath<T[K], NextDepth<D>>}`
        : `${K}`;
    }[NonFunctionPropertyKeys<T> & (string | number)]
    : never;

export type KeyPathValue<T, P extends string> =
    P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
    ? KeyPathValue<T[K], Rest>
    : T extends readonly any[]
    ? K extends `${number}`
    ? KeyPathValue<T[number], Rest>
    : never
    : never
    : P extends keyof T
    ? T[P]
    : T extends readonly any[]
    ? P extends `${number}`
    ? T[number]
    : never
    : never;

// Slice
export type KeyPathValueMap<T> = {
    [K in KeyPath<T>]?: KeyPathValue<T, K>;
};