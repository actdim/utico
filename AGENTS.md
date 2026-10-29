<!-- BEGIN ALONG-PROTOCOL root (managed by along-init - do not edit by hand) -->
# ALONG-PROTOCOL v4.5.4

This repo carries its own agent context, provider-agnostically. Follow it every session, whatever tool you are. This is the core; procedures (completion checklist, doc routing, merges, along-team, tool-use rules) live in `docs/topic--along-protocol.md` - pull the section you need via `/along-kb-search`. A gate's error message carries its detail.

## Where state lives
- **Nearest wins**: any folder may carry its own `AGENTS.md` + `.along/`; use the NEAREST for the area you work in. Nearest `.along/` > higher-level `.along/` > global config. Only a nested `.git` or a user-run `along init` makes a subproject.
- **Read at session start** (not auto-loaded): `.along/ISSUES.md`, `.along/CONSTRAINTS.md`, your issue `.along/ISSUES/<type>--<slug>.md`; when relevant `.along/VISION.md`, `.along/GLOSSARY.md`. They reflect the state WHEN WRITTEN - verify named files/APIs/flags against the code.
- **Entities**: issues (`feat|bug|debt|task|docs|spike`), ADRs (`.along/DECISIONS/`, never edited - superseded), milestones, sessions. Keys `<type>--<slug>`, referenced by key, never by path; schemas in `docs/topic--domain-model.md`. Create them from intent unprompted (build/fix -> issue, blocked -> issue tagged `risk`, compare -> `spike` issue, release -> milestone).
- **Projections** (`ISSUES.md`, `DECISIONS.md`, `CONSTRAINTS.md`, `docs/INDEX.md`) are compiled: on conflict take either side and re-run the sync.

## Anchor work to an issue
1. Find or create the issue with `status: in-progress`; `along start <slug>` binds this session.
2. Source edits unlock after the user approves the plan (`EnterPlanMode` -> `ExitPlanMode`, or `along plan approve --plan-file <path>` after their explicit yes). Questions get read-only answers; 1-line typo/comment edits are exempt.
3. Commit via `/along-commit`: bound to the slug, no AI `Co-Authored-By:` trailers.
4. Finish with the completion checklist, ending in `along wrap <slug> --summary "..." (--decisions <ADR...> | --no-decisions)`.

## Gates
Runtime hooks enforce these where installed; elsewhere (`along doctor` shows the level) self-apply every one and use the `along` CLI instead of raw tools.
- [gate: require-active-issue] [gate: require-plan-approval] - no source edit without an in-progress issue and an approved plan.
- [gate: subproject-boundary] - a subproject's entities go in ITS `.along/`; cross-subproject work needs an issue in each, or a root umbrella with `parent:` children.
- [gate: workspace-containment] - read/write inside the workspace (plus temp); other roots need `allowed_roots`; never credential stores.
- [gate: projection-protection] - never hand-edit or hand-merge projections.
- [gate: commit-issue-binding] - every commit names the active issue.
- [gate: issue-lifecycle] [gate: entity-reference-integrity] [gate: entity-deletion-protection] - close via `along wrap` / `along issue done`; rename or supersede, never delete a referenced entity.
- [gate: doc-manual-lock] - `write_policy: manual` docs change only under a `docs--<slug>` issue.
- [gate: rule-pack-protection] - never edit `.along/rules/**/*.md` (`along rules attach` owns them).
- [gate: doc-routing-compliance] - ADR vs `README.md` vs `docs/topic--*.md` routing tree.
- [gate: untracked-exports] - dashboards and `.along/diagnostics/` stay out of Git.
- [gate: cli_safety] - file content via file tools, never heredocs or `python -c`; no global installs.
- [gate: team-step-active] [gate: team-reviews-before-stop] - an `along-team` blackboard holds you to its step loop.
- [gate: test_before_stop] [gate: wrap_before_stop] [gate: projection_sync_before_stop] - before stopping: tests green, session wrapped, projections synced.
- [gate: unresolved_gate_denial] - a denied tool call is redone within the gate's rules or told to the user (`along gates ack`), never dropped silently; closing waits for their reply.
- Commit-time (`along lint`, pre-commit + CI): ASCII typography, fence languages, relative links, no `docs/` -> `.along/` links, Windows-safe names, no secrets, no stubs.
- Bypass is the user's call: `-n`, `--force-reason`, `scratch fallback` need `--reason` after their reply; recorded in `along gates stats`.

## Judgment rules
- Ground facts in code, `README.md` and `docs/`; no generic placeholders. Query `/along-kb-search` before reading whole docs; update affected `docs/topic--*.md` after non-trivial changes.
- Use `/along-test`, `/along-build`, `/along-dev` before raw commands, with quiet flags. Review your diff and blast radius (`along graph-impact`).
- Never delete or truncate docs, comments or code unless told; no stubs; check `git diff --stat` after batch edits. Verify written files parse. Tests stay hermetic.
- Scope > 3 files, crossing subsystems or refactoring core engines: route to `along-team`; plans MUST declare `Execution Mode: Direct` or `Role-Based`.
- Treat the `along` CLI as a black box (`along <cmd> --help`, no engine source outside the Along repo); report its errors verbatim.
<!-- END ALONG-PROTOCOL -->

