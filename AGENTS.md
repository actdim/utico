<!-- BEGIN ALONG-PROTOCOL root (managed by along-init - do not edit by hand) -->
# ALONG-PROTOCOL v4.4.15

This repo carries its own agent context, provider-agnostically. Follow it every session, whatever tool you are.

## Scope, Precedence & Subproject Placement
- **Nearest Context Boundary**: Any folder may carry its own `AGENTS.md` + `.along/`; use the NEAREST ones for the area you're working in. On conflict, the more specific wins.
- **Subproject Localization** [gate: subproject-boundary]: In submodules, nested repos or symlinked folders: all entities (issues, sessions, ADRs, history) MUST be created in the NEAREST `.along/`. Agents are STRICTLY FORBIDDEN from dumping subproject changes into the workspace root `.along/`.
- **Multi-Subproject Work** [gate: subproject-boundary]: A change spanning subprojects needs an issue in each touched `.along/`, or a root umbrella issue whose child issues there carry `parent: <umbrella key>`. Edits under a subproject `.along/` are checked by path.
- **Subproject Boundary**: only a nested `.git` or a user-run `along init` makes a subproject; never init a manifest folder.
- **Precedence**: Nearest `.along/` > higher-level `.along/` > global config (`~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`, `~/.gemini/config/GEMINI.md`).

## At session start - read these yourself (they are NOT auto-loaded)
Use the NEAREST `.along/` for the area you're working in (fall back to a higher-level one if the folder has none):
1. `AGENTS.md` (nearest) - conventions to follow.
2. `.along/ISSUES.md` - active issue board (or query `/along-kb-search`).
3. `.along/CONSTRAINTS.md` - active architectural constraints (or full log in `.along/DECISIONS.md` / `.along/DECISIONS/`).
4. Active Issue file `.along/ISSUES/<type>--<slug>.md` for your task.
Also, when relevant: `.along/VISION.md`, `.along/GLOSSARY.md`. These reflect the state WHEN WRITTEN - verify any named file/API/flag against the real code first.

## Multi-Agent & Multi-Branch Concurrency
- **Zero-Manual-Merge Rule** [gate: projection-protection]: On merge conflicts in derived projections (`ISSUES.md`, `INDEX.md`, `DECISIONS.md`), accept either side and run `/along-issue-sync`, `/along-kb-sync`, or `/along-decision-sync` to recompile. `along git setup` registers merge drivers that do this automatically; afterwards run `along git sync`.
- **Append-Only Merge Driver**: `.along/HISTORY.md` and legacy monolithic `.along/DECISIONS.md` are append-only. Configure `.gitattributes` with `merge=union`. Modular ADR files in `.along/DECISIONS/` are isolated per-file to eliminate merge collisions.
- **Untracked Exports** [gate: untracked-exports]: `.along/dashboard.html`, `.along/DASHBOARD.md` and per-machine `.along/diagnostics/` stay out of Git.
- **Context Isolation**: Context is localized to the target issue file, session-scoped blackboard (`.along/.session/<slug>/`), and completed session logs.
- **Parallel Closeout**: `along session list`; on the user's yes `along plan approve --closeout --ready`, then `along session close --ready`.

