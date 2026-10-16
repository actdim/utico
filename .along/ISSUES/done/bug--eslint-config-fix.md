---
protocol: along
protocol_version: "4.4.10"
slug: eslint-config-fix
type: bug
status: done
completed: 2026-10-12
priority: medium
created: 2026-10-12
updated: 2026-10-12
agent: claude-code
tags: [lint, tooling]
blocked_by: []
related: []
title: Fix broken eslint.config.mjs (syntax errors and global ignores)
---

# Rebuild eslint.config.mjs broken by interleaved old/new versions

## Problem Statement / Background
A git merge conflict left duplicated and interleaved old/new ESLint rules in eslint.config.mjs, causing pnpm lint to fail.

## Implementation Details
1. Resolved duplicate import statements and merged ESLint flat config cleanly.
2. Validated syntax using ESLint CLI runner.
3. Verified pnpm lint passes cleanly across the package.

## Acceptance Criteria
- [x] eslint.config.mjs syntax errors repaired
- [x] Duplicate rule declarations and imports removed
- [x] pnpm lint runs without errors