See @AGENTS.md for project instructions and guidance.

# @actdim/utico - Agent Instructions

TypeScript utility toolkit published as `@actdim/utico`. ESM-only, built with Vite,
tested with Vitest + Chai. All source in `src/`, all tests in `tests/`.

## Ecosystem Repositories

- **`@actdim/utico`** (TypeScript Utilities & Concurrency): `https://github.com/actdim/utico.git`
- **`@actdim/dynstruct`** (Component Framework): `https://github.com/actdim/dynstruct.git`
- **`@actdim/dynstruct-mui`** (Material UI Wrappers): `https://github.com/actdim/dynstruct-mui.git`
- **`@actdim/msgmesh`** (Message Mesh & Service Bus): `https://github.com/actdim/msgmesh.git`

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

Tests use `fake-indexeddb` for IndexedDB in Node.js - no browser required.
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
| `@actdim/utico/store/dataStore` | `src/store/dataStore.ts` | Core DataStore - wrapped by PersistentStore |
| `@actdim/utico/store/storeDb` | `src/store/storeDb.ts` | Dexie schema wrapper; `storeDb.d.ts` intentionally deleted post-build (no types) |
| `@actdim/utico/i18n/*` | `src/i18n/` | Culture definitions (`enUsCulture`, `euCulture`, etc.) |
| `@actdim/utico/gfx/*` | `src/gfx/` | `canvasUtils`, `color` - graphics helpers |

---

## TypeScript Config Layout

Solution-style split - do not collapse it back into one config:

- `tsconfig.base.json` - shared `compilerOptions` only. `moduleResolution: "bundler"` (this is a Vite package; do NOT switch to `"node"`/`node10` (deprecated) or `nodenext` (would force `.js` import extensions)). No `baseUrl` (deprecated in TS 6.0) - `paths` targets are relative: `"@/*": ["./src/*"]`. `extends` inherits only `compilerOptions`, not `include`/`files`/`references`.
- `tsconfig.json` - pure orchestrator: `{ "files": [], "references": [...] }`. It compiles nothing itself; it only wires the leaf projects.
- `tsconfig.build.json` - library build; emits `.d.ts` to `dist`. Consumed by `vite-plugin-dts` via its `tsconfigPath` (must stay a config WITHOUT `references`, else the plugin emits zero declarations).
- `tsconfig.dev.json` - editor/dev + tests; broad `types` (node, vitest/globals, vite/client, ...).

Rules:
- Root Node files (`packageConfig.ts`, `vite.config.ts`, `vitest*.config.ts`) get node types via `types: ["node"]` in the build/dev projects - NOT by editing includes elsewhere or adding `node` to a shared `types` array (that leaks node globals into browser `src`). If the editor shows "Cannot find name 'path'/'__dirname'" on such a file, it means the file isn't routed to a project - check the `references` chain, don't hack the source with `/// <reference>`.
- Always type-check the solution with `tsc -b` (build mode), never `tsc -p` - `-p` sees `files: []` and checks nothing. Both `typecheck` and `build` scripts already use `tsc -b tsconfig.json`.

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
- Transactions are managed automatically - callers never handle them directly.
- `StructEventTarget` is the event base for `PersistentCache`.

### Store data model

Every stored item has two separate tables:
- **metadata** - `MetadataRecord` (key, createdAt, updatedAt, tags, + custom fields)
- **data** - `DataRecord<TValue>` (key, value) - keyed same as metadata

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

`store.where("score").above(10).toArray()` - uses IndexedDB index directly.
`store.query().filter(m => ...).limit(n).toArray()` - in-memory scan, use for complex conditions.

### WatchablePromise

`watch(fn)` wraps any executor. Check `.status`, `.settled`, `.result` synchronously at any point.
`toWatchable(fn)` wraps a function - check `.executing` before calling again to prevent double invocation.

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
- `decorators.ts` - `@nonEnumerable` untested
- `memoryCache.ts` - untested
- `gfx/`, `i18n/`, `math.ts`, `patterns.ts` - untested


### Design Concerns

- **`utils.ts` - commented-out `TODO` block** (lines 201-231): alternative metadata implementation
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
The package is `"type": "module"` - ESM only, no CJS output.

## Project specifics

<!-- BEGIN ALONG-RULES -->
See the following engineering guidelines:
- `[languages/typescript.md](.along/rules/languages/typescript.md)`
- `[platforms/web.md](.along/rules/platforms/web.md)`
<!-- END ALONG-RULES -->
