---
protocol: along
protocol_version: "4.4.16"
slug: remove-redundant-to-array-ordered
type: debt
status: done
completed: 2026-10-17
priority: low
created: 2026-10-17
updated: 2026-10-17
agent: antigravity
tags: [store, cleanup, api]
blocked_by: []
related: []
---

# Remove redundant toArrayOrdered method from StoreCollection

## Objective
Remove the redundant `toArrayOrdered` alias from `StoreCollection`, `IStoreCollection`, and test suites. `StoreCollection.toArray(orderBy?, orderDirection?)` and `StoreCollection.orderBy(field, direction)` already cover sorted array retrieval.

---

## Acceptance Criteria
- [x] `toArrayOrdered` is removed from `IStoreCollection` in `storeContracts.ts`.
- [x] `toArrayOrdered` is removed from `StoreCollection` in `dataStore.ts`.
- [x] Tests in `persistentStore.test.ts` verify sorting using standard `toArray` and `orderBy` without calling `toArrayOrdered`.
- [x] `pnpm --filter @actdim/utico test` passes with zero failures.
- [x] `pnpm --filter @actdim/utico build` completes without errors.