## Mandatory Issue Anchoring
- **No Code Without Issue** [gate: require-active-issue]: Before modifying source code, agents MUST identify or create an issue in `.along/ISSUES/<type>--<slug>.md` and set `status: in-progress`.
- **Session Binding & Plan Approval** [gate: require-plan-approval]: `along start <slug>` binds THIS agent session to the issue; parallel sessions keep their own bindings. Source edits unlock after the user approves the plan (`EnterPlanMode` -> `ExitPlanMode`; outside plan mode, write the plan to a file and run `along plan approve --plan-file <path>` after the user's explicit yes). `along plan status` shows the binding.
- **Exemptions**: Read-only Q&A and 1-line micro-edits (typo fixes, comments) do not require issues.
- **Commit Binding** [gate: commit-issue-binding]: Every commit via `/along-commit` MUST bind to the active issue slug.
- **No AI Co-Authors** [gate: commit-no-ai-coauthor]: Commit messages MUST NOT carry `Co-Authored-By:` trailers naming an AI agent (GitHub lists the vendor as a contributor). `along hook install` turns runtime attribution off; opt out via `.along/config.json` `commits.allow_ai_coauthor: true`.

## Entity Ecosystem
- **Entity types**: Issues (`feat`, `bug`, `debt`, `task`, `docs`), Decisions (ADRs), Milestones, Risks, Spikes, Checklists, Sessions. Full YAML schemas: `docs/topic--domain-model.md`.
- **Canonical keys**: `<type>--<slug>` (e.g. `feat--token-refresh`). Reference by key, NEVER by file path.
- **ADRs**: Modular records in `.along/DECISIONS/ADR-YYYY-MM-DD--<slug>.md` (with legacy fallback to monolithic `DECISIONS.md`). Never edit past entries - mark superseded. Recompile projections (`.along/DECISIONS.md` board and `.along/CONSTRAINTS.md`) via `/along-decision-sync` or `along decision sync`.
- **Issue lifecycle** [gate: issue-lifecycle]: Close with `along issue done <slug>` (`status: done`, `completed`, moved to `.along/ISSUES/done/`).
- **Entity references** [gate: entity-reference-integrity] [gate: entity-deletion-protection]: Never delete an entity other entities reference; use `along issue rename` / `along issue supersede`.
- **Auto-entity creation**: Agents MUST automatically detect user intent (build/fix/refactor -> Issue, blocked/rate-limit -> Risk, compare/benchmark -> Spike, release/sprint -> Milestone) and create entities without prompting the user.

## Knowledge Base & Documentation
- **Stable Entry Point** [gate: stable-entry-point]: `README.md` and `docs/` never link into `.along/`; route through `docs/INDEX.md` or `docs/topic--<slug>.md`.
- **Portable Links** [gate: portable-links]: Relative Markdown links only.
- **Fact Grounding**: Agents MUST extract facts from actual code, `README.md`, `docs/`, and `package.json`. Generic LLM placeholders are strictly prohibited.
- **Fast Retrieval** [gate: fast-retrieval]: Agents MUST query `/along-kb-search` before reading whole documentation files.
- **Doc Blast Radius**: After non-trivial code changes, agents MUST map affected symbols to `docs/topic--*.md` articles and update them before completing the task.
- **Manual Document Lock** [gate: doc-manual-lock]: Documents marked with `write_policy: manual` (or `locked: true`) are protected from automated agent modification during blast radius sweeps. Modifications require an explicit documentation issue (`docs--<slug>`).
- **Managed Rule Packs** [gate: rule-pack-protection]: Never edit `.along/rules/**/*.md`; `along rules attach` owns them. Project guidelines go to `docs/topic--<slug>.md` or "Project specifics"; revert with `along rules restore`. `.along/rules/gates.yaml` and `.along/scripts/` stay repo-owned.
- **Documentation Routing Tree** [gate: doc-routing-compliance]:
  - Architectural choice / trade-off -> `.along/DECISIONS/` (ADR)
  - Public overview / pitch / landing page -> `README.md`
  - Technical interface contract / CLI spec -> `docs/topic--<slug>.md` (`type: reference`)
  - Conceptual explanation / comparison / philosophy -> `docs/topic--<slug>.md` (`type: explanation`, `write_policy: manual`)
  - Procedural walkthrough / runbook -> `docs/topic--<slug>.md` (`type: guide`)

## While working
- **Decisions**: Create new ADRs via `/along-decision-sync` or `along decision create <slug> --title "..."`. Add terms to `.along/GLOSSARY.md`.
- **Token hygiene**: Use quiet flags (`pytest -q`, `dotnet test -v q`), filter outputs, inspect targeted line ranges.
- **Lifecycle hooks first**: Agents MUST use `/along-test`, `/along-build`, `/along-dev` (or `.along/scripts/*.py`) before raw shell commands.
- **Post-change review**: Agents MUST inspect diffs and evaluate blast radius via `along graph-impact` (or static search fallback). Silent skips are forbidden.

## Stage & Session Completion Checklist
When a stage or session completes, agents MUST execute in this order:
1. [ ] **Tests** [gate: test_before_stop]: Run via `/along-test` with quiet flags. Zero failures.
2. [ ] **File Integrity**: `git status -u` - all new/modified files non-zero size, no empty placeholders.
3. [ ] **Code Review**: Inspect diff for side effects, verify REQ-N coverage, evaluate blast radius via `along graph-impact` (or static search), verify architectural decision compliance.
4. [ ] **Entity Reconciliation**: Close issues (`done` + move to `done/`), update milestones, resolve risks, conclude spikes.
5. [ ] **Doc Blast Radius**: Update affected `docs/topic--*.md`, `README.md` and Project specifics; add new terms to `.along/GLOSSARY.md`; touch `.along/VISION.md` only if scope/roadmap changed; run `/along-kb-sync`.
6. [ ] **Session Log & Wrap** [gate: wrap_before_stop]: `along wrap <slug> --summary "<summary>" (--decisions <ADR...> | --no-decisions)` writes `.along/SESSIONS/<YYYY>/<date>--<slug>.md` with the blackboard record, compiles projections, and appends to `.along/HISTORY.md` (provide `--summary` or let it fallback to issue title).
7. [ ] **Projections** [gate: projection_sync_before_stop]: Run `/along-issue-sync` and `/along-decision-sync`.
8. [ ] **HISTORY**: Verify line in `.along/HISTORY.md` (appended automatically by `along wrap`; update via `along history append <slug> "..."` if needed).
9. [ ] **Compaction**: Advise user to run `/compact`.

## Rules
- **Contract-First Lifecycle**:
  - Agents MUST execute `.along/scripts/<action>.py` or `/along-test`, `/along-build`, `/along-dev` before raw shell commands.
  - When `.along/scripts/` is missing, `along test`/`along build` auto-detects and synthesizes hooks.
  - In submodules, execute the hook from that subproject's own `.along/scripts/`.
- **Environment Isolation**:
  - Agents MUST NOT install system-wide or global packages when a script fails. Fix the architecture (missing `bootstrap.ensure_deps()`, incorrect `uv` wrapper), not the environment.
- **Workspace Containment** [gate: workspace-containment]: Read and write only inside the workspace. Writes elsewhere are limited to the temp dir and runtime artifact dirs. Other repos need `allowed_roots` (`.along/rules/gates.yaml`, issue frontmatter, `along start --allow-root`). Never touch credential stores (`~/.ssh`, `~/.aws`).
- **Runtimes Without Along Hooks** (Claude Cowork, Cursor, OpenCode, plain shells): gates are advisory there. Agents MUST self-apply every gate-tagged rule and use the `along` CLI for tests, commits, entity changes, and wrap instead of raw tools. `along doctor` reports the enforcement level.
- **File Modification & Anti-Deletion**:
  - Never delete, truncate, or overwrite existing documentation, comments, or code unless explicitly instructed.
  - After batch edits or migrations, agents MUST run `git diff --stat` and inspect unexpected size reductions.
  - No stubs or skeletons in place of populated code [gate: anti_stub_injection].
  - Anchor edits on minimal unique chunks. Restore unintended deletions immediately.
- **Clean ASCII** [gate: typography]: ASCII punctuation only (no typographic dashes, quotes, ellipsis, bullets, NBSP/zero-width chars or BOM); `along sanitize --write` fixes them.
- **Markdown** [gate: code-fence-language]: Every code fence names a language.
- **Bypass Is The User's Call**: `-n`, `--force-reason`, `scratch fallback` need `--reason` and the user's reply after the failure; each bypass is recorded (`along gates stats`).
- **File Content Via Tools Only** [gate: cli_safety]: Create/edit files with the agent's file tools. NEVER carry content in heredocs, `python -c`, or inline shell. Write scripts to a file first.
- **No Ad-Hoc Shell Code Probing**: Agents must never use `python -c` or inline shell commands to probe internal module symbols or inspect functions. Internal engine packages (`alongkit`, `scripts`) are not installed into the global Python environment, and ad-hoc shell probing produces confusing error traces instead of actionable information. Prescribed inspection tools: static file tools (`view_file`, `grep_search`), AST tools (`along graph-*`), official CLI subcommands (`along <command> --help`), or dedicated hermetic tests in `tests/`.
- **Verify Written Files**: After writing/patching, confirm parsing (`python -m compileall -q`, `bash -n`, etc.) before moving on.
- **Hermetic Tests**: Tests MUST target throwaway fixtures (`tempfile.mkdtemp()`), never the live repository. Read-only access to live state is allowed. Keep a meta-test that verifies `git status --porcelain -u` stays clean.
- **Inquiry Read-Only Invariance (Zero-Mutation Rule on Questions)** [gate: require-plan-approval]: On interrogative prompts ("is X done?", "why did Y fail?"), write/modify tools are STRICTLY PROHIBITED. Return a read-only audit report and ask for confirmation before modifying anything.
- **Mandatory Adaptive Complexity Escalation & Execution Mode Routing**: When scope touches > 3 files, crosses subsystems, or refactors core engines: single-agent execution is forbidden - route to `along-team`. Plans MUST declare `Execution Mode: Direct` or `Role-Based`. Role-based blackboards (`along scratch init`) are held to the step loop [gate: team-step-active] [gate: team-reviews-before-stop]; dropping it needs `along scratch fallback <slug> --reason "..."`.
- Windows-safe filenames [gate: windows-safe-filenames]: dates `YYYY-MM-DD`, date first.
- Keep `ISSUES.md` compact: `along context-budget --check` enforces the limit.
- Never write secrets into tracked files [gate: no-tracked-secrets].
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
