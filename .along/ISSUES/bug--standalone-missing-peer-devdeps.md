---
protocol: along
protocol_version: "4.6.1"
slug: standalone-missing-peer-devdeps
type: bug
status: open
priority: medium
created: 2026-11-08
updated: 2026-11-08
agent: claude-code
tags: [tooling, standalone, ci]
blocked_by: []
related: [task--adopt-dev-config]
---

# Standalone clone fails typecheck/build/test: peerDependencies not installed

Found while verifying `task--adopt-dev-config`; red at HEAD `64067cf` before that change (identical result after it).
In a fresh clone outside Mempart (`git clone`, `pnpm install --no-frozen-lockfile`), `.npmrc` sets
`auto-install-peers=false` and the peers `uuid`, `dexie`, `luxon` are not devDependencies, so they are not
installed: `tsc -b tsconfig.json` reports 34 errors (`TS2307 Cannot find module` plus follow-up errors in
`src/store/*`), `pnpm run build` fails and 6 of 12 test files fail. Inside Mempart the workspace provides
them, so the problem is invisible there. `pnpm run lint` is unaffected (exit 0).

## Requirements
- REQ-1: `package.json` MUST list every peerDependency used by `src/` or `tests/` also as a devDependency with a range satisfying the peer range.
- REQ-2: A fresh standalone clone MUST pass `pnpm install`, `pnpm run typecheck`, `pnpm run build` and `pnpm run test`.

## Acceptance Criteria
- [ ] Standalone clone: typecheck 0 errors, build exit 0, all test files pass.
- [ ] Mempart workspace `pnpm --dir src run typecheck` still passes.
