# @actdim/utico — Agent Instructions

TypeScript utility toolkit published as `@actdim/utico`. ESM-only, built with Vite,
tested with Vitest + Chai. All source in `src/`, all tests in `tests/`.

---

## Commands

```bash
pnpm test              # Run tests (vitest)
pnpm test:w            # Watch mode
pnpm build             # type-check (build mode) + Vite build → dist/
pnpm typecheck         # type-check (build mode)
pnpm lint              # ESLint (max-warnings 0)
pnpm format            # Prettier write
pnpm format:check      # Prettier check
```

Tests use `fake-indexeddb` for IndexedDB in Node.js — no browser required.
The vitest config sets `isolate: false` and `pool: "forks"` intentionally (debugger support).

---

## Module Map

Each module is a separate entry point in `package.json exports`.
Import paths are `@actdim/utico/<module>`.

| Import path | Source file | Purpose |
|---|---|---|
| `@actdim/utico/typeCore` | `src/typeCore.ts` | Compile-time utility types + runtime key/prefix helpers |
| `@actdim/utico/typeUtils` | `src/typeUtils.ts` | Runtime type utilities, proxies, object/enum helpers |
| `@actdim/utico/stringCore` | `src/stringCore.ts` | Locale-aware string comparison (Intl.Collator) |
| `@actdim/utico/metadata` | `src/metadata.ts` | Property metadata via WeakMap + prototype chain |
| `@actdim/utico/decorators` | `src/decorators.ts` | `@nonEnumerable` property decorator |
| `@actdim/utico/dateTimeDataFormat` | `src/dateTimeDataFormat.ts` | Date/time parsing + serialization (Luxon) |
| `@actdim/utico/structEvent` | `src/structEvent.ts` | Typed DOM events (`StructEvent`, `StructEventTarget`) |
| `@actdim/utico/watchable` | `src/watchable.ts` | Observable promise/function execution state |
| `@actdim/utico/asyncLock` | `src/asyncLock.ts` | Async mutual exclusion with timeout |
| `@actdim/utico/store/storeContracts` | `src/store/storeContracts.ts` | Store interfaces and types |
| `@actdim/utico/store/persistentStore` | `src/store/persistentStore.ts` | IndexedDB store (Dexie) |
| `@actdim/utico/cache/cacheContracts` | `src/cache/cacheContracts.ts` | Cache types |
| `@actdim/utico/cache/persistentCache` | `src/cache/persistentCache.ts` | IndexedDB cache with TTL/eviction |

### Also exported (not documented in README):

Every file in `src/` is built and exported via the wildcard `"./*": "./dist/*.es.js"`.
These modules are importable but have no public documentation:

| Import path | Source file | Purpose |
|---|---|---|
| `@actdim/utico/utils` | `src/utils.ts` | `delay`, `withTimeout`, `lazy`, `memoEffect`, `searchTree`, `buildFuncArgCacheKey` |
| `@actdim/utico/math` | `src/math.ts` | `round` with decimal precision |
| `@actdim/utico/patterns` | `src/patterns.ts` | `noop` only |
| `@actdim/utico/arrayExtensions` | `src/arrayExtensions.ts` | `Array.prototype` extensions: `unfold`, `max`, `min`, `orderBy`, `orderByDesc`, `groupBy`, `distinct`, `copy`, `copyTo` |
| `@actdim/utico/dataFormats` | `src/dataFormats.ts` | Additional data format utilities |
| `@actdim/utico/cache/memoryCache` | `src/cache/memoryCache.ts` | In-memory generic cache |
| `@actdim/utico/store/dataStore` | `src/store/dataStore.ts` | Core DataStore — wrapped by PersistentStore |
| `@actdim/utico/store/storeDb` | `src/store/storeDb.ts` | Dexie schema wrapper; `storeDb.d.ts` intentionally deleted post-build (no types) |
| `@actdim/utico/i18n/*` | `src/i18n/` | Culture definitions (`enUsCulture`, `euCulture`, etc.) |
| `@actdim/utico/gfx/*` | `src/gfx/` | `canvasUtils`, `color` — graphics helpers |

---

## TypeScript Config Layout

Solution-style split — do not collapse it back into one config:

- `tsconfig.base.json` — shared `compilerOptions` only. `moduleResolution: "bundler"` (this is a Vite package; do NOT switch to `"node"`/`node10` (deprecated) or `nodenext` (would force `.js` import extensions)). No `baseUrl` (deprecated in TS 6.0) — `paths` targets are relative: `"@/*": ["./src/*"]`. `extends` inherits only `compilerOptions`, not `include`/`files`/`references`.
- `tsconfig.json` — pure orchestrator: `{ "files": [], "references": [...] }`. It compiles nothing itself; it only wires the leaf projects.
- `tsconfig.build.json` — library build; emits `.d.ts` to `dist`. Consumed by `vite-plugin-dts` via its `tsconfigPath` (must stay a config WITHOUT `references`, else the plugin emits zero declarations).
- `tsconfig.dev.json` — editor/dev + tests; broad `types` (node, vitest/globals, vite/client, …).

