---
protocol: along
slug: 02-domain-model
title: 02 Domain Model
type: topic
created: 2026-08-27
updated: 2026-08-27
tags: []
---

# @actdim/utico Domain Model & Type Hierarchy

## 1. Domain Model Overview

The domain model of `@actdim/utico` centers around contract-driven type manipulation, event structures, asynchronous state wrappers, persistent metadata-tagged records, and cache strategies.

## 2. Core Entities and Type Definitions

### 2.1. Structural Typing Entities (`typeCore`)
- **`KeyPath<T, IncludeFunctions, MaxDepth, D, TLeaf>`**: Recursively computes valid dot-notation string keys down to depth `MaxDepth` (default 3), stopping recursion at leaf types `TLeaf` (e.g. `Date`, `RegExp`, `Function`).
- **`KeyPathValue<T, P>`**: Resolves the exact type at dot-notation path `P` in `T`.
- **`KeyPathValueMap<T>`**: Strongly-typed partial patch mapping valid `KeyPath` strings to their respective value types.
- **`Skip<T, K>`** / **`Filter<T, V>`** / **`Diff<T, U>`** / **`StrictDiff<T, U>`** / **`CommonPart<T, U>`**: Mathematical type algebra for object property filtering, subtraction, and intersection.
- **`OneOfType<T>`**: Discriminator helper ensuring exactly one key from `T` is non-null/non-undefined.
- **`MaybePromise<T>`** (`T | PromiseLike<T>`): Unified return type for synchronous or asynchronous operations.
- **`Executor<T>`** (`() => MaybePromise<T>`): Thunk function returning value or promise.

### 2.2. Typed DOM Event Contracts (`structEvent`)
- **`EventStruct`**: Object type mapping event names (`string`) to event payload/detail shapes (`Record<string, unknown>`).
  ```typescript
  type CacheEvents = {
      evict: { records: CacheMetadataRecord[] };
      hit: { key: string };
  };
  ```
- **`StructEvent<TStruct, TTarget, TType>`**: Extends DOM `CustomEvent`. Carries typed `.detail: TStruct[TType]` and `.target: TTarget`.
- **`StructEventTarget<TStruct>`**: Subclass of standard `EventTarget` overriding `addEventListener`, `removeEventListener`, `dispatchEvent`, and `hasEventListener` with strict struct-keyed overloads.

### 2.3. Asynchronous Concurrency Contracts (`asyncLock`, `watchable`)
- **`AsyncLock`**: Concurrency coordinator providing FIFO locking with optional timeout.
- **`PromiseStatus`**: `"pending" | "fulfilled" | "rejected"`.
- **`WatchablePromise<T>`**: Wraps `PromiseLike<T>` exposing `.status: PromiseStatus`, `.settled: boolean`, and `.result: T | undefined`.
- **`WatchableFunc<TArgs, T>`**: Wraps callable function with `.executing: boolean` flag.

### 2.4. Persistence & IndexedDB Domain (`store`)
- **`MetadataRecord`**: Base interface for all stored entries:
  ```typescript
  interface MetadataRecord {
      key: string;
      createdAt: number;
      updatedAt: number;
      tags?: string[];
  }
  ```
- **`DataRecord<TValue>`**: Payload container `{ key: string; value: TValue }`.
- **`StoreItem<TMetadata, TValue>`**: Aggregate `{ metadata?: TMetadata; data?: DataRecord<TValue> }`.
- **`ChangeSet<TMetadata>`**: Batch update atom `{ key: string; changes: KeyPathValueMap<TMetadata> }`.
- **`FieldDef<T>`**: Index declaration format:
  - `"field"`: Normal index
  - `"&field"`: Unique constraint index
  - `"*field"`: Multi-entry array index (e.g. `*tags`)
  - `"++field"`: Auto-increment index
- **`FieldDefTemplate<T>`**: `FieldDef<T>[]` defining database table schema.
- **`TransactionMode`**: Dexie transaction scope specifier (`"r"` | `"rw"` | `"r?"` | `"rw?"` | `"r!"` | `"rw!"`).

### 2.5. Caching Domain (`cache`)
- **`CacheMetadataRecord`**: Extends `MetadataRecord`:
  ```typescript
  interface CacheMetadataRecord extends MetadataRecord {
      accessedAt?: number;
      slidingExpiration?: number; // ms
      absoluteExpiration?: number; // timestamp ms
      expiresAt: number; // timestamp ms
  }
  ```
- **`CacheOptions`**:
  - `slidingExpiration?: number` (ms duration)
  - `absoluteExpiration?: Date | number` (absolute timestamp limit)
  - `ttl?: number | { seconds?: number; minutes?: number; hours?: number }` (relative TTL)
- **`PersistentCacheOptions`**: `{ cleanupTimeout?: number }` (ms interval for background eviction job).

### 2.6. Temporal & I18N Domain (`dateTimeDataFormat`, `i18n`)
- **`DateTimeExtended`**: Subclasses Luxon `DateTime` with `.precision: DateTimePrecision` and `.exportToString(kind, interpretation)`.
- **`DateTimePrecision`**: `auto` | `date` | `minute` | `second` | `millisecond`.
- **`DateTimeKind`**: `local` | `utc`.
- **`DateTimeTransport`**: Serializable wire format adapter:
  ```typescript
  interface DateTimeTransport {
      serialize: (dt: DateTimeExtended | null | undefined) => string | null;
      deserialize: (val: string | number | null | undefined) => DateTimeExtended | null;
  }
  ```

## 3. Cross-Links
- [[INDEX.md]] - Knowledge Base Root
- [[01-architecture.md]] - System Architecture
- [[03-setup-and-workflow.md]] - Setup and Workflow
- [[04-api-reference.md]] - API Reference
- [[05-patterns-and-recipes.md]] - Practical Recipes
