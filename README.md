# @actdim/utico

A modern foundation toolkit for complex TypeScript apps.

[![npm version](https://img.shields.io/npm/v/@actdim/utico.svg)](https://www.npmjs.com/package/@actdim/utico)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

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
    - [asyncLock — Async Lock](#asynclock--async-lock)
    - [store — Structured Persistence](#store--structured-persistence)
    - [cache — Persistent Cache](#cache--persistent-cache)
    - [arrayExtensions — Array Prototype Extensions](#arrayextensions--array-prototype-extensions)
    - [memoryCache — In-Memory Cache](#memorycache--in-memory-cache)
    - [utils — General Utilities](#utils--general-utilities)
    - [math — Math Utilities](#math--math-utilities)
    - [i18n — Culture Definitions](#i18n--culture-definitions)
    - [gfx/color — Color Utilities](#gfxcolor--color-utilities)
    - [gfx/canvasUtils — Canvas Utilities](#gfxcanvasutils--canvas-utilities)
    - [dataFormats — Data Format Shortcuts](#dataformats--data-format-shortcuts)
- [License](#license)

---

## Quick Start

Try @actdim/utico instantly in your browser without any installation:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/actdim/utico)

Once the project loads, run the tests to see it in action:

```bash
pnpm run test
```

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
| `KeyPath<T, IncludeFunctions?, MaxDepth?, D?, TLeaf?>` | Dot-notation path strings for all nested properties of `T`. `IncludeFunctions` (default `true`) controls whether function-typed properties are included. `MaxDepth` (default `3`) limits recursion depth. `D` is internal. `TLeaf` (default `KeyPathLeaf`) defines which types are treated as leaves — recursion stops at them. |
| `KeyPathValue<T, P>`         | Value type at a given `KeyPath` `P` in `T`                        |
| `KeyPathValueMap<T, IncludeFunctions?, TLeaf?>` | Partial map of `KeyPath` strings to their values. `IncludeFunctions` and `TLeaf` mirror `KeyPath`. |
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
| `getByKeyPath<T, P, MaxDepth?, TLeaf?>(obj, path)` | Gets the value at a dot-notation `KeyPath` in `obj` at runtime      |
| `setByKeyPath<T, P, MaxDepth?, TLeaf?>(obj, path, value)` | Sets the value at a dot-notation `KeyPath` in `obj` at runtime |

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

// KeyPath — deeply nested dot-notation paths (functions included by default)
type Config = { server: { host: string; port: number }; debug: boolean };
type Paths = KeyPath<Config>;
// => "server" | "debug" | "server.host" | "server.port"

type PathsNoFn = KeyPath<Config, false>;              // exclude function-typed properties
type PathsShallow = KeyPath<Config, true, 2>;         // include functions, max depth 2
type PathsCustomLeaf = KeyPath<Config, true, 3, 0, Date | RegExp>; // treat only Date/RegExp as leaves

type HostType = KeyPathValue<Config, 'server.host'>;
// => string

// Partial deep-update patch object
const patch: KeyPathValueMap<Config> = { 'server.port': 8080 };
const patchNoFn: KeyPathValueMap<Config, false> = { 'server.port': 8080 };

// Runtime get/set by dot-notation path
const cfg: Config = { server: { host: 'localhost', port: 3000 }, debug: false };
getByKeyPath(cfg, 'server.port');              // => 3000
setByKeyPath(cfg, 'server.host', '0.0.0.0'); // mutates cfg.server.host

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

Date/time conversion utilities built on [Luxon](https://moment.github.io/luxon/).  
The module converts values from string/number/`Date`/`DateTime`, tracks precision, and exports values either as local ISO (without suffix) or UTC ISO (`Z` suffix).

#### Core Types

| Type | Description |
|------|-------------|
| `DateTimeNumberFormat` | Numeric input/output format: Unix ms, Unix seconds, OADate |
| `DateTimePrecision` | `auto \| date \| minute \| second \| millisecond` |
| `DateTimeKind` | `local \| utc` |
| `DateTimeStringInterpretation` | `auto \| local \| utc` for parsing strings |
| `DateTimeExportInterpretation` | `original \| local \| utc \| match` for `exportToString` |
| `DateTimeExtended` | Luxon `DateTime` with extra fields: `precision`, `exportToString(...)` |
| `ToDateTimeOptions` | Options for `toDateTime(...)` |
| `DateTimeTransport` | `{ serialize(...), deserialize(...) }` pair for wire transport |

#### `DateTimeNumberFormat`

| Member | Description |
|--------|-------------|
| `UnixTimeMilliseconds` | Default — milliseconds since Unix epoch |
| `UnixTimeSeconds` | Seconds since Unix epoch |
| `OADate` | Microsoft OLE Automation date (fractional days since 1899-12-30) |

#### Functions

| Function | Description |
|----------|-------------|
| `toDateTime(source, options?)` | Converts `string \| number \| Date \| DateTime` to `DateTimeExtended` |
| `getDateTimeFromString(value, format?, precision?, interpretAs?)` | Parses string using explicit format or ISO |
| `getDateTimeFromNumber(value, numberFormat?, interpretAs?, precision?)` | Parses number into `DateTimeExtended` |
| `getDateTimeNumber(dt, numberFormat?)` | Converts `DateTime`/`DateTimeExtended` to number |
| `isDateTimeExtended(obj)` | Type guard for `DateTimeExtended` |

#### Ready-to-use transports

Exported as `dateTimeTransports` object:

| Key | Serialize | Deserialize |
|-----|-----------|-------------|
| `dateTimeTransports.commonLocal` | local ISO without zone suffix | strings as auto, numbers as local Unix seconds |
| `dateTimeTransports.utc` | UTC ISO with `Z` suffix | strings as auto, numbers as UTC Unix seconds |

#### Usage Examples

```typescript
import {
  toDateTime,
  getDateTimeFromString,
  getDateTimeFromNumber,
  getDateTimeNumber,
  dateTimeTransports,
  DateTimeKind,
  DateTimePrecision,
  DateTimeNumberFormat,
  DateTimeStringInterpretation,
  DateTimeExportInterpretation,
} from '@actdim/utico/dateTimeDataFormat';

// Parse from string (ISO auto-detect)
const a = toDateTime("2024-03-15T10:30:45.123");

// Parse from custom string format
const b = toDateTime("03/15/2024", { stringFormat: "MM/dd/yyyy" });

// Parse from number
const c = getDateTimeFromNumber(1710496245000, DateTimeNumberFormat.UnixTimeMilliseconds);

// Parse string and force interpretation as UTC
const d = getDateTimeFromString(
  "2024-03-15T10:30:45.123",
  undefined,
  DateTimePrecision.Auto,
  DateTimeStringInterpretation.Utc
);

// Export as ISO local (without zone suffix)
a.exportToString(DateTimeKind.Local); // "2024-03-15T..."

// Export as ISO UTC (with Z)
a.exportToString(DateTimeKind.Utc);   // "2024-03-15T...Z"

// Export with explicit interpretation
a.exportToString(
  DateTimeKind.Local,
  DateTimeExportInterpretation.Local
);

// Precision truncation
const minute = getDateTimeFromString(
  "2024-03-15T10:30:45.123",
  "yyyy-MM-dd'T'HH:mm:ss.SSS",
  DateTimePrecision.Minute
);
minute.second;      // 0
minute.millisecond; // 0

// Number conversion back
getDateTimeNumber(a, DateTimeNumberFormat.UnixTimeSeconds);

// Transport helpers
dateTimeTransports.commonLocal.serialize(a); // local string
dateTimeTransports.utc.serialize(a);         // UTC string with Z
dateTimeTransports.utc.serialize(null);      // null
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

### asyncLock — Async Lock

**Import:** `@actdim/utico/asyncLock`

A lightweight async lock that serializes concurrent async operations. Prevents race conditions when accessing shared resources.

#### Class: `AsyncLock`

| Method     | Signature                                             | Description                                                         |
| ---------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| `lock`     | `(timeoutMs?: number) => Promise<() => void>`         | Acquires the lock; returns an `unlock` function. Throws on timeout. |
| `tryLock`  | `() => (() => void) \| null`                          | Non-blocking acquire; returns `unlock` or `null` if already locked. |
| `dispatch` | `(fn: Executor<T>, timeoutMs?: number) => Promise<T>` | Acquires lock, runs `fn`, releases lock — the recommended pattern.  |

#### Usage Examples

```typescript
import { AsyncLock } from '@actdim/utico/asyncLock';

const lock = new AsyncLock();

// --- dispatch: the simplest pattern ---

async function updateCounter() {
    return lock.dispatch(async () => {
        const current = await db.get('counter');
        await db.set('counter', current + 1);
        return current + 1;
    });
}

// Safe to call concurrently — operations are serialized
await Promise.all([updateCounter(), updateCounter(), updateCounter()]);

// --- lock / unlock: manual control ---

async function criticalSection() {
    const unlock = await lock.lock();
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
        unlock = await lock.lock(5000); // wait at most 5 seconds
        await doSlowWork();
    } catch (e) {
        if ((e as Error).message === 'Lock timeout') {
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
    const unlock = lock.tryLock();
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

Built on [Dexie](https://dexie.org/) (IndexedDB). Uses `AsyncLock` internally to protect concurrent database access. Transactions are managed automatically — no manual transaction handling needed.

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

#### Transaction Modes

`TransactionMode` (re-exported from Dexie) controls how a Dexie transaction is opened or joined.
Most `IPersistentStore` methods accept an optional `transactionMode` parameter with a sensible default — callers rarely need to override it.

| Mode | Meaning |
|------|---------|
| `"r"` | Readonly — always opens a new readonly transaction |
| `"rw"` | Read-write — always opens a new read-write transaction |
| `"r?"` | Readonly, reuse — joins an existing transaction if one is open; otherwise opens a new readonly one |
| `"rw?"` | Read-write, reuse — joins an existing transaction if one is open; otherwise opens a new read-write one |
| `"r!"` | Readonly, required — must already be inside an enclosing transaction (throws otherwise) |
| `"rw!"` | Read-write, required — must already be inside an enclosing transaction (throws otherwise) |

Defaults used by `PersistentStore` internally:
- Reads (`get`, `bulkGet`, `contains`, `toArray`): `"r"` or `"r?"`
- Writes (`set`, `update`, `delete`, `clear`): `"rw"`
- General `exec` wrapper: `"r!"` (runs inside caller-provided transaction)

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

### arrayExtensions — Array Prototype Extensions

**Import:** `@actdim/utico/arrayExtensions`

> **Side-effect import** — augments `Array.prototype` globally. Import once at the application entry point.

Extends the native `Array<T>` with LINQ-style collection utilities.

#### Methods

| Method | Description |
|--------|-------------|
| `unfold<TItem>(callback)` | Flat-maps each element to an array and concatenates results (`selectMany`) |
| `max<TItem>(selector, defaultValue?)` | Returns the maximum projected value; `defaultValue` when the array is empty |
| `min<TItem>(selector, defaultValue?)` | Returns the minimum projected value; `defaultValue` when the array is empty |
| `orderBy<TItem>(selector)` | Returns a new array sorted ascending by the projected key |
| `orderByDesc<TItem>(selector)` | Returns a new array sorted descending by the projected key |
| `groupBy(selector)` | Groups elements into `{ [key: string]: T[] }` by the projected string key |
| `distinct()` | Returns unique elements (reference/value equality) via `Set` |
| `distinct<TItem>(selector)` | Returns elements with unique projected keys |
| `copy(src, srcIndex?, dstIndex?, length?)` | Copies elements from `src` into this array |
| `copyTo(dst, srcIndex?, dstIndex?, length?)` | Copies elements from this array into `dst` |

#### Usage Examples

```typescript
import '@actdim/utico/arrayExtensions';

// unfold — flat-map
[[1, 2], [3, 4]].unfold(x => x);           // [1, 2, 3, 4]

// max / min
[{ v: 3 }, { v: 1 }, { v: 2 }].max(x => x.v);  // 3
[{ v: 3 }, { v: 1 }, { v: 2 }].min(x => x.v);  // 1
[].min(x => x, 0);                               // 0 (defaultValue)

// orderBy / orderByDesc
[3, 1, 2].orderBy(x => x);       // [1, 2, 3]
[3, 1, 2].orderByDesc(x => x);   // [3, 2, 1]

// groupBy
['apple', 'avocado', 'banana'].groupBy(s => s[0]);
// { a: ['apple', 'avocado'], b: ['banana'] }

// distinct
[1, 2, 2, 3].distinct();                              // [1, 2, 3]
[{ id: 1 }, { id: 2 }, { id: 1 }].distinct(x => x.id); // [{ id: 1 }, { id: 2 }]
```

---

### memoryCache — In-Memory Cache

**Import:** `@actdim/utico/cache/memoryCache`

A simple generic in-memory key-value cache backed by `Map`.

#### Class: `MemoryCache<TKey, TValue>`

| Member | Description |
|--------|-------------|
| `get(key)` | Returns the stored value, or `undefined` |
| `set(key, valueOrFactory)` | Stores a value or calls a factory to produce it |
| `getOrSet(key, valueOrFactory)` | Returns existing value or creates and stores it |
| `contains(key)` | Returns `true` if the key exists |
| `remove(key)` | Removes an entry |
| `clear()` | Removes all entries |
| `keys` / `getKeys()` | Iterable of all keys |
| `values` / `getValues()` | Iterable of all values |
| `entries` / `getEntries()` | Iterable of `[key, value]` pairs |
| `size` | Number of stored entries |

```typescript
import { MemoryCache } from '@actdim/utico/cache/memoryCache';

const cache = new MemoryCache<string, number>();
cache.set('a', 1);
cache.getOrSet('b', () => 2);
cache.get('a');       // 1
cache.contains('b');  // true
cache.size;           // 2
```

---

### utils — General Utilities

**Import:** `@actdim/utico/utils`

| Function | Description |
|----------|-------------|
| `delay(ms, abortSignal?)` | Returns a `Promise` that resolves after `ms` milliseconds; rejects early if `abortSignal` is aborted |
| `delayError(ms, errFactory?, abortSignal?)` | Returns a `Promise` that rejects after `ms` milliseconds; rejects early if `abortSignal` is aborted |
| `withTimeout(promise, ms, abortSignal?)` | Races `promise` against a timeout rejection; rejects early if `abortSignal` is aborted |
| `lazy(factory)` | Wraps a factory in a once-evaluated lazy initializer |
| `memoEffect(getValue, callback, comparator?)` | Calls `callback` only when the value from `getValue` changes |
| `searchTree(nodes, predicate, childSelector)` | Depth-first search over a tree structure |
| `buildFuncArgCacheKey(...args)` | Produces a stable string cache key from any argument list |
| `normalize(v)` | Returns `0` for `NaN`, `Infinity`, or falsy numbers; otherwise `v` |
| `removePrefix(str, prefixes)` | Strips any leading prefixes from `str` (repeats until stable) |
| `removeSuffix(str, suffixes)` | Strips any trailing suffixes from `str` (repeats until stable) |
| `makeNonEnumerable(obj, propertyNames)` | Makes the given properties non-enumerable on `obj` |
| `suppressConsole(action)` | Runs `action` while capturing `console.log` calls; returns the captured log entries |

```typescript
import { delay, withTimeout, lazy, memoEffect, searchTree } from '@actdim/utico/utils';

await delay(500);

const ac = new AbortController();
await delay(500, ac.signal); // rejects if ac.abort() is called

const result = await withTimeout(fetch('/api'), 3000);

const getInstance = lazy(() => new ExpensiveClass());
getInstance(); // created once

const recompute = memoEffect(
    () => items.length,
    (len) => computeSomething(len)
);
recompute(); // runs callback only when items.length changes

const node = searchTree(tree, n => n.id === 42, n => n.children);
```

---

### math — Math Utilities

**Import:** `@actdim/utico/math`

| Function | Description |
|----------|-------------|
| `round(number, digits?)` | Rounds to `digits` decimal places (default `0`). Uses `Number.EPSILON` correction to avoid floating-point drift (e.g. `1.005 → 1.01`). |

```typescript
import { round } from '@actdim/utico/math';

round(1.005, 2)  // 1.01
round(1.555, 2)  // 1.56
round(123.456)   // 123
```

---

### i18n — Culture Definitions

**Import:** `@actdim/utico/i18n/cultures` (index) or individual culture files.

Provides Luxon-compatible date/time format strings for different locales.
All format tokens follow Luxon conventions (`yyyy`, `MM`, `dd`, `HH`, `hh`, `a`, etc.).

| Import | Culture |
|--------|---------|
| `@actdim/utico/i18n/cultures` | `{ "en-US": ..., "eu": ..., "invariant": ... }` |
| `@actdim/utico/i18n/enUsCulture` | US English — `MM/dd/yyyy`, 12-hour clock |
| `@actdim/utico/i18n/euCulture` | European — `dd.MM.yyyy`, 24-hour clock |
| `@actdim/utico/i18n/invariantCulture` | Locale-neutral ISO-style formats |

Each culture exports a `dateTime.formats` object with keys:
`dateTime`, `dateTime24`, `dateTimeShort`, `date`, `dateShort`, `time`, `time24`, `timeHM`, `timeH24M`, etc.

```typescript
import enUs from '@actdim/utico/i18n/enUsCulture';
import cultures from '@actdim/utico/i18n/cultures';

enUs.dateTime.formats.date         // "MM/dd/yyyy"
enUs.dateTime.formats.timeH24M     // "HH:mm"

cultures['eu'].dateTime.formats.date  // "dd.MM.yyyy"
```

---

### gfx/color — Color Utilities

**Import:** `@actdim/utico/gfx/color`

Converts between hex strings, RGBA components, and packed 24/32-bit integers.

| Function | Description |
|----------|-------------|
| `getColorNumberFromRgba(r, g, b, a?, mode?)` | Packs RGBA into a 32-bit unsigned int. `mode`: `'24bit'`, `'32bit'`, or `'auto'` (default — 24-bit when `a` is omitted) |
| `getColorRgbaFromHexString(hex)` | Parses a hex string (`#RGB`, `#RRGGBB`, `#RRGGBBAA`) into `{ r, g, b, a }` |
| `getColorNumberFromHexString(hex)` | Parses a hex string into a number |
| `get24bitColorHexStringFromNumber(color)` | Formats a number as `#rrggbb` |
| `get32BitColorHexStringFromNumber(color)` | Formats a number as `#rrggbbaa` |
| `getColorHexStringFromRgba(r, g, b, a?)` | Converts RGBA components to a hex string |
| `getRandom24BitColorNumber(brightness?)` | Generates a random 24-bit color |
| `getRandom32BitColorNumber(alpha?, brightness?)` | Generates a random 32-bit color |
| `getRandomColorChannelString(brightness)` | Random single channel as a 2-char hex string |
| `ColorDepthMode` | Const enum: `'24bit' \| '32bit' \| 'auto'` |

```typescript
import { getColorNumberFromRgba, get24bitColorHexStringFromNumber, getColorRgbaFromHexString } from '@actdim/utico/gfx/color';

const n = getColorNumberFromRgba(255, 128, 0);   // 0xFF8000
get24bitColorHexStringFromNumber(n);              // "#ff8000"
getColorRgbaFromHexString('#ff8000');             // { r: 255, g: 128, b: 0, a: 255 }
```

---

### gfx/canvasUtils — Canvas Utilities

**Import:** `@actdim/utico/gfx/canvasUtils`

> **Browser-only** — uses `document`, `window`, `Canvas`, `SVG`, and `FileReader` APIs.

| Function / Value | Description |
|------------------|-------------|
| `createCanvas(w, h)` | Creates an offscreen `<canvas>` with a 2D context and high-quality image smoothing |
| `fitText(ctx, text, sizeProvider, targetWidth?, fontFamily?)` | Finds the largest font size that fits `text` within `targetWidth`, then draws it |
| `html2Svg(elements, viewBoxSize, css)` | Serialises HTML elements into an SVG string via `<foreignObject>` |
| `getSvgImageObjectUrl(svgData)` | Creates a Blob object URL from an SVG string |
| `getSvgImageDataUrl(svgData)` | Creates a `data:image/svg+xml;base64,...` URL from an SVG string |
| `querySvgData(selector)` | Serialises the first matching SVG element to a string |
| `toObjectUrl(canvas, mimeType?, quality?)` | Converts a canvas to a Blob object URL |
| `drawImage(src, context)` | Draws an image URL onto a canvas context |
| `drawSvg(svgData, context, useDataUrl?)` | Draws an SVG string onto a canvas context |
| `canvasToImage(canvas, size?, mimeType?, quality?)` | Converts a canvas to an `HTMLImageElement` |
| `objectUrlToDataURL(objectUrl)` | Converts a Blob object URL to a `data:` URL |
| `getSvgSize(svg)` | Returns `[width, height]` from an SVG string |
| `getSvgElementSize(svgDoc)` | Returns `[width, height]` from an `SVGSVGElement` |
| `refineSvg(data)` | Normalises SVG dimensions (workaround for Firefox bug) |
| `drawRoundedRect(ctx, x, y, w, h, r)` | Draws a rounded rectangle path; `r` is a number or `{tl, tr, br, bl}` |

---

### dataFormats — Data Format Shortcuts

**Import:** `@actdim/utico/dataFormats`

A convenience re-export that groups format helpers under a single object.

```typescript
import dataFormats from '@actdim/utico/dataFormats';

// Equivalent to importing dateTimeTransports directly:
dataFormats.dateTime.transports.commonLocal.serialize(dt);
dataFormats.dateTime.transports.utc.serialize(dt);
```

See [dateTimeDataFormat](#datetimedataformat--datetime-serialisation) for full transport documentation.

---

## Changelog

### 1.2.5
- `typeCore`: core type additions and refinements

### 1.2.4
- `typeCore`: `KeyPath` fixes and improvements
- Added `tests/typeCore.test.ts`

### 1.2.3
- `typeCore`: `KeyPath` further improved
- `typeUtils`: `isPlainObject` fix

### 1.2.2
- `arrayExtensions`: fixes; `src/array.ts` merged in and removed
- Minor cleanup across `memoryCache`, `dataStore`, `storeContracts`, `stringCore`, `typeUtils`

### 1.2.0
- `typeCore`: new utility types

### 1.1.8
- `AsyncMutex` renamed to `AsyncLock` (`src/asyncLock.ts`); old module removed

### 1.1.6
- `dateTimeDataFormat`: overhaul with new parsing/serialization logic
- `i18n`: added `euCulture` and `invariantCulture`

### 1.1.5
- `dateTimeDataFormat`: migrated from `moment` to `Luxon`
- Added `tests/dateTimeDataFormat.test.ts`, `tests/watchable.test.ts`

### 1.1.3
- `decorators`: new `@nonEnumerable` decorator (`src/decorators.ts`)
- Store fixes (`dataStore`, `persistentStore`, `storeDb`)
- Added tests: `asyncMutex`, `metadata`, `persistentCache`, `stringCore`, `structEvent`, `typeUtils`

### 1.1.2
- Breaking API changes across `cache` and `store` modules

### 1.1.0 – 1.1.1
- `typeCore`, `utils`: internal refactoring

### 1.0.6
- `utils`: added `removePrefix`, `removeSuffix`

### 1.0.5
- `utils`: added `lazy`

### 1.0.4
- `utils`: `delayError` updated

### 1.0.0
- Stable release; switched to `pnpm` and `Vitest`
- `cacheContracts` introduced as a separate module

### 0.9.7
- New store layer: `dataStore`, `persistentStore`, `storeContracts`, `storeDb`
- Migrated test runner from Jest to Vitest

### 0.9.1
- `utils`: added `memoEffect`; first `utils` tests

### 0.9.0
- Initial public release: `persistentCache`, `memoryCache`, `typeCore`, `typeUtils`, `stringCore`, `metadata`, `structEvent`, `watchable`, `asyncMutex`, `dateTimeDataFormat`

---

## License

Proprietary — © Pavel Borodaev
