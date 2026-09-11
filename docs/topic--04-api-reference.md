---
protocol: along
slug: topic--04-api-reference
title: 04 API Reference
type: topic
created: 2026-08-27
updated: 2026-09-11
tags: [04-api-reference, api, modules]
---

# 04. API Reference

Complete module reference for `@actdim/utico`. All modules are fully tree-shakeable and exported via subpath imports.

---

## Module Directory

| Subpath Import | Purpose | Peer Dependencies |
|---|---|---|
| `@actdim/utico/typeCore` | Static type composition, dot-notation `KeyPath`, object transformations | *None (Pure TS)* |
| `@actdim/utico/typeUtils` | Runtime reflection, proxies, constructor binding, stable JSON | *None* |
| `@actdim/utico/stringCore` | Case-insensitive & locale-aware string comparisons (`Intl.Collator`) | `Intl.Collator` |
| `@actdim/utico/metadata` | Prototype-aware property metadata using `WeakMap` | *None* |
| `@actdim/utico/decorators` | Property decorators (e.g. `@nonEnumerable`) | *None* |
| `@actdim/utico/dateTimeDataFormat` | Luxon-based date/time serialization, parsing, and wire transports | `luxon >= 3.7.2` |
| `@actdim/utico/structEvent` | Strictly typed DOM `EventTarget` and `CustomEvent` structs | *DOM / Node EventTarget* |
| `@actdim/utico/watchable` | Observable promise and function execution tracking (`pending`, `fulfilled`) | *None* |
| `@actdim/utico/asyncLock` | Mutex concurrency lock with FIFO queuing and timeout control | *None* |
| `@actdim/utico/store/*` | IndexedDB structured persistence on top of Dexie | `dexie >= 4.2.0` |
| `@actdim/utico/cache/*` | TTL and sliding expiration cache with background eviction | `dexie >= 4.2.0`, `uuid >= 13.0.0` |
| `@actdim/utico/memoryCache` | In-memory Map cache with lazy factory and sliding TTL | *None* |
| `@actdim/utico/arrayExtensions` | Global `Array.prototype` LINQ extensions (`orderBy`, `groupBy`, `distinct`) | *None* |
| `@actdim/utico/gfx/color` | RGBA, Hex, 24-bit, 32-bit color conversions and packing | *None* |
| `@actdim/utico/gfx/canvasUtils` | Browser Canvas rendering, SVG rasterization, rounded rects | *Browser DOM APIs* |
| `@actdim/utico/math` | High-precision rounding with `Number.EPSILON` drift correction | *None* |

---

## 1. Type Engine (`@actdim/utico/typeCore`)

Advanced TypeScript type-level metaprogramming utilities:

- **`Skip<T, K>`**: Clean version of `Omit` removing keys `K` from `T`.
- **`Filter<T, V>`**: Keeps only properties whose values extend `V`.
- **`Diff<T, U>`**: Properties in `T` that do not exist in `U`.
- **`CommonPart<T, U>`**: Mathematical intersection of shared properties.
- **`KeyPath<T, IncludeFunctions?, MaxDepth?, D?, TLeaf?>`**: Deep dot-notation path strings for nested properties of `T`.
- **`KeyPathValue<T, P>`**: Value type at dot-notation path `P` in `T`.
- **`KeyPathValueMap<T>`**: Partial map of `KeyPath` strings to their target values.
- **`OneOfType<T>`**: Strict discriminated union enforcing that exactly one property is set.
- **`MaybePromise<T>`**: Union of `T | PromiseLike<T>`.

---

## 2. Runtime Type Utilities (`@actdim/utico/typeUtils`)

- **`typed(ctor)`**: Binds generic type arguments via Instantiation Expressions (TS 4.7+) with zero runtime cost.
- **`createConstructor(ctor)`**: Binds type arguments and makes the constructor callable without `new`.
- **`keysOf(obj)`**: Typed `Object.keys` returning `(keyof T)[]`.
- **`satisfies<TShape>()(obj)`**: Curried type constraint helper without type widening.
- **`proxify(source)`**: Lazy proxy evaluating `source()` on every property access.
- **`toReadOnly(obj)`**: Deep read-only proxy.
- **`orderedStringify(obj)`**: Deterministic JSON serialization with recursively sorted keys.

---

## 3. Concurrency & Synchronization (`@actdim/utico/asyncLock`)

- **`AsyncLock`**: Concurrency coordinator providing FIFO execution queues:
  ```typescript
  import { AsyncLock } from '@actdim/utico/asyncLock';

  const lock = new AsyncLock();
  await lock.dispatch('resource-id', async () => {
    // Critical section executed sequentially
  });
  ```

---

## 4. Persistent Storage & Cache (`@actdim/utico/store`, `@actdim/utico/cache`)

- **`PersistentStore<T>`**: Declarative IndexedDB abstraction built on Dexie.
- **`PersistentCache`**: Two-tier cache supporting:
  - Sliding expiration (renewed on `get()`).
  - Absolute expiration ceiling.
  - Background worker for automatic expired record eviction.
  - Explicit resource cleanup via `Symbol.dispose` (`using` statement).

---

## 5. Cross-Links

- [Knowledge Base Index](./INDEX.md) - Knowledge Base Root
- [01 System Architecture](./topic--architecture.md) - System Architecture
- [02 Domain Model](./topic--domain-model.md) - Domain Model
- [03 Setup & Workflow](./topic--setup-and-workflow.md) - Build, Tests & Dev Workflow
- [05 Patterns & Recipes](./topic--05-patterns-and-recipes.md) - Integration Recipes
- [License](./topic--license.md) - License Information
