---
protocol: along
protocol_version: "4.4.15"
slug: separate-docs-and-vitepress-build
type: task
status: done
completed: 2026-10-16
priority: medium
created: 2026-10-16
updated: 2026-10-16
agent: antigravity
tags: []
parent: task--separate-docs-and-vitepress-build
blocked_by: []
related: []
---

# Separate docs sources and VitePress build artifacts

## Background Context
In `@actdim/utico`, the `docs/` folder contains essential TypeScript utility toolkit documentation and topic guides (`docs/topic--*.md`).
VitePress previously wrote compilation output to `docs/.vitepress/dist`, risking inclusion of large static website bundles into the published npm package.

## Implementation Details
1. Configured `docs/.vitepress/config.ts`:
   - `outDir: '../.dist-docs'`
   - `cacheDir: '../node_modules/.cache/vitepress'`
2. Added `!docs/.vitepress` to `package.json` `files` array to ensure `.vitepress` is excluded from npm releases.
3. Updated `.github/workflows/pages.yml` to upload Pages artifact from `.dist-docs`.
4. Added `.dist-docs/` to `.gitignore`.
5. Verified `pnpm run docs:build` compiles to `.dist-docs/` cleanly in 5.64s.
6. Verified `npm pack --dry-run` yields 200.2 kB tarball with 0 VitePress artifacts.

## Acceptance Criteria
- [x] Set `outDir: '../.dist-docs'` and `cacheDir: '../node_modules/.cache/vitepress'` in `docs/.vitepress/config.ts`
- [x] Add `!docs/.vitepress` to `package.json` `files`
- [x] Update `.github/workflows/pages.yml` artifact path to `.dist-docs`
- [x] Add `.dist-docs/` to `.gitignore`
- [x] Verify `docs:build` compiles outside `docs/`
- [x] Verify `npm pack --dry-run` excludes all `.vitepress` build artifacts and configs
- [x] All unit and integration tests pass cleanly (`pnpm test`)