Rules:
- Root Node files (`packageConfig.ts`, `vite.config.ts`, `vitest*.config.ts`) get node types via `types: ["node"]` in the build/dev projects — NOT by editing includes elsewhere or adding `node` to a shared `types` array (that leaks node globals into browser `src`). If the editor shows "Cannot find name 'path'/'__dirname'" on such a file, it means the file isn't routed to a project — check the `references` chain, don't hack the source with `/// <reference>`.
- Always type-check the solution with `tsc -b` (build mode), never `tsc -p` — `-p` sees `files: []` and checks nothing. Both `typecheck` and `build` scripts already use `tsc -b tsconfig.json --noEmit`.

---

## Architecture

```
PersistentCache  ──builds on──►  PersistentStore
                                       │
                                  DataStore (internal)
                                       │
                                   StoreDb (Dexie wrapper, internal)
                                       │
                                   IndexedDB
```

- `PersistentStore.open()` and `PersistentCache.open()` are factory methods (async).
- Both use `AsyncLock` internally to serialize concurrent DB access.
- Transactions are managed automatically — callers never handle them directly.
- `StructEventTarget` is the event base for `PersistentCache`.

### Store data model

Every stored item has two separate tables:
- **metadata** — `MetadataRecord` (key, createdAt, updatedAt, tags, + custom fields)
- **data** — `DataRecord<TValue>` (key, value) — keyed same as metadata

`StoreItem<T, TValue>` combines them. Queries operate on the metadata table; data is
joined in automatically by `StoreCollection.toArray()`.

### Cache expiration model

`CacheMetadataRecord` adds: `accessedAt`, `expiresAt`, `slidingExpiration`, `absoluteExpiration`.
- `slidingExpiration` (ms): `expiresAt` is reset to `now + slidingExpiration` on every `get()`.
- `absoluteExpiration`: hard cap, `expiresAt` never exceeds it.
- `ttl`: shorthand that computes `absoluteExpiration` from creation time.
- Background cleanup runs on `setInterval(cleanupTimeout)` and fires the `"evict"` event.
- Call `cache[Symbol.dispose]()` or use `using` syntax (TS 5.2+) to stop the timer.

---

## Key Patterns

### Path alias

All source imports use `@/` alias (mapped to `src/`):
```ts
import { keyOf } from "@/typeUtils";
```

### Constructor binding (TypeUtils)

Prefer `typed()` (TS 4.7+ Instantiation Expression) over subclassing to bind generic constructors:
```ts
const PersistentCacheEvent = typed(StructEvent<MyEventStruct, MyClass>);
```
Use `createConstructor()` when the result must be callable without `new`.

### FieldDef syntax for PersistentStore

```ts
["&key", "createdAt", "*tags", "score"]
// & = unique, * = multi-entry (array), ++ = auto-increment, plain = regular index
```
Spread `defaultMetadataFieldDefTemplate` when adding custom fields to a typed store.

### WhereFilter (index queries)

`store.where("score").above(10).toArray()` — uses IndexedDB index directly.
`store.query().filter(m => ...).limit(n).toArray()` — in-memory scan, use for complex conditions.

### WatchablePromise

`watch(fn)` wraps any executor. Check `.status`, `.settled`, `.result` synchronously at any point.
`toWatchable(fn)` wraps a function — check `.executing` before calling again to prevent double invocation.

---

## Test Conventions

- Test files: `tests/*.test.ts`
- Framework: Vitest with Chai `expect`
- Use unique DB names per test to avoid state leakage:
  ```ts
  const store = await PersistentStore.open(`test-${Date.now()}`);
  ```
- Clean up in `afterEach`/`finally`:
  ```ts
  await PersistentStore.delete(name);
  ```
- `fake-indexeddb` is set up globally via `vitest.setup.ts`.

---

## Known Issues & Problems


### Missing Tests

These modules have no test coverage:
- `decorators.ts` — `@nonEnumerable` untested
- `memoryCache.ts` — untested
- `gfx/`, `i18n/`, `math.ts`, `patterns.ts` — untested


### Design Concerns

- **`utils.ts` — commented-out `TODO` block** (lines 201–231): alternative metadata implementation
  sketched but never finished. Either implement or remove.

- **`patterns.ts`** exports only `noop`. Either extend or merge into `utils.ts`.

---

## Peer Dependencies

| Package | Required by | Min version |
|---|---|---|
| `dexie` | `store`, `cache` | `>=4.2.0` |
| `uuid` | `store`, `cache`, `utils` | `>=13.0.0` |
| `luxon` | `dateTimeDataFormat` | `>=3.7.2` |

Install only what you use. Modules that don't use a peer dep have no hard dependency on it.

---

## Build Output

`dist/` contains per-module `.es.js` + `.d.ts` files with source maps.
`dist/store/storeDb.d.ts` is intentionally deleted post-build to hide the internal Dexie schema.
The package is `"type": "module"` — ESM only, no CJS output.
