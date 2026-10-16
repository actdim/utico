---
protocol: along
protocol_version: "4.4.16"
slug: agent-native-reflection-and-types
type: task
status: open
priority: medium
created: 2026-10-16
updated: 2026-10-16
agent: antigravity
tags: [agent, ai, utico, metaprogramming, metadata, llms]
milestone: v2.0.0-along-transition
parent: task--agent-native-ecosystem-standardization
blocked_by: []
related: []
---

# Agent-native metadata, reflection utilities, and llms.txt for Utico

## Purpose and Scope

`@actdim/utico` provides the underlying TypeScript metaprogramming, runtime reflection, structured persistence, and concurrency primitives for the Actdim ecosystem.

While `dynstruct` and `dynstruct-mui` govern the UI and `msgmesh` governs communication, `utico` provides the foundation for data persistence, atomic operations, and metadata reflection. For AI coding agents, Utico eliminates the need to write ad-hoc caching maps, raw IndexedDB boilerplate, or leaky async concurrency locks.

This task specifies the agent-native manifests, `llms.txt` guidelines, and JSDoc contracts for `@actdim/utico`.

---

## 1. Package Manifest (`package.json`)

Update the package manifest with agent-native metadata:

- **`description`**:
  ```text
  "Metaprogramming, runtime reflection, structured persistence, and type-level utilities for TypeScript and agentic workflows."
  ```

- **`keywords`**:
  Add agent and metaprogramming keywords:
  ```json
  [
    "agent-native",
    "ai-ready",
    "llm-friendly",
    "type-metaprogramming",
    "runtime-metadata",
    "agent-tools",
    "reflection",
    "persistence",
    "caching",
    "concurrency",
    "typescript"
  ]
  ```

- **`ai` and `llms` fields**:
  Verify alignment with ecosystem standard:
  ```json
  "llms": "./llms.txt",
  "ai": {
    "instructions": "./AGENTS.md",
    "docs": "./docs",
    "llms": "./llms.txt",
    "llms-full": "./llms-full.txt"
  }
  ```

- **`files` array**:
  Ensure `llms.txt`, `llms-full.txt`, and `AGENTS.md` are packed for npm distribution.

---

## 2. Standardization of `llms.txt`

Restructure `llms.txt` following the llmstxt.org standard:

### Section A: Overview
Explain Utico as a curated toolkit of type-level tools, runtime reflection, storage, and caching primitives.

### Section B: Golden Rules for AI Agents
1. **Persistence Patterns**:
   Use Utico structured storage abstractions (IndexedDB/Dexie wrapper) rather than writing manual raw transactions or unmanaged `localStorage` calls.
2. **Concurrency Safety**:
   Use Utico mutex and async lock utilities to synchronize concurrent state mutations instead of implementing custom boolean flag locks.
3. **Caching**:
   Use Utico TTL cache abstractions with explicit eviction semantics rather than rolling custom `Map + setTimeout` implementations.
4. **Type-Level Utilities**:
   Leverage Utico type metaprogramming helpers (`DeepPartial`, `ValuesOf`, etc.) to enforce strict typing across application boundaries.

### Section C: Canonical Implementation Snippets
Provide concise recipes:
- Setting up a structured storage table.
- Using async mutex for atomic execution.
- Configuring a TTL cache with automatic invalidation.

---

## 3. In-Source JSDoc Annotations

Add `@example` and `@agentNotice` annotations to core utility exports in `src/`:
- Document mutex and lock acquire/release patterns.
- Document TTL cache configuration and expiration options.
- Document reflection decorators and metadata accessors.

---

## Acceptance Criteria

- [ ] `package.json` updated with agent-native description and keywords.
- [ ] `llms.txt` conforms to llmstxt.org with persistence, concurrency, and caching recipes.
- [ ] Core storage, mutex, and cache utilities annotated with `@example` JSDoc tags.
- [ ] Vitest test suite passes without errors (`pnpm test`).
