---
protocol: along
protocol_version: "2.2.5"
slug: setup-and-workflow
title: 03 Setup And Workflow
type: topic
created: 2026-08-27
updated: 2026-09-02
tags: [setup-and-workflow]
---

# @actdim/utico Setup, Build & Workflow

## 1. Prerequisites & Installation

- **Node.js**: >= 20.0.0
- **Package Manager**: `pnpm` (version ~10.21.0)
- **TypeScript**: >= 5.9.3

Install dependencies in the monorepo root or package:
```bash
pnpm install
```

### Peer Dependencies
```bash
pnpm add dexie@^4.2.0 uuid@^13.0.0 luxon@^3.7.2
```

## 2. Scripts & Workflows

| Command | Action | Notes |
|---|---|---|
| `pnpm run build` | `tsc -b tsconfig.json && vite build` | Typechecks and generates ES bundles in `dist/` with `.d.ts` definitions via `vite-plugin-dts` |
| `pnpm run test` | `npx vitest --config=vitest.node.config.ts --no-cache` | Runs unit test suite under Node.js with `fake-indexeddb` |
| `pnpm run test:w` | `npx vitest --config=vitest.node.config.ts --watch` | Runs test watcher in interactive mode |
| `pnpm run test:v8` | `npx vite` | Launches browser-based test suite with DOM & Canvas support |
| `pnpm run typecheck` | `tsc -b tsconfig.json` | Validates TypeScript compiler checks across all source files |
| `pnpm run lint` | `eslint "./**/*.{ts,tsx}"` | Runs ESLint with TypeScript formatting rules |
| `pnpm run format` | `prettier --write .` | Formats all files according to `.prettierrc` |

## 3. Testing Strategies & Setup

- **In-Memory IndexedDB**: Node tests use `fake-indexeddb` to test `PersistentStore` and `PersistentCache` without requiring a headless browser.
- **Async Concurrency Tests**: `AsyncLock` and `PersistentCache` tests verify strict FIFO queuing and expiration under high concurrency with randomized delays (`delay(ms)`).
- **Time Freezing**: Vitest `vi.useFakeTimers()` is used to assert timer cleanup and eviction intervals.

## 4. Cross-Links
- [[INDEX.md]] - Knowledge Base Root
- [[01-architecture.md]] - System Architecture
- [[02-domain-model.md]] - Domain Model
- [[04-api-reference.md]] - API Reference
- [[05-patterns-and-recipes.md]] - Practical Recipes
