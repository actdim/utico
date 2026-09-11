---
protocol: along
slug: topic--05-patterns-and-recipes
title: 05 Patterns and Recipes
type: topic
created: 2026-08-27
updated: 2026-09-11
tags: [05-patterns-and-recipes, patterns, recipes]
---

# 05. Patterns and Recipes

Practical architectural patterns and code recipes using `@actdim/utico`.

---

## Recipe 1: Dot-Notation Deep Typing & Patch Updates

Safely update nested properties without breaking compile-time type safety:

```typescript
import type { KeyPath, KeyPathValueMap } from '@actdim/utico/typeCore';
import { getByKeyPath, setByKeyPath } from '@actdim/utico/typeCore';

type AppConfig = {
  server: {
    host: string;
    port: number;
    ssl: { enabled: boolean; certPath?: string };
  };
  debug: boolean;
};

// 1. Compile-time verified dot-notation paths
type ConfigPaths = KeyPath<AppConfig>;
// => "server" | "debug" | "server.host" | "server.port" | "server.ssl" | "server.ssl.enabled" | ...

// 2. Strongly-typed patch object
const patch: KeyPathValueMap<AppConfig> = {
  'server.port': 8080,
  'server.ssl.enabled': true
};

// 3. Runtime mutation with leaf-type verification
const cfg: AppConfig = {
  server: { host: 'localhost', port: 3000, ssl: { enabled: false } },
  debug: true
};

setByKeyPath(cfg, 'server.port', 8080);
console.log(getByKeyPath(cfg, 'server.port')); // => 8080
```

---

## Recipe 2: Mutex Concurrency with AsyncLock

Prevent race conditions in async operations with named locks and timeouts:

```typescript
import { AsyncLock } from '@actdim/utico/asyncLock';

const syncLock = new AsyncLock();

async function updateAccountBalance(accountId: string, amount: number) {
  return await syncLock.dispatch(`account:${accountId}`, async () => {
    const current = await fetchBalance(accountId);
    const updated = current + amount;
    await saveBalance(accountId, updated);
    return updated;
  });
}
```

---

## Recipe 3: Reactive Function & Promise Tracking with watchable

Track pending / fulfilled state of async calls without manual `try/finally` state tracking:

```typescript
import { watch } from '@actdim/utico/watchable';

// Wraps promise with observable status fields
const task = watch(async () => {
  const response = await fetch('/api/data');
  return await response.json();
});

console.log(task.status);  // "pending"
console.log(task.settled); // false

await task;

console.log(task.status);  // "fulfilled"
console.log(task.result);  // parsed JSON data
```

---

## Recipe 4: IndexedDB Persistence with PersistentStore

Declarative IndexedDB storage using typed schemas on top of Dexie:

```typescript
import { PersistentStore } from '@actdim/utico/store';

type UserSession = {
  id: string;
  userId: string;
  token: string;
  expiresAt: number;
};

const sessionStore = new PersistentStore<UserSession>({
  dbName: 'AppAuthDb',
  tableName: 'sessions',
  schema: '&id, userId, expiresAt'
});

await sessionStore.put({
  id: 'sess-123',
  userId: 'usr-456',
  token: 'jwt-token-xyz',
  expiresAt: Date.now() + 3600000
});

const session = await sessionStore.get('sess-123');
```

---

## 5. Cross-Links

- [Knowledge Base Index](./INDEX.md) - Knowledge Base Root
- [01 System Architecture](./topic--architecture.md) - System Architecture
- [02 Domain Model](./topic--domain-model.md) - Domain Model
- [03 Setup & Workflow](./topic--setup-and-workflow.md) - Setup and Workflow
- [04 API Reference](./topic--04-api-reference.md) - Exhaustive API Reference
- [License](./topic--license.md) - License Information
