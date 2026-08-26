# @actdim/utico Knowledge Base Index

Welcome to the **@actdim/utico** package Knowledge Base. This knowledge base provides comprehensive architectural documentation, domain models, API references, workflows, and practical patterns for the foundational TypeScript utility toolkit.

## Knowledge Base Articles

- [[01-architecture.md]] — **Architecture & Module Topology**: Foundational design principles, module boundaries, type engine, and storage pipeline.
- [[02-domain-model.md]] — **Domain Model & Type Hierarchy**: Contracts for `KeyPath`, `StructEvent`, `MetadataRecord`, `CacheOptions`, `AsyncLock`, and `DateTimeTransport`.
- [[03-setup-and-workflow.md]] — **Setup, Build & Workflow**: Build scripts, testing strategies (`fake-indexeddb`, concurrency tests), and developer tooling.
- [[04-api-reference.md]] — **Exhaustive API Reference**: Complete function signatures, class methods, options, and parameters across all modules.
- [[05-patterns-and-recipes.md]] — **Patterns & Recipes**: Production recipes for `AsyncLock`, IndexedDB stores, persistent cache with auto-eviction, and `watchable`.

## Module Map

| Module | Core Exports |
|---|---|
| `@actdim/utico/typeCore` | `KeyPath`, `KeyPathValue`, `KeyPathValueMap`, `Skip`, `Filter`, `Diff`, `getByKeyPath`, `setByKeyPath` |
| `@actdim/utico/typeUtils` | `typed`, `createConstructor`, `satisfies`, `proxify`, `createDeepProxy`, `orderedStringify`, `jsonEquals` |
| `@actdim/utico/asyncLock` | `AsyncLock` (`lock`, `tryLock`, `dispatch`) |
| `@actdim/utico/watchable` | `watch`, `toWatchable`, `WatchablePromise`, `WatchableFunc` |
| `@actdim/utico/structEvent` | `StructEvent`, `StructEventTarget` |
| `@actdim/utico/store/persistentStore` | `PersistentStore`, `defaultMetadataFieldDefTemplate`, index query builder |
| `@actdim/utico/cache/persistentCache` | `PersistentCache`, sliding & absolute TTL, automatic eviction |
| `@actdim/utico/dateTimeDataFormat` | `DateTimeExtended`, `toDateTime`, `dateTimeTransports` |
| `@actdim/utico/stringCore` | `equals`, `compare`, `ciCompare`, `ciStartsWith`, `ciEndsWith`, `ciIncludes` |
| `@actdim/utico/decorators` | `@nonEnumerable` |
| `@actdim/utico/metadata` | `@metadata`, `getPropertyMetadata`, `updatePropertyMetadata` |
| `@actdim/utico/arrayExtensions` | LINQ methods: `unfold`, `max`, `min`, `orderBy`, `groupBy`, `distinct` |
