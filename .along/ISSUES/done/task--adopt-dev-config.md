---
protocol: along
protocol_version: "4.6.1"
slug: adopt-dev-config
type: task
status: done
completed: 2026-11-08
priority: medium
created: 2026-11-06
updated: 2026-11-08
agent: antigravity
parent: task--shared-lint-tsconfig
tags: [tooling, lint, typescript, dev-config]
blocked_by: []
related: []
plan_status: approved
---

# Adopt @actdim/dev-config shared presets

## Problem Statement
Migrate local ESLint, Prettier, and TypeScript compiler configurations to `@actdim/dev-config`.

## Phase 2b Recipe
1. Baseline: ESLint findings, print-config of 2 files, showConfig of `tsconfig.build.json` and `tsconfig.dev.json`, `prettier --check`.
2. Add devDependency `"@actdim/dev-config": ">=1.12.2"`.
3. ESLint config:
   - `msgmesh`, `utico`, `msgmesh-remote`, `msgmesh-store`: use `base()` with existing `noExplicitAny` setting.
   - `dynstruct`: use `base({ indent: 'off' })` + `react()`.
   - `dynstruct-mui`: use `base()` + `react()`.
   - `livestruct`: use `legacyRoot()` plus local `no-explicit-any: error` block.
4. Prettier config: `{ ...base, jsxSingleQuote: false, trailingComma: 'all' }` unless check list stays equal without overrides.
5. tsconfig: extend `["@actdim/dev-config/tsconfig/base.json", "@actdim/dev-config/tsconfig/loose.json"]` plus differing options. Intentional diffs: drop decorator flags, `lib: ["ES2022", "DOM", "DOM.Iterable"]`, `isolatedModules: true`.
6. Drop unused plugin devDependencies.
7. Verify standalone: `pnpm install && pnpm lint && pnpm typecheck` in a standalone clone.
8. Commit in submodule, push to remote, and bump pointer in Mempart root.

## Outcome (2026-11-08)
- Recipe corrections applied: `lib` stays `["ESNext", "DOM", "DOM.Iterable"]` (ESNext APIs are used; ES2022 would break); decorator flags KEPT here (`src/decorators.ts`, `src/metadata.ts`, `tests/metadata.test.ts` use legacy decorators).
- `eslint.config.mjs`: `base({ noExplicitAny: 'off' })` plus a local block restoring `@typescript-eslint/no-empty-object-type`, `@typescript-eslint/no-misused-promises` (`checksVoidReturn: false`), `@typescript-eslint/no-require-imports`, `no-async-promise-executor`, `no-constant-condition`, `no-prototype-builtins`, `no-useless-escape` (all `error`).
- ESLint: 41 findings before and after, identical lists; `--print-config` rule sets of 2 files identical.
- `--showConfig` diffs (build, dev): `isolatedModules: true` (+ implied `preserveConstEnums`), `dom.iterable` added. Nothing else.
- Prettier `--check` list unchanged (except the rewritten config files, now formatted).
- In Mempart: `tsc -b`, `vite build` and 12 test files pass.
- Standalone clone: lint exit 0 (41 problems) as at HEAD; typecheck / build / test were already red at HEAD `64067cf` (peers not installed) and are identical after the change: tracked in `bug--standalone-missing-peer-devdeps`.

## Acceptance Criteria
- [x] No standalone regression: lint, typecheck, build and test results in a fresh clone equal those at HEAD (pre-existing peer gap filed as `bug--standalone-missing-peer-devdeps`).
- [x] No regression in finding sets and effective compiler options.
