# @actdim/utico

A modern foundation toolkit for complex TypeScript apps.

## Table of Contents

- [Installation](#installation)
- [Modules](#modules)
    - [typeCore — Expressive Type Composition](#typecore--expressive-type-composition)
    - [typeUtils — Runtime Type Utilities](#typeutils--runtime-type-utilities)
    - [stringCore — Locale-Aware String Utilities](#stringcore--locale-aware-string-utilities)
    - [metadata — Property Metadata](#metadata--property-metadata)
    - [decorators — Property Decorators](#decorators--property-decorators)
    - [dateTimeDataFormat — Date/Time Serialisation](#datetimedataformat--datetime-serialisation)
    - [StructEvent — Typed DOM Events](#structevent--typed-dom-events)
    - [watchable — Promise & Function Tracking](#watchable--promise--function-tracking)
    - [asyncMutex — Async Mutual Exclusion](#asyncmutex--async-mutual-exclusion)
    - [store — Structured Persistence](#store--structured-persistence)
    - [cache — Persistent Cache](#cache--persistent-cache)
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
pnpm add dexie uuid luxon
```

> `dexie` and `uuid` are required for the `store` module. `luxon` is required for the `dateTimeDataFormat` module.

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
TypeScript offers four ways to achieve this; each has different trade-offs — see the [full comparison](#comparison-4-ways-to-bind-a-generic-constructor) at the end of this section.

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

#### Object / Key Utilities

| Function | Description |
|----------|-------------|
| `keysOf(obj)` | Typed `Object.keys` — returns `(keyof T)[]` instead of `string[]` |
| `keyOf<T>(key)` | Returns a property name literal narrowed to `keyof T`. No object required — useful for building typed key references |
| `nameOf<T>(f)` | Extracts a property name from a lambda `x => x.prop` at runtime via `Proxy` |
| `entry(obj, name, caseInsensitive?)` | Looks up a key (optionally case-insensitive) and returns `[resolvedKey, value]` |
| `getPrototypes(obj)` | Returns the prototype chain as an array, from the object's direct prototype up to (but not including) `null` |

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

```ts
// proxify — lazy proxy that re-evaluates source on every get/set
let config = { theme: 'dark' };
const proxy = proxify(() => config);
proxy.theme;           // => 'dark'
config = { theme: 'light' };
proxy.theme;           // => 'light' — picks up the new object

// toReadOnly — deep read-only proxy (writes silently ignored by default)
const opts = toReadOnly({ server: { port: 3000 } });
opts.server.port;      // => 3000
opts.server.port = 80; // silently ignored
                       // pass true as second arg to throw on write attempts instead

// createDeepProxy — intercept deep mutations with the full property path
const state = createDeepProxy({ user: { name: 'Alice' } }, {
    set(target, path, value) {
        console.log('set', path.map(String).join('.'), '=', value);
        return true;
    },
    deleteProperty(target, path) {
        console.log('deleted', path.map(String).join('.'));
        return true;
    },
});
state.user.name = 'Bob';  // logs: "set user.name = Bob"
delete state.user.name;   // logs: "deleted user.name"
```

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

### stringCore — Locale-Aware String Utilities

**Import:** `@actdim/utico/stringCore`

Locale-aware string comparison and search utilities built on `Intl.Collator`. All functions accept an optional `locale` parameter (defaults to `navigator.language`). Non-string inputs fall back to reference equality or a default collator instead of throwing.

#### Functions

| Function | Description |
|----------|-------------|
| `equals(strA, strB, ignoreCase?, locale?)` | Returns `true` when strings are equal. Case-sensitive by default. Uses `Intl.Collator` for locale-correct comparison. |
| `compare(strA, strB, ignoreCase?, locale?)` | Returns a negative, zero, or positive number — same contract as `Array.prototype.sort`. |
| `ciCompare(strA, strB, locale?)` | Case-insensitive `compare`. Uses `sensitivity: "accent"` when available, falls back to `toLocaleUpperCase`. |
| `ciStartsWith(str, searchStr, locale?)` | Case-insensitive `String.prototype.startsWith`. Returns `false` for non-string inputs. |
| `ciEndsWith(str, searchStr, locale?)` | Case-insensitive `String.prototype.endsWith`. Returns `false` for non-string inputs. |
| `ciIndexOf(str, searchStr, locale?)` | Case-insensitive `String.prototype.indexOf`. Returns `-1` for non-string inputs or no match. |
| `ciIncludes(str, searchStr, locale?)` | Case-insensitive `String.prototype.includes`. Returns `false` for non-string inputs. |

#### Usage Examples

```typescript
import { equals, compare, ciCompare, ciStartsWith, ciEndsWith, ciIndexOf, ciIncludes } from '@actdim/utico/stringCore';

// equals
equals('Hello', 'hello')              // false (case-sensitive)
equals('Hello', 'hello', true)        // true  (case-insensitive)
equals('café', 'CAFÉ', true, 'fr')   // true  (locale-aware)

// compare — for sorting
['banana', 'Apple', 'cherry'].sort((a, b) => compare(a, b, true));
// => ['Apple', 'banana', 'cherry']

// ciStartsWith / ciEndsWith
ciStartsWith('Hello World', 'hello') // true
ciEndsWith('Hello World', 'WORLD')   // true

// ciIndexOf / ciIncludes
ciIndexOf('Hello World', 'WORLD')    // 6
ciIncludes('Hello World', 'WORLD')   // true
ciIncludes('Hello World', 'xyz')     // false
```

---

### metadata — Property Metadata

**Import:** `@actdim/utico/metadata`

A lightweight property metadata system backed by `WeakMap`. Attach arbitrary named slots of metadata to class properties via the `@metadata` decorator or the imperative API. Metadata is resolved through the prototype chain, so subclasses automatically inherit base-class metadata.

#### Functions

| Function | Description |
|----------|-------------|
| `metadata(value, slotName)` | Property decorator factory. Attaches `value` to the `slotName` slot of the decorated property. |
| `getPropertyMetadata<T>(target, propertyName, slotName?)` | Reads metadata for a property. If `slotName` is omitted, returns all slots for that property. Walks the prototype chain. |
| `updatePropertyMetadata(target, propertyName, value, slotName)` | Imperative equivalent of `@metadata`. |
| `getPropertyMetadataItem(metadata, obj)` | Low-level: resolves a `WeakMap` entry for `obj` by walking its prototype chain. |

#### Usage Examples

```typescript
import { metadata, getPropertyMetadata, updatePropertyMetadata } from '@actdim/utico/metadata';

// --- Decorator API ---

class Article {
    @metadata('Title of the article', 'label')
    @metadata(true, 'required')
    title: string;

    @metadata('Publication date', 'label')
    publishedAt: number;
}

const article = new Article();

getPropertyMetadata(article, 'title', 'label')    // => 'Title of the article'
getPropertyMetadata(article, 'title', 'required') // => true
getPropertyMetadata(article, 'title')             // => { label: '...', required: true }

// --- Imperative API ---

class Product {
    price: number;
}

updatePropertyMetadata(Product.prototype, 'price', 'EUR price in cents', 'label');
getPropertyMetadata(new Product(), 'price', 'label'); // => 'EUR price in cents'

// --- Prototype chain inheritance ---

class SpecialArticle extends Article {}

// SpecialArticle inherits metadata from Article.prototype
getPropertyMetadata(new SpecialArticle(), 'title', 'label'); // => 'Title of the article'
```

---

### decorators — Property Decorators

**Import:** `@actdim/utico/decorators`

| Decorator | Description |
|-----------|-------------|
| `@nonEnumerable` | Makes a class property non-enumerable: it is hidden from `Object.keys`, `for...in`, `JSON.stringify`, and spread (`{...obj}`), while remaining fully readable and writable via direct access. |

#### Usage Examples

```typescript
import { nonEnumerable } from '@actdim/utico/decorators';

class User {
    name: string;

    @nonEnumerable
    passwordHash: string;
}

const user = new User();
user.name = 'Alice';
user.passwordHash = 'abc123';

Object.keys(user)       // => ['name']  — passwordHash is hidden
JSON.stringify(user)    // => '{"name":"Alice"}'
user.passwordHash       // => 'abc123'  — still directly accessible
```

> **How it works:** the decorator replaces the property with an accessor on the prototype. On the first assignment, the accessor redefines the property as a non-enumerable own value on the specific instance, so subsequent reads are direct (no getter overhead).

---

### dateTimeDataFormat — Date/Time Serialisation

**Import:** `@actdim/utico/dateTimeDataFormat`

**Peer dependency:** `luxon ^3`

UTC-first date/time utilities built on [Luxon](https://moment.github.io/luxon/). Provides a canonical wire format (`yyyy-MM-dd'T'HH:mm:ss.SSS`), serialisation/deserialisation, display formatting, and helpers for OLE Automation and numeric timestamps.

#### Types

| Type | Description |
|------|-------------|
| `DateTimeDataFormat` | Interface for the default export: `serialize`, `deserialize`, `tryDeserialize`, `normalize`, `isValid`, `serializationFormat` |
| `DateValueFormats` | `{ string?: string; number?: DateNumberFormat }` — format hints passed to `toDateTime` |

#### Enum: `DateNumberFormat`

| Member | Description |
|--------|-------------|
| `UnixTimeMilliseconds` | Default — milliseconds since Unix epoch |
| `UnixTimeSeconds` | Seconds since Unix epoch |
| `OADate` | Microsoft OLE Automation date (fractional days since 1899-12-30) |

#### Functions

| Function | Description |
|----------|-------------|
| `toDateTime(source, formats?)` | Converts `string \| number \| Date \| DateTime` -> `DateTime` (UTC). Accepts optional `DateValueFormats` hints |
| `fromLocalDate(date)` | Reads the local time parts of a `Date` (e.g. from `normalize()`) and places them in UTC. Use to serialize a normalized `Date` back to the wire format |
| `formatDate(date, format?)` | Formats a `Date` or `DateTime` using a Luxon format string. Auto-selects a locale format when `format` is omitted |
| `getDateFromNumber(value, fmt?)` | Converts a numeric timestamp to a `Date` according to `DateNumberFormat` |
| `getDateFromOADate(oaDate)` | Converts a Microsoft OADate number to `Date` |
| `getOADateFromDate(date)` | Converts a `Date` to a Microsoft OADate string |

#### Default export — `dateTimeFormat`

| Method / Property | Signature | Description |
|-------------------|-----------|-------------|
| `serializationFormat` | `string` | `"yyyy-MM-dd'T'HH:mm:ss.SSS"` — the canonical wire format |
| `serialize(source)` | `-> string \| null` | Formats any supported source to the wire format |
| `deserialize(value)` | `-> DateTime` | Parses a wire-format string; throws on invalid input |
| `tryDeserialize(value)` | `-> DateTime \| null` | Like `deserialize` but returns `null` instead of throwing |
| `isValid(source)` | `-> boolean` | `true` for `null`, a valid wire-format string, or any `Date` |
| `normalize(source)` | `-> Date \| null` | Converts any supported source to a native `Date`. The local accessors (`getHours()`, etc.) reflect the original UTC values |

#### Usage Examples

```typescript
import dateTimeFormat, { toDateTime, fromLocalDate, formatDate, DateNumberFormat } from '@actdim/utico/dateTimeDataFormat';
import { DateTime } from 'luxon';

// Deserialize a wire-format string -> Luxon DateTime (UTC)
const dt = dateTimeFormat.deserialize("2024-03-15T10:30:45.123");
dt.year;     // 2024
dt.hour;     // 10
dt.zoneName; // "UTC"

// Serialize back to wire format
dateTimeFormat.serialize(dt);             // "2024-03-15T10:30:45.123"
dateTimeFormat.serialize(new Date(...));  // same format

// Safe parse — returns null instead of throwing
dateTimeFormat.tryDeserialize("bad");     // null

// isValid
dateTimeFormat.isValid("2024-03-15T10:30:45.000"); // true
dateTimeFormat.isValid("not-a-date");              // false
dateTimeFormat.isValid(null);                      // true (no value is OK)

// normalize — native Date whose getHours() reflects the UTC hour
const date = dateTimeFormat.normalize("2024-03-15T10:30:45.000");
date.getHours(); // 10 — regardless of local timezone

// toDateTime — flexible conversion
toDateTime("2024-03-15T10:30:45.000");                          // from s11n string
toDateTime(new Date());                                          // from Date
toDateTime(1710496245000, { number: DateNumberFormat.UnixTimeMilliseconds });
toDateTime(1710496245,    { number: DateNumberFormat.UnixTimeSeconds });
toDateTime("03/15/2024",  { string: "MM/dd/yyyy" });            // custom format

// formatDate — display formatting
formatDate(dt, "yyyy-MM-dd");          // "2024-03-15"
formatDate(dt);                        // auto-selected locale format

// fromLocalDate — serialize a normalize()'d Date back to the wire format
//
// normalize() produces a Date whose getHours() equals the original UTC hour.
// toDateTime(date) reads the epoch as UTC, which gives the wrong result for
// such Dates. fromLocalDate() reads the local time parts instead.
//
const normalized = dateTimeFormat.normalize("2024-03-15T10:30:45.123");
normalized.getHours();                 // 10 — correct for display in <input>
dateTimeFormat.serialize(fromLocalDate(normalized)); // "2024-03-15T10:30:45.123" ✓

// Typical <input type="datetime-local"> round-trip:
//   input.valueAsDate = dateTimeFormat.normalize(serverValue)
//   ...user edits...
//   const saved = dateTimeFormat.serialize(input.value);          // simplest
//   const saved = dateTimeFormat.serialize(fromLocalDate(input.valueAsDate)); // via Date
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
    // e.detail  -> { records: CacheMetadataRecord[] }   (typed)
    // e.target  -> PersistentCache                       (typed)
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
| `WatchablePromise<T>`     | `PromiseLike<T>` with observable state fields (see below)        |
| `WatchableFunc<TArgs, T>` | Function extended with an `executing` flag                       |

`WatchablePromise<T>` adds three read-only fields to the underlying promise:

| Field      | Type            | Description                                                                 |
| ---------- | --------------- | --------------------------------------------------------------------------- |
| `status`   | `PromiseStatus` | `"pending"` immediately; becomes `"fulfilled"` or `"rejected"` when settled |
| `settled`  | `boolean`       | Computed getter — `true` once `status` is no longer `"pending"`             |
| `result`   | `T \| undefined`| The resolved value after fulfillment; `undefined` after rejection           |

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
| `update<TValue>(key, metadataChanges, valueChanges?)` | Patch fields of a single item by key; returns count of records modified (0 if key not found) |
| `bulkUpdate(metadataChangeSets, dataChangeSets?)` | Patch fields of multiple items; each change set is `{ key, changes: KeyPathValueMap<T> }` |
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

// Patch individual fields without rewriting the whole record
await store.update('user:42', { tags: ['admin', 'verified'] });

// Patch multiple records in one transaction
await store.bulkUpdate([
  { key: 'item:1', changes: { tags: ['sale'] } },
  { key: 'item:2', changes: { tags: ['new'] } },
]);
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

### cache — Persistent Cache

**Imports:**

- `@actdim/utico/cache/persistentCache` — `PersistentCache`, `CacheOptions`, `PersistentCacheOptions`
- `@actdim/utico/cache/cacheContracts` — `CacheMetadataRecord`

Built on top of the `store` module. Adds expiration semantics (TTL, absolute expiration, sliding expiration) and a background cleanup job that evicts expired entries automatically.

#### Types

| Type | Description |
|------|-------------|
| `CacheMetadataRecord` | Extends `MetadataRecord` with `slidingExpiration`, `absoluteExpiration`, and `expiresAt` |
| `CacheOptions` | Per-entry expiration options (see below) |
| `PersistentCacheOptions` | Cache-level options: `cleanupTimeout` (ms between background cleanup runs) |
| `CacheEvictionEvent` | `{ records: CacheMetadataRecord[] }` — payload of the `"evict"` event |

#### `CacheOptions`

| Field | Type | Description |
|-------|------|-------------|
| `slidingExpiration` | `number` (ms) | Extends `expiresAt` by this duration on every `get()`. Recommended: combined with `absoluteExpiration` as a cap. |
| `absoluteExpiration` | `Date \| number` | Hard deadline — `expiresAt` is never pushed past this value. |
| `ttl` | `number \| { seconds?, minutes?, hours? }` | Sets `absoluteExpiration` relative to the creation time. |

#### Static Methods

| Method | Description |
|--------|-------------|
| `PersistentCache.open(name, options?)` | Open or create a named cache. Returns a `PersistentCache` instance. |
| `PersistentCache.exists(name)` | Check if a named cache database exists. |
| `PersistentCache.delete(name)` | Delete a named cache database. |

#### Instance Methods

| Method | Description |
|--------|-------------|
| `get<TValue>(key)` | Get an item and update `accessedAt` (and `expiresAt` if `slidingExpiration` is set). |
| `set(metadata, value, options)` | Create or overwrite an item with expiration options. Auto-generates a UUID key if `metadata.key` is absent. |
| `getOrSet(metadata, factory, options)` | Return the existing item or create it via `factory`. `metadata.key` is required. |
| `bulkGet<TValue>(keys)` | Get multiple items by key. |
| `bulkSet(metadataRecords, dataRecords, optionsProvider)` | Insert multiple items. `optionsProvider` is called per-record to produce `CacheOptions`. |
| `contains(key)` | Check if a key exists. |
| `getKeys()` | Return all stored keys. |
| `delete(key)` | Delete a single item. |
| `bulkDelete(keys)` | Delete multiple items. |
| `clear()` | Delete all items. |
| `deleteExpired(ts?)` | Evict entries whose `expiresAt < ts` (defaults to `Date.now()`). Fires the `"evict"` event if anything was removed. |
| `[Symbol.dispose]()` | Cancel the background cleanup timer and close the database. |

#### Events

`PersistentCache` extends `StructEventTarget`. Subscribe with `addEventListener`.

| Event | Detail type | Description |
|-------|-------------|-------------|
| `"evict"` | `{ records: CacheMetadataRecord[] }` | Fired after `deleteExpired` removes at least one entry. |

#### Usage Examples

```typescript
import { PersistentCache } from '@actdim/utico/cache/persistentCache';

// --- Open a cache ---

const cache = await PersistentCache.open('my-cache');

// --- set / get ---

await cache.set({ key: 'user:42' }, { name: 'Alice' }, {});

const item = await cache.get<{ name: string }>('user:42');
item.metadata.key        // 'user:42'
item.metadata.createdAt  // timestamp set automatically
item.data.value.name     // 'Alice'

// --- Auto-generated key ---

const meta = {};                         // no key provided
await cache.set(meta, { x: 1 }, {});
meta.key;                                // UUID filled in by set()

// --- getOrSet ---

const item2 = await cache.getOrSet(
    { key: 'session:abc' },
    () => ({ token: crypto.randomUUID() }),
    {}
);

// --- Sliding expiration (renewed on every get) ---

await cache.set({ key: 'live' }, 'data', { slidingExpiration: 30_000 });
// expiresAt = now + 30 s; reset to now + 30 s on each get()

// --- Sliding expiration with absolute cap ---

await cache.set({ key: 'bounded' }, 'data', {
    slidingExpiration: 5 * 60_000,          // renew up to 5 min on each get
    absoluteExpiration: Date.now() + 3_600_000, // but never past 1 hour from now
});

// --- Manual eviction ---

await cache.deleteExpired();   // uses Date.now()
await cache.deleteExpired(Date.now() + 60_000); // treat everything expiring in the next minute as expired

// --- Eviction event ---

cache.addEventListener('evict', (e) => {
    console.log('Evicted:', e.detail.records.map(r => r.key));
});

// --- Cleanup ---

cache[Symbol.dispose]();   // stops background timer, closes DB
// or:
using c = await PersistentCache.open('temp');   // auto-disposed at block exit (TS 5.2+)
```

---

## License

Proprietary — © Pavel Borodaev
