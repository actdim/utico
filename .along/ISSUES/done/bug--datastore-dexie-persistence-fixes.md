---
protocol: along
protocol_version: "4.4.16"
slug: datastore-dexie-persistence-fixes
type: bug
status: done
completed: 2026-10-16
priority: high
created: 2026-10-16
updated: 2026-10-16
agent: antigravity
tags: [store, dexie, datastore, indexeddb]
parent: feat--reader-state-sync-dexie-postgres
blocked_by: []
related: []
---

# Fix edge cases, bulk operations and collection queries in DataStore

## Objective
Remediate identified bugs, edge cases, and API inconsistencies in `@actdim/utico/src/store/dataStore.ts` and `storeDb.ts` to ensure reliable IndexedDB persistence for offline-first reader progress, annotations, and generic key-value storage.

---

## Detailed Bug Inventory

### 1. `StoreCollection.toArray` ignores `orderBy` when `orderDirection` is omitted
- **Location**: `src/packages/utico/src/store/dataStore.ts#L47-L50`
- **Issue**: The check `if (orderBy && orderDirection)` requires both parameters to be truthy. If a caller invokes `collection.toArray("createdAt")` without passing the second argument, `orderDirection` is `undefined`. As a result, the condition evaluates to `false`, and execution falls back to `this._metadata.each`, silently ignoring `orderBy`.
- **Expected**: Default `orderDirection` to `"asc"` when `orderBy` is provided:
  ```typescript
  const direction = orderDirection ?? "asc";
  if (orderBy) {
      const metadataRecords = await this._metadata.sortBy(orderBy as string);
      populate = metadataRecords.forEach.bind(metadataRecords);
  }
  ```

### 2. `StoreCollection.modify` drops data updates when `metadataCallback` is omitted
- **Location**: `src/packages/utico/src/store/dataStore.ts#L143-L161`
- **Issue**: In `StoreCollection.modify(metadataCallback, dataCallback, transactionMode)`, `keys` is an array populated only inside `if (metadataCallback) { ... keys.push(r.key); ... }`. If a caller calls `modify(undefined, (data) => ...)` to update only payload records:
  - `keys` remains empty `[]`.
  - `this.db.data.where(...).anyOf([])` matches zero records and modifies nothing.
  - The return value `mc` is `undefined`.
- **Expected**: If `metadataCallback` is not provided, populate `keys` via `await this.getKeys()`. Return a predictable count (total affected or `{ metadata: mc ?? 0, data: dc ?? 0 }`).

### 3. `DataStore.bulkSet` crashes on null `metadataRecords` and mismatches generated keys
- **Location**: `src/packages/utico/src/store/dataStore.ts#L348-L376`
- **Issue**:
  1. Line 356 allows `metadataRecords` to be falsy (`if (!metadataRecords && !dataRecords) throw ...;`). However, line 359 executes `for (const metadataRecord of metadataRecords)` without an existence check, throwing `TypeError: metadataRecords is not iterable` at runtime when only `dataRecords` are provided.
  2. Line 361 generates a new key `metadataRecord.key = uuid()` if missing, but does not synchronize this key to the corresponding entry in `dataRecords[index]`, which was already validated for `!x.key` at line 353.
  3. Returns `mKeys`, which is `undefined` if only `dataRecords` were set.
- **Expected**: Guard iteration with `if (metadataRecords)`. When setting paired arrays where keys are missing, generate UUID and assign to both `metadataRecords[i].key` and `dataRecords[i].key`. Return the array of keys actually written (`mKeys ?? dKeys`).

### 4. `DataStore.bulkUpdate` parameter typo and undefined return
- **Location**: `src/packages/utico/src/store/dataStore.ts#L302-L322`
- **Issue**:
  - In line 308, error message says `Parameter: "valueChangeSets"` instead of `"dataChangeSets"`.
  - Returns `cm`, which is `undefined` if only `dataChangeSets` were supplied.
- **Expected**: Fix parameter name in error message; return valid modification count.

### 5. `createWhereFilter` proxy execution context
- **Location**: `src/packages/utico/src/store/dataStore.ts#L164-L185`
- **Issue**: `Reflect.apply(targetFn, thisArg, args)` passes the Proxy instance as `thisArg`. Certain internal methods of Dexie's `WhereClause` inspect private fields or rely on `this` being the actual `WhereClause` instance.
- **Expected**: Forward `target` instead of `thisArg` in `Reflect.apply(targetFn, target, args)` to preserve Dexie internal state.

### 6. Signature asymmetry between `DataStore.orderBy` and `StoreCollection.orderBy`
- **Location**: `src/packages/utico/src/store/dataStore.ts#L83-L85` and `#L378-L388`
- **Issue**:
  - `DataStore.orderBy()` returns a chainable `StoreCollection`.
  - `StoreCollection.orderBy()` returns a terminal `Promise<StoreItem<T, TValue>[]>`.
- **Expected**: Document or alias the terminal method (`StoreCollection.toArrayOrdered` or keep `orderBy` on collection returning `IStoreCollection` for consistent chaining).

### 7. Type mismatch on disposal
- **Location**: `src/packages/utico/src/store/dataStore.ts#L198-L201`
- **Issue**: `this._db = null;` conflicts with TypeScript declaration `private _db: StoreDb<T> | undefined;`.
- **Expected**: Use `this._db = undefined;`.

---

## Acceptance Criteria
- [x] `StoreCollection.toArray("createdAt")` correctly sorts in ascending order without requiring explicit `"asc"`.
- [x] `StoreCollection.modify(undefined, callback)` updates data table records as expected.
- [x] `DataStore.bulkSet` handles setting only `dataRecords` without runtime TypeError.
- [x] `DataStore.bulkSet` harmonizes generated UUID keys across paired metadata and data records.
- [x] `DataStore.bulkUpdate` returns valid count and uses correct parameter name in error messages.
- [x] `createWhereFilter` proxy reliably executes all Dexie WhereClause filter methods (`equals`, `between`, `anyOf`, `startsWith`, etc.).
- [x] All new edge cases are covered by unit tests in `src/packages/utico/tests/persistentStore.test.ts`.
- [x] `pnpm --filter @actdim/utico test` passes with zero failures.
