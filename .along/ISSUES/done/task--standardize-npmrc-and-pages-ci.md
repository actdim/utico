---
protocol: along
protocol_version: "4.4.16"
slug: standardize-npmrc-and-pages-ci
type: task
status: done
completed: 2026-10-18
priority: medium
created: 2026-10-18
updated: 2026-10-18
agent: antigravity
parent: task--standardize-package-lockfiles-and-npmrc
tags: [ci, github-pages, pnpm, lockfile, npmrc]
blocked_by: []
related: []
---

# Standardize .npmrc and GitHub Pages CI workflow in utico

## Problem
In `actdim/utico`, standalone pnpm installs and GitHub Pages CI require `.npmrc` with `auto-install-peers=false` to prevent peer dependency resolution failures for `@actdim/*` in isolated environments.

## Requirements
- Add `.npmrc` with `auto-install-peers=false`.
- Update `.github/workflows/pages.yml` to pass `--config.auto-install-peers=false` to `pnpm install`.
- Ensure standalone `pnpm-lock.yaml` is synchronized.

## Acceptance Criteria
- [x] `.npmrc` exists with `auto-install-peers=false`
- [x] `.github/workflows/pages.yml` updated with `--config.auto-install-peers=false`
- [x] Standalone lockfile synchronized
