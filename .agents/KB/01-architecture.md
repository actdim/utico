# @actdim/utico Architecture

## 1. System Overview

`@actdim/utico` is the foundational TypeScript utility toolkit of the Actdim architecture. It provides high-performance, strictly typed primitives for data transformation, async synchronization, persistent browser storage (Dexie / IndexedDB), multi-tier caching, reactive function/promise tracking, and browser canvas/color manipulation.

```
+---------------------------------------------------------------------------------------+
|                                    @actdim/utico                                      |
+---------------------------------------------------------------------------------------+
|  Type Engine & Metaprogramming                                                        |
|  - typeCore: KeyPath, Skip, Filter, CommonPart, Diff, Overwrite, MaybePromise        |
|  - typeUtils: typed(), createConstructor(), satisfies(), proxify(), createDeepProxy()  |
|  - metadata & decorators: @metadata, WeakMap inheritance, @nonEnumerable             |
+---------------------------------------------------------------------------------------+
|  Async Synchronization & Reactivity                                                  |
|  - asyncLock: AsyncLock (lock, tryLock, dispatch with timeout & queue management)     |
|  - watchable: watch(), toWatchable(), WatchablePromise, WatchableFunc (settled/status)|
|  - structEvent: StructEvent<TStruct, TTarget>, StructEventTarget (strictly typed DOM) |
+---------------------------------------------------------------------------------------+
|  Storage & Caching Pipeline                                                           |
|  - store: PersistentStore<T>, storeDb (Dexie IndexedDB), FieldDefTemplate indexes     |
|  - cache: PersistentCache (TTL, sliding/absolute expiration, auto eviction job)       |
|  - memoryCache: MemoryCache<TKey, TValue> (in-memory Map cache with lazy factory)    |
+---------------------------------------------------------------------------------------+
|  Formatting, Culture & Mathematical Primitives                                       |
|  - dateTimeDataFormat: Luxon-based DateTimeExtended, DateTimeTransport, ISO local/UTC |
|  - i18n / cultures: enUsCulture, euCulture, invariantCulture date/time format tokens  |
|  - stringCore: Intl.Collator locale-aware comparisons (ciCompare, ciStartsWith)       |
|  - math: round() with Number.EPSILON drift correction                                |
|  - gfx/color & gfx/canvasUtils: 24/32-bit color packing, HTML5 Canvas/SVG rendering  |
|  - arrayExtensions: LINQ-style Array.prototype extensions (orderBy, groupBy, distinct)|
+---------------------------------------------------------------------------------------+
```

## 2. Module Topology & Boundaries

Every module is tree-shakeable and exported via subpath imports (`@actdim/utico/<module>`):

| Module Subpath | Core Responsibility | External Peer Dependencies |
|---|---|---|
| `@actdim/utico/typeCore` | Static type composition, dot-notation `KeyPath`, object key transformers | *None (Pure TS)* |
| `@actdim/utico/typeUtils` | Runtime reflection, proxies, constructor binding, stable JSON | *None* |
| `@actdim/utico/metadata` | Prototype-aware property metadata using `WeakMap` | *None* |
| `@actdim/utico/decorators` | Property decorators (e.g. `@nonEnumerable`) | *None* |
| `@actdim/utico/asyncLock` | Mutex & asynchronous concurrency control | *None* |
| `@actdim/utico/watchable` | Reactive promise and function execution tracking | *None* |
| `@actdim/utico/structEvent` | Type-safe `EventTarget` & `CustomEvent` structs | *DOM EventTarget / Node polyfill* |
| `@actdim/utico/store/*` | IndexedDB structured persistence on top of Dexie | `dexie >= 4.2.0` |
| `@actdim/utico/cache/*` | TTL/Sliding expiration cache with background eviction | `dexie >= 4.2.0`, `uuid >= 13.0.0` |
| `@actdim/utico/dateTimeDataFormat` | Date/time serialization, parsing, precision control | `luxon >= 3.7.2` |
| `@actdim/utico/stringCore` | Case-insensitive and locale-aware string matching | `Intl.Collator` |
| `@actdim/utico/arrayExtensions` | Global `Array.prototype` LINQ extensions | *None* (Side-effect import) |
| `@actdim/utico/gfx/color` | RGBA / Hex / 24-bit / 32-bit color converters | *None* |
| `@actdim/utico/gfx/canvasUtils` | Browser Canvas drawing, SVG rasterization, rounded rects | *Browser DOM APIs* |

## 3. Core Architectural Patterns

### 3.1. Dot-Notation Deep Typing (`KeyPath` & `KeyPathValueMap`)
The type engine generates recursive dot-notation paths (`"server.host"` | `"server.port"`) up to configurable depth limits with strict leaf type protection. This powers partial patch updates (`store.bulkUpdate`) without breaking compile-time type safety.

### 3.2. Generic Constructor Binding (`typed` & `createConstructor`)
To avoid repetitive generic instantiation for classes like `StructEvent<TStruct, TTarget>`, `typed()` uses TS 4.7+ Instantiation Expressions with zero runtime overhead, while `createConstructor()` wraps the constructor to allow calling without `new`.

### 3.3. Zero-Transaction Storage Abstraction
`PersistentStore` wraps Dexie operations in optimal transaction scopes (`r`, `rw`, `r?`, `rw?`, `r!`, `rw!`), automatically handling concurrency via `AsyncLock`. Schema definitions use declarative `FieldDefTemplate<T>` strings (`"&key"`, `"createdAt"`, `"*tags"`), ensuring queries (`where('tag').equals(...)`) only compile for valid indexed properties.

### 3.4. Multi-Strategy Expiration Engine
`PersistentCache` extends `PersistentStore` with:
- **Sliding Expiration**: Renews deadline on every access (`get()`).
- **Absolute Expiration**: Fixed ceiling timestamp that sliding expiration cannot surpass.
- **Background Worker**: Periodic timer executing `deleteExpired()`, emitting typed `evict` events.
- **Explicit Resource Management**: Implements `[Symbol.dispose]()` for automatic cleanup via TypeScript 5.2+ `using`.

## 4. Cross-Links
- [[INDEX.md]] — Knowledge Base Root
- [[02-domain-model.md]] — Domain Contracts and Entities
- [[03-setup-and-workflow.md]] — Build and Test Instructions
- [[04-api-reference.md]] — Exhaustive API Reference
- [[05-patterns-and-recipes.md]] — Practical Recipes and Integration Patterns
