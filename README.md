# @actdim/utico

A modern foundation toolkit for complex TypeScript apps.

## Table of Contents

- [Installation](#installation)
- [Modules](#modules)
    - [typeCore — Expressive Type Composition](#typecore--expressive-type-composition)
    - [typeUtils — Runtime Type Utilities](#typeutils--runtime-type-utilities)
    - [StructEvent — Typed DOM Events](#structevent--typed-dom-events)
    - [watchable — Promise & Function Tracking](#watchable--promise--function-tracking)
    - [asyncMutex — Async Mutual Exclusion](#asyncmutex--async-mutual-exclusion)
    - [store — Structured Persistence](#store--structured-persistence)
- [License](#license)

---

## Installation

```bash
npm install @actdim/utico
# or
pnpm add @actdim/utico
```

**Peer dependencies** (install only what you use):

```bash
pnpm add dexie uuid moment
```

> `dexie` and `uuid` are required for the `store` module. `moment` is required for date/time formatting utilities.

---

## Modules

### typeCore — Expressive Type Composition

**Import:** `@actdim/utico/typeCore`

A comprehensive set of TypeScript utility types and helper functions for advanced type manipulation.

#### Types

| Type                         | Description                                                       |
| ---------------------------- | ----------------------------------------------------------------- |
| `Skip<T, K>`                 | A more useful version of `Omit` — removes keys `K` from `T`       |
| `Filter<T, V>`               | Keeps only properties of `T` whose values extend `V`              |
| `Diff<T, U>`                 | Properties in `T` that are not in `U`                             |
| `StrictDiff<T, U>`           | Properties in `T` that differ from `U` (by type)                  |
| `CommonPart<T, U>`           | Mathematical intersection — shared properties with types from `T` |
| `CommonKeys<T, U>`           | Union of keys shared by `T` and `U`                               |
| `UnionToIntersection<U>`     | Converts a union type to an intersection type                     |
| `ValueUnion<T>`              | Union of all property value types in `T`                          |
| `KeyPath<T>`                 | Dot-notation path strings for all nested properties of `T`        |
| `KeyPathValue<T, P>`         | Value type at a given `KeyPath` `P` in `T`                        |
| `KeyPathValueMap<T>`         | Partial map of `KeyPath` strings to their values                  |
| `OneOfType<T>`               | Discriminated union — exactly one property of `T` is set          |
| `Weaken<T, K>`               | Replaces specified keys in `T` with `any`                         |
| `Mutable<T>`                 | Removes `readonly` from all properties                            |
| `Overwrite<Base, Overrides>` | Merges types, with `Overrides` taking precedence                  |
| `Func<TArgs, T>`             | Generic function type                                             |
| `Action<TArgs>`              | Function returning `void`                                         |
| `AsyncFunc<TArgs, T>`        | Async function type                                               |
| `Executor<T>`                | Function returning `T` or `Promise<T>`                            |
| `MaybePromise<T>`            | `T` or `PromiseLike<T>`                                           |
| `Factory<T, TArgs>`          | Factory function type                                             |
| `IProvider<TFactory>`        | Object with a `get` factory method                                |
| `AddPrefix<T, P>`            | Adds prefix `P` to a string or to all keys of an object           |
| `AddSuffix<T, S>`            | Adds suffix `S` to a string or to all keys of an object           |
| `RemovePrefix<T, P>`         | Removes prefix `P` from a string or all keys                      |
| `RemoveSuffix<T, S>`         | Removes suffix `S` from a string or all keys                      |
| `ToUpper<T>`                 | Uppercases a string literal or all keys of an object              |
| `ToLower<T>`                 | Lowercases a string literal or all keys of an object              |
| `Constructor`                | `new (...args: any[]) => any`                                     |
| `ConstructorClass<T>`        | Extracts the instance type from a constructor                     |
| `CallableConstructor<T>`     | Constructor callable with or without `new`                        |
| `IF<Condition, Then, Else>`  | Conditional type alias                                            |

#### Functions

| Function                      | Description                                                           |
| ----------------------------- | --------------------------------------------------------------------- |
| `getPrefixer(prefix)`         | Returns `(value: string) => string` that prepends `prefix`            |
| `getValuePrefixer<T>(prefix)` | Returns a function that prefixes all values of a string-valued object |
| `getKeyPrefixer<T>(prefix)`   | Returns a function that prefixes all keys of an object                |

#### Usage Examples

```typescript
import type {
    Skip,
    Filter,
    Diff,
    CommonPart,
    KeyPath,
    KeyPathValue,
    KeyPathValueMap,
    OneOfType,
    Mutable,
    Overwrite,
    Func,
    Executor,
    MaybePromise,
    AddPrefix,
    RemovePrefix,
} from '@actdim/utico/typeCore';
import { getPrefixer, getValuePrefixer, getKeyPrefixer } from '@actdim/utico/typeCore';

// Skip — remove specific keys
type User = { id: number; name: string; password: string };
type PublicUser = Skip<User, 'password'>;
// => { id: number; name: string }

// Filter — keep only properties of a given type
type StringProps = Filter<User, string>;
// => { name: string; password: string }

// Diff — remove overlapping keys
type A = { x: number; y: number; z: number };
type B = { y: number };
type OnlyInA = Diff<A, B>;
// => { x: number; z: number }

// CommonPart — shared properties
type Common = CommonPart<{ a: number; b: string }, { b: string; c: boolean }>;
// => { b: string }

// KeyPath — deeply nested dot-notation paths
type Config = { server: { host: string; port: number }; debug: boolean };
type Paths = KeyPath<Config>;
// => "server" | "debug" | "server.host" | "server.port"

type HostType = KeyPathValue<Config, 'server.host'>;
// => string

// Partial deep-update patch object
const patch: KeyPathValueMap<Config> = { 'server.port': 8080 };

// OneOfType — exactly one property set
type Payload = OneOfType<{ text: string; html: string; json: object }>;
// valid: { text: "hello", html: null, json: null }
// valid: { text: null, html: "<b>hi</b>", json: null }

// Mutable — remove readonly
type ReadonlyPoint = { readonly x: number; readonly y: number };
type Point = Mutable<ReadonlyPoint>;
// => { x: number; y: number }

// Overwrite — merge with override
type Base = { id: number; name: string; active: boolean };
type Updated = Overwrite<Base, { active: string }>;
// => { id: number; name: string; active: string }

// AddPrefix / RemovePrefix on object keys
type Prefixed = AddPrefix<{ name: string; age: number }, 'user_'>;
// => { user_name: string; user_age: number }

type Unprefixed = RemovePrefix<Prefixed, 'user_'>;
// => { name: string; age: number }

// getPrefixer
const withNs = getPrefixer('app:');
withNs('config'); // => "app:config"

// getValuePrefixer
const prefixValues = getValuePrefixer<{ a: string; b: string }>('v_');
prefixValues({ a: 'foo', b: 'bar' });
// => { a: 'v_foo', b: 'v_bar' }

// getKeyPrefixer
const prefixKeys = getKeyPrefixer<{ foo: 1; bar: 2 }>('x_');
prefixKeys({ foo: 1, bar: 2 });
// => { x_foo: 1, x_bar: 2 }
```

---

### typeUtils — Runtime Type Utilities

**Import:** `@actdim/utico/typeUtils`

Runtime helpers that complement the pure-type utilities in `typeCore`: typed object access,
property-name reflection, constructor binding, proxies, enums, and JSON helpers.

---

#### Constructor Utilities

These utilities solve a common TypeScript problem: creating a reusable, pre-typed alias for a
generic class without repeating its type arguments everywhere.

**Background.** Consider `StructEvent<TStruct, TTarget>` — a generic typed event class
(see [StructEvent](#structevent--typed-dom-events)).
Inside `PersistentCache` you want to work with
`StructEvent<PersistentCacheEventStruct, PersistentCache>` as if it were its own named type.
TypeScript offers four ways to achieve this; each has different trade-offs.

---

##### `typed()`

```ts
function typed<TCtor extends Constructor>(ctor: TCtor): CallableConstructor<TCtor>
```

Narrows a generic constructor to a pre-typed alias using a TypeScript
**Instantiation Expression** (TS 4.7+). Zero runtime cost — returns `ctor` as-is.
The type arguments are bound at the call site by passing `MyClass<A, B>` as a *value expression*
(without `new`), so the inferred constructor already has the concrete types locked in before
`typed` is called.

```ts
const PersistentCacheEvent = typed(StructEvent<PersistentCacheEventStruct, PersistentCache>);

const evt = new PersistentCacheEvent("evict", {
    detail: { records },
    target: this,
    cancelable: true,
});
```

---

##### `createConstructor()`

```ts
function createConstructor<TConstructor extends Constructor>(
    type: TConstructor
): CallableConstructor<TConstructor>
```

Same as `typed()` — binds generic type arguments via an Instantiation Expression — but also makes
the constructor **callable without `new`**. It wraps the class in a plain function that forwards
all arguments, and patches `prototype` so `instanceof` still works correctly.

```ts
const PersistentCacheEvent = createConstructor(StructEvent<PersistentCacheEventStruct, PersistentCache>);

// no new required:
const evt = PersistentCacheEvent("evict", { detail: { records }, target: this });
```

> For primitive-backed types (`String`, `Number`) the original constructor is returned unchanged,
> since they are already callable without `new`.

---

#### Comparison: 4 ways to bind a generic constructor

All four examples produce a bound alias for `StructEvent<PersistentCacheEventStruct, PersistentCache>`.

**1. Subclass**

```ts
class PersistentCacheEvent
    extends StructEvent<PersistentCacheEventStruct, PersistentCache> {}
```

**2. Manual cast**

```ts
type PersistentCacheEvent = StructEvent<PersistentCacheEventStruct, PersistentCache>;
const PersistentCacheEvent = StructEvent as new (
    ...args: ConstructorParameters<typeof StructEvent<PersistentCacheEventStruct, PersistentCache>>
) => PersistentCacheEvent;
```

**3. `typed()` + Instantiation Expression** *(recommended)*

```ts
const PersistentCacheEvent = typed(StructEvent<PersistentCacheEventStruct, PersistentCache>);
const evt = new PersistentCacheEvent("evict", { detail: { records }, target: this });
```

**4. `createConstructor()` — callable without `new`**

```ts
const PersistentCacheEvent = createConstructor(StructEvent<PersistentCacheEventStruct, PersistentCache>);
const evt = PersistentCacheEvent("evict", { detail: { records }, target: this }); // no new
```

---

**Feature comparison**

| | Subclass | Manual cast | `typed()` | `createConstructor()` |
|---|:---:|:---:|:---:|:---:|
| Runtime overhead | new class | none | **none** | wrapper function |
| `new` required | yes | yes | yes | **no** |
| `instanceof` | **yes** | no | no | no |
| Can add methods | **yes** | no | no | no |
| Verbosity | medium | **high** | **low** | **low** |
| Requires TS | any | any | **4.7+** | **4.7+** |

**When to choose:**

- **Subclass** — when you need `instanceof` checks, want to add methods, or need a distinct runtime type.
- **Manual cast** — when TS < 4.7 is required, or you prefer zero dependencies (verbose but explicit).
- **`typed()`** — the default choice: concise, zero runtime cost. Requires TS 4.7+.
- **`createConstructor()`** — same as `typed()`, but the constructor must be callable without `new`
  (e.g. factory patterns, functional-style code).

---

#### Object / Key Utilities

| Function | Description |
|----------|-------------|
| `keysOf(obj)` | Typed `Object.keys` — returns `(keyof T)[]` instead of `string[]` |
| `keyOf<T>(key)` | Returns a property name literal narrowed to `keyof T`. No object required — useful for building typed key references |
| `nameOf<T>(f)` | Extracts a property name from a lambda `x => x.prop` at runtime via `Proxy` |
| `entry(obj, name, caseInsensitive?)` | Looks up a key (optionally case-insensitive) and returns `[resolvedKey, value]` |

```ts
keysOf({ a: 1, b: 2 })          // => ["a", "b"] typed as ("a" | "b")[]

keyOf<CacheMetadataRecord>("expiresAt")  // => "expiresAt" — typed, no runtime object needed

nameOf<User>(x => x.email)       // => "email"
```

---

#### Constraint Helpers

| Function | Description |
|----------|-------------|
| `satisfies<TShape>()` | Curried constraint: validates `obj` extends `TShape` without widening the inferred type |
| `strictSatisfies<T>()` | Like `satisfies`, but also rejects objects with extra keys beyond the shape |

```ts
const opts = satisfies<{ timeout: number }>()({ timeout: 5000, retries: 3 });
// opts is inferred as { timeout: number; retries: number }, not widened to { timeout: number }
```

---

#### Assignment Utilities

| Function | Description |
|----------|-------------|
| `assignWith(dst, src, callback?)` | Conditional assign: iterates `src` keys, calls `callback(key, value, set)` to control each assignment |
| `update(dst, src, props?)` | Typed assign: `src` must be `Partial<T>`; optional `props` list limits which keys are copied |
| `copy(src, dst, props?)` | Like `update` but with source and destination swapped |

---

#### Path Utilities

| Function | Description |
|----------|-------------|
| `getPropertyPath<T>(expr)` | Captures a property access chain from a lambda as `(string \| number \| symbol)[]` via recursive proxy |
| `combinePropertyPath(path)` | Serialises a path array into bracket-notation: `["nested"]["0"]["name"]` |

```ts
getPropertyPath<Config>(x => x.server.port)  // => ["server", "port"]
combinePropertyPath(["server", "port"])       // => '["server"]["port"]'
```

---

#### Proxy Utilities

| Function | Description |
|----------|-------------|
| `proxify<T>(source)` | Lazy proxy: forwards every get/set to `source()` evaluated at access time |
| `toReadOnly<T>(obj, throwOnSet?)` | Deep read-only proxy; silently ignores writes (or throws if `throwOnSet: true`). Toggle with the `[$lock]` symbol |
| `createDeepProxy<T>(target, handler)` | Deep-change proxy: `handler.set` and `handler.deleteProperty` receive the full `DeepPropertyKey` path |

---

#### JSON Utilities

| Function | Description |
|----------|-------------|
| `orderedStringify(obj, keyCompareFn?, replacer?, space?)` | Stable JSON serialisation: sorts object keys recursively before stringifying |
| `jsonEquals(obj1, obj2)` | Structural equality via `orderedStringify` |
| `jsonClone<T>(obj)` | Deep clone via `JSON.parse(JSON.stringify(obj))` — for plain JSON-serialisable data |

```ts
jsonEquals({ b: 2, a: 1 }, { a: 1, b: 2 }) // => true (key order doesn't matter)
```

---

#### Enum Utilities

| Function | Description |
|----------|-------------|
| `getEnumKeys<T>(enumType)` | Returns the string keys of a TS enum, filtering reverse-mapping numeric keys |
| `getEnumValues<T>(enumType)` | Returns the values of a TS enum |
| `getEnumValue<T>(enumType, name, defaultValue)` | Looks up an enum member by name; returns `defaultValue` when missing |

```ts
enum Color { Red = 0, Green = 1, Blue = 2 }

getEnumKeys(Color)   // => ["Red", "Green", "Blue"]
getEnumValues(Color) // => [0, 1, 2]
getEnumValue(Color, "Green", Color.Red) // => 1
getEnumValue(Color, "Purple", Color.Red) // => 0 (default)
```

---

### StructEvent — Typed DOM Events

**Import:** `@actdim/utico/structEvent`

`StructEvent` and `StructEventTarget` bring the standard DOM `EventTarget` / `CustomEvent` API
into TypeScript's type system. You describe every event your class can emit as a **struct** — a
plain object type where keys are event names and values are the `detail` payload types — and the
compiler enforces correct event names, `detail` shapes, and listener signatures everywhere.

#### Classes

| Class | Description |
|-------|-------------|
| `StructEvent<TStruct, TTarget, TType>` | Typed `CustomEvent`. `.detail` is `TStruct[TType]`; `.target` is `TTarget`. `TType` defaults to all keys of `TStruct` and is inferred automatically when constructing. |
| `StructEventTarget<TStruct>` | `EventTarget` subclass with typed overloads for `addEventListener`, `removeEventListener`, `dispatchEvent`, and `hasEventListener`. |

#### Constructor: `StructEvent`

```ts
new StructEvent<TStruct, TTarget, TType>(
    type: TType,
    eventInitDict?: CustomEventInit<TStruct[TType]> & { target: TTarget }
)
```

#### Methods: `StructEventTarget`

| Method | Description |
|--------|-------------|
| `addEventListener<K>(type, listener, options?)` | Adds a typed listener; `listener` receives `StructEvent<TStruct, this, K>` |
| `removeEventListener<K>(type, listener, options?)` | Removes a previously added typed listener |
| `dispatchEvent<K>(event)` | Dispatches a `StructEvent`; TypeScript rejects events whose struct does not match |
| `hasEventListener<K>(type, listener)` | Returns `true` if the exact listener is currently registered |

#### Usage Examples

```typescript
import { StructEvent, StructEventTarget } from '@actdim/utico/structEvent';
import { typed } from '@actdim/utico/typeUtils';

// --- 1. Define the event struct ---
// Keys = event names, values = detail payload types

type PersistentCacheEventStruct = {
    evict: { records: CacheMetadataRecord[] };
};

// --- 2. Extend StructEventTarget ---

class PersistentCache extends StructEventTarget<PersistentCacheEventStruct> {

    // --- Dispatching: Option A — inline `this` type (zero boilerplate) ---
    //
    // Inside a class method `this` is a polymorphic type, so you can pass it
    // directly as the second type argument. TypeScript infers "evict",
    // checks `detail` against the struct, and verifies `target`.

    async deleteExpiredA() {
        const records = await this.fetchExpired();

        this.dispatchEvent(
            new StructEvent<PersistentCacheEventStruct, this>("evict", {
                detail: { records },
                target: this,
                cancelable: true,
            })
        );
    }

    // --- Dispatching: Option B — pre-bound alias with typed() (recommended for reuse) ---
    //
    // Bind the constructor once at module scope (or as a static field).
    // See the Constructor Utilities section in typeUtils for all four
    // binding strategies (subclass, manual cast, typed(), createConstructor()).

    async deleteExpiredB() {
        const records = await this.fetchExpired();

        this.dispatchEvent(
            new PersistentCacheEvent("evict", {
                detail: { records },
                target: this,
                cancelable: true,
            })
        );
    }
}

// Alias created once at module scope — equivalent to a named type for
// StructEvent<PersistentCacheEventStruct, PersistentCache>
const PersistentCacheEvent = typed(StructEvent<PersistentCacheEventStruct, PersistentCache>);

// --- 3. Listening to typed events ---

const cache = await PersistentCache.open("my-cache");

cache.addEventListener("evict", (e) => {
    // e.detail  → { records: CacheMetadataRecord[] }   (typed)
    // e.target  → PersistentCache                       (typed)
    console.log("Evicted records:", e.detail.records);
});
```

**All four ways to create the bound alias** are shown in the
[Constructor Utilities](#constructor-utilities) section of typeUtils, using exactly
`StructEvent<PersistentCacheEventStruct, PersistentCache>` as the running example.

---

### watchable — Promise & Function Tracking

**Import:** `@actdim/utico/watchable`

Track the execution state of promises and functions — useful for loading indicators, UI state, and conditional logic without `try/catch` boilerplate.

#### Types

| Type                      | Description                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| `PromiseStatus`           | `"pending" \| "fulfilled" \| "rejected"`                         |
| `WatchablePromise<T>`     | `PromiseLike<T>` extended with `status`, `settled`, and `result` |
| `WatchableFunc<TArgs, T>` | Function extended with an `executing` flag                       |

#### Functions

| Function      | Signature                                         | Description                                   |
| ------------- | ------------------------------------------------- | --------------------------------------------- |
| `watch`       | `(fn: Executor<T>) => WatchablePromise<T>`        | Wraps an executor in a trackable promise      |
| `toWatchable` | `(fn: Func<TArgs, T>) => WatchableFunc<TArgs, T>` | Wraps a function to track its execution state |

#### Usage Examples

```typescript
import { watch, toWatchable } from '@actdim/utico/watchable';

// --- watch: observable promise ---

const request = watch(async () => {
    const res = await fetch('/api/data');
    return res.json();
});

console.log(request.status); // "pending"
console.log(request.settled); // false

await request;

console.log(request.status); // "fulfilled" or "rejected"
console.log(request.settled); // true
console.log(request.result); // the resolved value (or undefined if rejected)

// Useful in UI: show spinner while pending
setInterval(() => {
    if (!request.settled) showSpinner();
    else hideSpinner();
}, 100);

// --- toWatchable: track function execution ---

const saveData = toWatchable(async (data: object) => {
    await fetch('/api/save', { method: 'POST', body: JSON.stringify(data) });
});

console.log(saveData.executing); // false

saveData({ name: 'Alice' }); // call does not need to be awaited to check state

console.log(saveData.executing); // true (async function is running)

// Prevent double-submission
const submitButton = document.querySelector('button')!;
submitButton.addEventListener('click', () => {
    if (saveData.executing) return; // guard against concurrent calls
    saveData({ name: 'Bob' });
});
```

---

### asyncMutex — Async Mutual Exclusion

**Import:** `@actdim/utico/asyncMutex`

A lightweight async mutex that serializes concurrent async operations. Prevents race conditions when accessing shared resources.

#### Class: `AsyncMutex`

| Method     | Signature                                             | Description                                                         |
| ---------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| `lock`     | `(timeoutMs?: number) => Promise<() => void>`         | Acquires the lock; returns an `unlock` function. Throws on timeout. |
| `tryLock`  | `() => (() => void) \| null`                          | Non-blocking acquire; returns `unlock` or `null` if already locked. |
| `dispatch` | `(fn: Executor<T>, timeoutMs?: number) => Promise<T>` | Acquires lock, runs `fn`, releases lock — the recommended pattern.  |

#### Usage Examples

```typescript
import { AsyncMutex } from '@actdim/utico/asyncMutex';

const mutex = new AsyncMutex();

// --- dispatch: the simplest pattern ---

async function updateCounter() {
    return mutex.dispatch(async () => {
        const current = await db.get('counter');
        await db.set('counter', current + 1);
        return current + 1;
    });
}

// Safe to call concurrently — operations are serialized
await Promise.all([updateCounter(), updateCounter(), updateCounter()]);

// --- lock / unlock: manual control ---

async function criticalSection() {
    const unlock = await mutex.lock();
    try {
        await doWork();
    } finally {
        unlock(); // always release!
    }
}

// --- lock with timeout ---

async function timedSection() {
    let unlock: (() => void) | undefined;
    try {
        unlock = await mutex.lock(5000); // wait at most 5 seconds
        await doSlowWork();
    } catch (e) {
        if ((e as Error).message === 'Mutex lock timeout') {
            console.warn('Could not acquire lock in time');
        } else {
            throw e;
        }
    } finally {
        unlock?.();
    }
}

// --- tryLock: fire-and-forget, skip if busy ---

function syncSnapshot() {
    const unlock = mutex.tryLock();
    if (!unlock) {
        console.log('Already syncing, skipping...');
        return;
    }
    try {
        takeSnapshot();
    } finally {
        unlock();
    }
}
```

---

### store — Structured Persistence

**Imports:**

- `@actdim/utico/store/storeContracts` — types and interfaces
- `@actdim/utico/store/persistentStore` — `PersistentStore` (main entry point)

Built on [Dexie](https://dexie.org/) (IndexedDB). Uses `AsyncMutex` internally to protect concurrent database access. Transactions are managed automatically — no manual transaction handling needed.

#### Core Types

| Type / Class | Description |
|--------------|-------------|
| `MetadataRecord` | Base metadata: `key`, `createdAt`, `updatedAt`, `tags` |
| `DataRecord<TValue>` | `{ key: string; value: TValue }` |
| `StoreItem<T, TValue>` | Combined: `{ metadata?: T; data?: DataRecord<TValue> }` |
| `ChangeSet<T>` | `{ key: string; changes: KeyPathValueMap<T> }` |
| `FieldDef<T>` | Index definition for a field of `T`: `"field"`, `"&field"` (unique), `"*field"` (multi-entry), `"++field"` (auto-increment) |
| `FieldDefTemplate<T>` | `FieldDef<T>[]` — full index schema; TypeScript enforces valid field names and modifier combinations |
| `OrderDirection` | `"asc" \| "desc"` |

#### Class: `PersistentStore<T extends MetadataRecord>`

The main entry point for structured persistence. Key features:

- **Standard metadata out of the box** — `key`, `createdAt` (auto), `updatedAt` (auto), `tags`
- **Custom metadata types** — extend `MetadataRecord` with your own fields and pass a generic type parameter
- **Custom indexed fields** — declare additional indexes via `FieldDefTemplate` to enable fast index-based queries
- **Type-safe querying** — `where()` accepts only declared indexed fields; value types match the field type
- **No transaction boilerplate** — all operations run in optimal transactions automatically

| Static Method | Description |
|---------------|-------------|
| `PersistentStore.open<T>(name, fieldDefTemplate?, options?)` | Open or create a named store. Pass a custom `fieldDefTemplate` when using a custom metadata type. |
| `PersistentStore.exists(name)` | Check if a named store exists |
| `PersistentStore.delete(name)` | Delete a named store |

#### Interface: `IPersistentStore<T>`

| Method | Description |
|--------|-------------|
| `open()` | Open the database (called automatically by `PersistentStore.open`) |
| `getKeys()` | Get all stored keys |
| `contains(key)` | Check if a key exists |
| `get<TValue>(key)` | Get a single item by key |
| `set<TValue>(metadata, value)` | Create or overwrite an item |
| `getOrSet<TValue>(metadata, factory)` | Get existing or create via factory |
| `bulkGet<TValue>(keys)` | Get multiple items |
| `bulkSet<TValue>(metadataRecords, dataRecords)` | Insert multiple items |
| `delete(key)` | Delete an item |
| `bulkDelete(keys)` | Delete multiple items |
| `clear()` | Delete all items |
| `query<TValue>()` | In-memory filterable/pageable collection over all items |
| `where<K>(field)` | Start an index-based query on a declared indexed field |
| `orderBy(field, direction)` | Get items ordered by an indexed field |
| `distinct(field)` | Get items with unique values of an indexed field |

#### Index Schema

The field template is an array of `FieldDef` strings. The first entry is always the primary key.

| Syntax | Meaning |
|--------|---------|
| `"field"` | Regular index |
| `"&field"` | Unique index |
| `"*field"` | Multi-entry index (for array-valued fields, e.g. `tags`) |
| `"++field"` | Auto-increment index |

`defaultMetadataFieldDefTemplate` (exported from `persistentStore`) provides the base schema `["&key", "createdAt", "updatedAt", "tags"]`. Spread it when adding custom fields:

```typescript
[...defaultMetadataFieldDefTemplate, "score", "*categories"]
```

TypeScript enforces that every entry is a valid `FieldDef<keyof T>` — only field names from your metadata type (with their modifier variants) are suggested and accepted. Fields not in the template are still stored, but cannot be used in `where()` or `orderBy()`.

#### `where()` — Index-based Queries

`where(field)` returns a `WhereFilter` typed to the field's value type. All methods return an `IStoreCollection` chainable with `.filter()`, `.limit()`, `.offset()`, `.toArray()`, `.getCount()`, etc.

| Method | Description |
|--------|-------------|
| `equals(value)` | Exact match |
| `above(value)` | Strictly greater than (numbers, strings, dates) |
| `aboveOrEqual(value)` | Greater than or equal |
| `below(value)` | Strictly less than |
| `belowOrEqual(value)` | Less than or equal |
| `between(lower, upper)` | Range (inclusive/exclusive) |
| `anyOf(values[])` | Matches any value in the list |
| `noneOf(values[])` | Excludes values in the list |
| `startsWith(prefix)` | String prefix match |
| `equalsIgnoreCase(value)` | Case-insensitive string match |

#### Usage Examples

```typescript
import { PersistentStore } from '@actdim/utico/store/persistentStore';

// --- Basic usage ---

const store = await PersistentStore.open('my-app-store');

await store.set({ key: 'user:42' }, { name: 'Alice', role: 'admin' });

const item = await store.get<{ name: string; role: string }>('user:42');
console.log(item.metadata?.createdAt); // auto-set on write
console.log(item.data?.value.name);    // "Alice"

await store.getOrSet(
  { key: 'session:abc' },
  () => ({ token: crypto.randomUUID(), expiresAt: Date.now() + 3600_000 })
);

await store.bulkSet(
  [{ key: 'item:1' }, { key: 'item:2' }],
  [{ key: 'item:1', value: { x: 1 } }, { key: 'item:2', value: { x: 2 } }]
);

const items = await store.bulkGet<{ x: number }>(['item:1', 'item:2']);

await store.delete('user:42');
await store.bulkDelete(['item:1', 'item:2']);
await store.clear();
```

```typescript
import { PersistentStore, defaultMetadataFieldDefTemplate } from '@actdim/utico/store/persistentStore';
import type { MetadataRecord } from '@actdim/utico/store/storeContracts';

// --- Custom metadata with indexed fields and typed queries ---

type ArticleMetadata = MetadataRecord & {
  author: string;
  publishedAt: number;
  score: number;
};

const store = await PersistentStore.open<ArticleMetadata>(
  'articles',
  [...defaultMetadataFieldDefTemplate, 'author', 'publishedAt', 'score']
  // TypeScript only accepts valid FieldDef<keyof ArticleMetadata> entries
);

await store.set(
  { key: 'post:1', author: 'Alice', publishedAt: Date.now(), score: 42 },
  '<p>Content here</p>'
);

// Index-based query — fast, uses IndexedDB index directly
const topPosts = await store.where('score').above(10).toArray();

// Range query on a date field
const recent = await store
  .where('publishedAt')
  .above(Date.now() - 7 * 86400_000)
  .toArray();

// In-memory filter + pagination
const page = await store
  .query()
  .filter(m => m.author === 'Alice')
  .offset(0)
  .limit(10)
  .toArray('publishedAt', 'desc');
```

---

## License

Proprietary — © Pavel Borodaev
