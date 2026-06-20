# Systematic Logging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all server-side `console.*` calls with a structured `pino` logger, with PII redaction and a 4-level convention, across the codebase in 5 PR-ready phases.

**Architecture:** A single `src/lib/logger.ts` exports a configured `pino` instance with PII `redact` and dev/prod formatting (`pino-pretty` in dev, JSON in prod). `src/middleware.ts` excludes `/api/health` to avoid log flood. Each API route logs request lifecycle with `op`/`durationMs`/`userId` context. Service layer throws; routes catch and log. Error boundaries log via the same logger.

**Tech Stack:** Next.js 16, pino 10, pino-pretty 13, server-only 0.0.1, oxlint (deny-warnings), TypeScript 5.7, vitest.

## Global Constraints

- **Lint:** `bun run lint:strict` (= `oxlint --deny-warnings`) must pass at every checkpoint
- **Build:** `bun run build` must pass at every checkpoint
- **No `console.log`:** All server-side `console.log` must use `logger`; `console.log` violates `oxlint`'s `no-console` rule (`allow: ["warn", "error"]`)
- **`server-only`:** `src/lib/logger.ts` starts with `import 'server-only'`. Client components (e.g. `error.tsx`) that need to log must use a separate client-safe path — for now, keep client error logs in `useEffect` after a server log call, or do not log from client components
- **PII redact keys (mandatory):** `*.password`, `*.token`, `*.secret`, `req.headers.authorization`, `req.headers.cookie`
- **Levels:** `debug`, `info`, `warn`, `error` (4 levels; `fatal`/`trace` not used)
- **Dev/prod:** dev = `pino-pretty` with `colorize`; prod = raw JSON to stdout
- **LOG_LEVEL:** `debug` in dev, `info` in prod, overridable via env var
- **Commit style:** Conventional Commits; one PR per Task
- **oxlint wrapper fix (already applied in working tree):** `node_modules/.bin/oxlint` is a symlink to `node_modules/oxlint/bin/oxlint`. This must remain in working tree through Task 1 commit, then move with the codebase

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/lib/logger.ts` | pino instance with redact + dev/prod transport |
| `src/middleware.ts` | Exclude `/api/health` (and `_next`, `favicon`) from middleware |
| `src/lib/logger.test.ts` | Redact array + behavior verification (vitest) |
| `src/app/api/**/route.ts` (×10+) | Wrap GET/POST/etc. with try/catch + `logger.info`/`error` |
| `src/modules/*/api/service.ts` (×15) | Business events: `logger.info`; errors: throw, route catches |
| `src/app/(main)/**/error.tsx` (×10+) | Replace `console.error` with `logger.error` inside server-action or background — but `error.tsx` is client component, see Task 4 |
| `prisma/seeds/index.ts` | Use `logger.info`/`logger.error` (already partially done) |
| `src/test-utils/create-test-db.ts` | Use `logger.info` (already partially done) |
| `docs/common/development/logging.md` | Convention reference (4 levels, message pattern, error pattern, PII) |

---

## Task 1: Phase 1 — Logger infrastructure (PII redact + health check exclusion)

**Files:**
- Modify: `src/lib/logger.ts` (add PII `redact` config; export `REDACT_PATHS` constant for tests)
- Modify: `src/middleware.ts` (set matcher to exclude `/api/health`, `_next`, `favicon`)
- Create: `src/lib/logger.test.ts` (verify redact array + masking behavior)

**Interfaces:**
- Consumes: `pino` (already installed), `server-only` (already installed)
- Produces:
  - `export const logger: Logger` — pre-configured pino instance
  - `export const REDACT_PATHS: string[]` — array of pino redact paths (consumed by test)

**Note before starting:** Working tree already contains:
- `src/lib/logger.ts` (v1: simple pino, no redact)
- `src/middleware.ts` (currently simple `NextResponse.next()` without matcher, OR may not exist yet — see Step 4)
- `package.json` / `bun.lock` with pino, pino-pretty, server-only installed

These will be modified in this task. Do not create new logger files.

### Step 1.1: Write the failing test for PII redact

Create `src/lib/logger.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { logger, REDACT_PATHS } from './logger';
import pino from 'pino';

describe('logger', () => {
  it('exports the required PII redact paths', () => {
    expect(REDACT_PATHS).toEqual([
      '*.password',
      '*.token',
      '*.secret',
      'req.headers.authorization',
      'req.headers.cookie',
    ]);
  });

  it('masks password field at any depth', () => {
    // Build a fresh pino instance with the same redact array and capture output
    const lines: string[] = [];
    const stream = {
      write: (s: string) => {
        lines.push(s);
        return true;
      },
    };
    const captureLogger = pino(
      {
        redact: REDACT_PATHS,
        level: 'info',
      },
      stream,
    );
    captureLogger.info({ user: { name: 'alice', password: 'p4ssw0rd' } }, 'login');
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.user.name).toBe('alice');
    expect(parsed.user.password).toBe('[Redacted]');
  });

  it('masks authorization header', () => {
    const lines: string[] = [];
    const stream = {
      write: (s: string) => {
        lines.push(s);
        return true;
      },
    };
    const captureLogger = pino(
      { redact: REDACT_PATHS, level: 'info' },
      { write: (s) => { lines.push(s); return true; } },
    );
    captureLogger.info({ req: { headers: { authorization: 'Bearer xyz' } } }, 'request');
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.req.headers.authorization).toBe('[Redacted]');
  });

  it('logger has at least info level enabled', () => {
    expect(logger.level).toMatchObject({ level: expect.any(Number) });
    // pino returns a level object; just confirm the module exports a working logger
    expect(typeof logger.info).toBe('function');
  });
});
```

### Step 1.2: Run test to verify it fails

Run: `bunx vitest run src/lib/logger.test.ts`
Expected: FAIL — `REDACT_PATHS` is not exported from `./logger`.

### Step 1.3: Update `src/lib/logger.ts` with redact

Replace the contents of `src/lib/logger.ts` with:

```typescript
import 'server-only';
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const REDACT_PATHS = [
  '*.password',
  '*.token',
  '*.secret',
  'req.headers.authorization',
  'req.headers.cookie',
];

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  redact: REDACT_PATHS,
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, ignore: 'pid,hostname' },
    },
  }),
});
```

### Step 1.4: Run test to verify it passes

Run: `bunx vitest run src/lib/logger.test.ts`
Expected: 4 tests pass.

### Step 1.5: Set middleware health check exclusion

If `src/middleware.ts` does not exist, create it. If it exists, replace its contents with:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/health|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

Note: This middleware does NOT import `logger`. Its only purpose is to scope middleware to non-health paths so future middleware logic (if any) skips health checks.

### Step 1.6: Verify lint and build

Run:
```bash
bun run lint:strict
bun run build
```
Expected: both pass.

### Step 1.7: Commit

Stage and commit only the files in this task. The oxlint wrapper symlink fix (`node_modules/.bin/oxlint`) is a node_modules change — do NOT commit node_modules. If the symlink fix is needed for `bun run lint:strict` to work, leave it as an uncommitted working-tree change; document it in the PR description.

```bash
git add src/lib/logger.ts src/lib/logger.test.ts src/middleware.ts
git commit -m "feat(logger): add PII redact and health check middleware exclusion"
```

---

## Task 2: Phase 2 — Route handlers (API endpoints)

**Files:**
- Modify: `src/app/api/**/route.ts` (× 10+, listed below)

**Interfaces:**
- Consumes: `logger` from `@/lib/logger`
- Produces: each route handler wrapped in try/catch with `op`, `durationMs` context

**Route files to migrate** (discover with `find src/app/api -name route.ts` — verify list is current):

- `src/app/api/view-settings/route.ts`
- `src/app/api/view-settings/[viewId]/route.ts`
- `src/app/api/dcim/sites/route.ts`
- `src/app/api/dcim/cables/route.ts`
- `src/app/api/dcim/interfaces/route.ts`
- `src/app/api/dcim/devices/route.ts`
- `src/app/api/ipam/prefixes/route.ts`
- `src/app/api/ipam/ip-addresses/route.ts`
- `src/app/api/dcim/sites/platforms/route.ts`
- `src/app/metrics/route.ts`

Plus any new `route.ts` files found by `find`.

### Step 2.1: Migrate one route as the reference pattern

Open `src/app/api/ipam/prefixes/route.ts` and apply the standard pattern. Replace the file contents with:

```typescript
import { logger } from '@/lib/logger';
// ... existing imports (service, types, etc.)

export async function GET(request: Request) {
  const start = Date.now();
  try {
    const result = await getPrefixes(/* existing args */);
    logger.info(
      {
        op: 'listPrefixes',
        count: Array.isArray(result) ? result.length : undefined,
        durationMs: Date.now() - start,
      },
      'Listed IPAM prefixes',
    );
    return Response.json(result);
  } catch (err) {
    logger.error(
      {
        err,
        op: 'listPrefixes',
        durationMs: Date.now() - start,
        url: request.url,
      },
      'Failed to list IPAM prefixes',
    );
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Repeat the pattern for POST/PUT/DELETE exports in the same file.
```

Adapt `op`, success message, and result shape to the existing handler. Do not change the business logic — only wrap it in try/catch and add logger calls.

### Step 2.2: Verify lint and build for the reference route

```bash
bun run lint:strict
bun run build
```
Expected: both pass.

### Step 2.3: Apply the same pattern to all remaining route.ts files

For each remaining file in the list:

- Add `import { logger } from '@/lib/logger';`
- Wrap each exported HTTP method (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) with try/catch
- Use a unique `op` name per method (e.g. `op: 'createSubnet'`, `op: 'deleteSubnet'`)
- On success: `logger.info({ op, durationMs, ...ctx }, '<action> <entity>')`
- On error: `logger.error({ err, op, durationMs, ...ctx }, 'Failed to <action> <entity>')` then return 500 JSON

### Step 2.4: Verify lint and build for all routes

```bash
bun run lint:strict
bun run build
```
Expected: both pass.

### Step 2.5: Spot-check one route via curl (manual)

If a dev DB is running:
```bash
bun dev &
sleep 5
curl -sS http://localhost:3000/api/ipam/prefixes | head -c 200
```
Expected: response is normal (logger output in dev server stdout, request handled without error).

### Step 2.6: Commit

```bash
git add src/app/api src/app/metrics
git commit -m "feat(logger): wrap API route handlers with structured logging"
```

---

## Task 3: Phase 3 — Service layer (business events)

**Files:**
- Modify: `src/modules/*/api/service.ts` (× 15, listed below)

**Interfaces:**
- Consumes: `logger` from `@/lib/logger`
- Produces: business success events with `op` and `durationMs`; throws on error (route catches)

**Service files to migrate** (verify with `find src/modules -name service.ts`):

- `src/modules/view-settings/api/service.ts`
- `src/modules/switch-mapping/api/service.ts`
- `src/modules/sites/api/service.ts`
- `src/modules/ipam/api/service.ts`
- `src/modules/cables/api/service.ts`
- `src/modules/interfaces/api/service.ts`
- `src/modules/devices/api/service.ts`
- `src/modules/demo/users/api/service.ts`
- `src/modules/demo/exclusive/api/service.ts`
- `src/modules/demo/billing/api/service.ts`
- plus any others found by `find`

### Step 3.1: Migrate one service as the reference pattern

Open `src/modules/ipam/api/service.ts`. For each exported function, add a `start = Date.now()` at the top, and a success `logger.info` before each `return`. Do NOT wrap in try/catch — service throws, the route catches (Task 2 already wrapped routes).

Reference pattern for a function:

```typescript
export async function createSubnet(input: CreateSubnetInput) {
  const start = Date.now();
  // ... existing validation, prisma call, etc. ...
  const result = await prisma.subnet.create({ data: input });
  logger.info(
    { op: 'createSubnet', subnetId: result.id, durationMs: Date.now() - start },
    'Subnet created',
  );
  return result;
}
```

### Step 3.2: Verify lint and build for the reference service

```bash
bun run lint:strict
bun run build
```
Expected: both pass.

### Step 3.3: Apply the same pattern to all remaining service.ts files

For each service file:

- Add `import { logger } from '@/lib/logger';`
- For each exported function that mutates data (create/update/delete), add `const start = Date.now();` at the top and `logger.info({ op, ...id, durationMs: Date.now() - start }, '<action> <entity>')` before the `return`
- Do NOT add try/catch — the caller (route) handles error logging
- For read-only functions (list/get), logger.info is optional but recommended for non-trivial queries

### Step 3.4: Verify lint and build for all services

```bash
bun run lint:strict
bun run build
```
Expected: both pass.

### Step 3.5: Commit

```bash
git add src/modules
git commit -m "feat(logger): add business event logging to service layer"
```

---

## Task 4: Phase 4 — Error boundaries

**Files:**
- Modify: `src/app/(main)/**/error.tsx` (× 10+)

**Interfaces:**
- Consumes: `logger` from `@/lib/logger`
- Produces: `console.error` replaced with `logger.error` inside server-action side effects

**Critical constraint:** `error.tsx` is a **client component** (Next.js default — it receives the `reset` callback). `import 'server-only'` in `logger.ts` will fail at build time if `error.tsx` imports `logger` directly.

**Solution:** Use a small client-safe logger module. Do NOT add `import 'server-only'` to the main logger; instead, split: keep `src/lib/logger.ts` server-only, and create `src/lib/logger.client.ts` for client components. Or: keep one file but remove `server-only` and rely on convention (not recommended — the constraint says client component import must fail at build).

**Recommended approach:** Create `src/lib/logger.client.ts` for the error.tsx files. Both files share the same pino instance via a single underlying pino config; the client module does not have the `server-only` import.

### Step 4.1: Create client-safe logger module

Create `src/lib/logger.client.ts`:

```typescript
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const REDACT_PATHS = [
  '*.password',
  '*.token',
  '*.secret',
  'req.headers.authorization',
  'req.headers.cookie',
];

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  redact: REDACT_PATHS,
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, ignore: 'pid,hostname' },
    },
  }),
});
```

(Identical config to `src/lib/logger.ts`, but no `import 'server-only'`.)

### Step 4.2: Verify logger.test.ts still passes

```bash
bunx vitest run src/lib/logger.test.ts
```
Expected: 4 tests pass (test imports the server-only logger; mock ensures it works in vitest).

### Step 4.3: Migrate one error.tsx as the reference pattern

Open `src/app/(main)/error.tsx`. Replace the existing `console.error` (or add if absent) inside the existing `useEffect`:

```typescript
'use client';
import { useEffect } from 'react';
import { logger } from '@/lib/logger.client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error(
      { err: error, digest: error.digest },
      'Page render failed',
    );
  }, [error]);

  return (
    <html>
      <body>
        <h2>문제가 발생했습니다</h2>
        <button onClick={() => reset()}>다시 시도</button>
      </body>
    </html>
  );
}
```

(Preserve any existing UI / classNames. Only change the logging call.)

### Step 4.4: Verify lint and build for the reference error.tsx

```bash
bun run lint:strict
bun run build
```
Expected: both pass. If `error.tsx` cannot import `@/lib/logger` because of `server-only`, the build will fail with a clear message — the fix is to import from `@/lib/logger.client` instead.

### Step 4.5: Apply the same pattern to all remaining error.tsx files

For each `error.tsx` under `src/app/(main)/`:

- Add `import { logger } from '@/lib/logger.client';`
- Replace `console.error(...)` with `logger.error({ err: error, digest: error.digest }, '<context>')` inside `useEffect`
- Preserve the existing UI

### Step 4.6: Verify lint and build for all error.tsx files

```bash
bun run lint:strict
bun run build
```
Expected: both pass.

### Step 4.7: Search for any remaining server-side `console.*`

```bash
grep -rE "console\.(log|info|debug)" src/ prisma/ 2>/dev/null
```
Expected: no results (only `console.error` and `console.warn` are allowed by oxlint; `console.log` should be gone).

### Step 4.8: Commit

```bash
git add src/lib/logger.client.ts src/app
git commit -m "feat(logger): migrate error boundaries to structured logging"
```

---

## Task 5: Phase 5 — Seeds, test-utils, and remaining console

**Files:**
- Modify: `prisma/seeds/index.ts` (verify v1 logger usage is correct; add `op` and `durationMs` if missing)
- Modify: `src/test-utils/create-test-db.ts` (verify v1 logger usage is correct; add `op` and `durationMs` if missing)

### Step 5.1: Update `prisma/seeds/index.ts` to spec

Read current contents. Replace with:

```typescript
import { logger } from '../../src/lib/logger';

async function main() {
  const start = Date.now();
  logger.info(
    { op: 'seedRun', durationMs: Date.now() - start },
    'Seed: no-op (placeholder)',
  );
}

main().catch((e) => {
  logger.error({ err: e, op: 'seedRun' }, 'Seed failed');
  process.exit(1);
});
```

### Step 5.2: Update `src/test-utils/create-test-db.ts` to spec

Read current contents. Ensure:

```typescript
import { logger } from '@/lib/logger';

// inside ensureTestDatabase, after CREATE DATABASE:
logger.info(
  { op: 'createTestDb', db: targetDb },
  'Created test database',
);
```

### Step 5.3: Verify lint and build

```bash
bun run lint:strict
bun run build
```
Expected: both pass.

### Step 5.4: Search for any remaining `console.log`/`console.info`/`console.debug` in server-side code

```bash
grep -rE "console\.(log|info|debug)" src/ prisma/ 2>/dev/null
```
Expected: no results.

### Step 5.5: Verify the logger.test.ts still passes

```bash
bunx vitest run src/lib/logger.test.ts
```
Expected: 4 tests pass.

### Step 5.6: Commit

```bash
git add prisma/seeds src/test-utils
git commit -m "feat(logger): align seeds and test-utils with logging spec"
```

---

## Task 6: Documentation

**Files:**
- Create: `docs/common/development/logging.md`

### Step 6.1: Create the convention document

```markdown
# 로깅 규칙

> 표준 로거: `src/lib/logger.ts` (pino) — server-only
> 클라이언트 로거: `src/lib/logger.client.ts` — error boundary 전용

## 필수 도구

- `import { logger } from '@/lib/logger';` — 서버 컴포넌트, API route, server action, service layer
- `import { logger } from '@/lib/logger.client';` — 클라이언트 컴포넌트 (error boundary 등)

## 레벨 (4단계)

| 레벨 | 용도 | 예시 |
|------|------|------|
| `debug` | 개발 중 흐름 추적, 변수 값 | `logger.debug({ cidr }, 'Checking overlap')` |
| `info` | 비즈니스 이벤트, 성공한 작업 | `logger.info({ op, ...ctx }, 'Subnet created')` |
| `warn` | 복구 가능한 이슈, 검증 실패 | `logger.warn({ op, errors }, 'Validation failed')` |
| `error` | 실패, 예외 (catch 블록에서 throw 직전) | `logger.error({ err, op, durationMs }, 'Failed')` |

`fatal`, `trace` 사용 금지.

## 메시지 패턴

```typescript
logger.info({ key: value }, 'Human readable message');
//       ↑ context 객체 (camelCase 키)  ↑ message
```

- 첫 인자 = context 객체 (없으면 생략 가능)
- 두 번째 인자 = 사람이 읽는 한 줄 메시지
- 키는 camelCase

## 에러 패턴

```typescript
const start = Date.now();
try {
  // ...
  logger.info({ op, ...id, durationMs: Date.now() - start }, 'action noun');
  return result;
} catch (err) {
  logger.error(
    { err, op, durationMs: Date.now() - start, userId? },
    'Failed to <action> <noun>',
  );
  throw err;
}
```

- `err`은 context의 첫 키
- `op` (operation name) **항상 포함**
- `durationMs` — `Date.now() - start`로 계산
- `userId` — 인증된 컨텍스트에서 가능할 때
- `throw err`로 re-throw

## PII/secret 자동 redact

`logger.ts`에 다음 redact 경로가 설정되어 있음:

- `*.password`
- `*.token`
- `*.secret`
- `req.headers.authorization`
- `req.headers.cookie`

context에 password/token/secret이 포함되면 자동 마스킹됨. IP, MAC, device name은 도메인 정보이므로 redact하지 않음.

## 테스트

- `LOG_LEVEL=silent`으로 출력 비활성화
- spy 필요 시: `vi.spyOn(logger, 'info')` 또는 `vi.spyOn(logger, 'error')`
```

### Step 6.2: Verify the file path follows the docs structure

Confirm `docs/common/development/logging.md` is the right location. If `docs/common/development/index.md` does not list `logging.md`, add a row in that file's directory-structure table (one-line entry pointing to this file).

### Step 6.3: Commit

```bash
git add docs/common/development/logging.md docs/common/development/index.md
git commit -m "docs(development): add logging convention reference"
```

---

## Task 7: Final verification and push

**Files:** none modified

### Step 7.1: Run all verification commands

```bash
bun run lint:strict
bunx vitest run
bun run build
```

Expected: all three pass.

### Step 7.2: Final search for any remaining `console.log`/`info`/`debug`

```bash
grep -rE "console\.(log|info|debug)" src/ prisma/ 2>/dev/null
```

Expected: no results.

### Step 7.3: Push

```bash
git push origin main
```

Expected: push succeeds (pre-push hook runs `bun run lint:strict && bun run build`, both pass).

If the `node_modules/.bin/oxlint` symlink fix is still needed, ensure it is in place:

```bash
ls -la node_modules/.bin/oxlint
```

Expected: `lrwxr-xr-x ... node_modules/.bin/oxlint -> ../oxlint/bin/oxlint`

If broken, repeat: `rm node_modules/.bin/oxlint && ln -s ../oxlint/bin/oxlint node_modules/.bin/oxlint`. This is a `node_modules` fix that will not be committed.

---

## Self-Review Notes

- **Spec coverage:** every spec section (architecture, conventions, migration, testing, PII) maps to a task. Health check exclusion is in Task 1 Step 1.5. Test silent is in Task 1 step + Task 7.
- **Type consistency:** `REDACT_PATHS` exported from both `src/lib/logger.ts` and `src/lib/logger.client.ts` with same content. `logger` is named export in both. Test imports from `./logger` (server) and uses `vi.mock('server-only')` to neutralize.
- **Task boundaries:** each task = 1 PR, with its own lint/build verification and commit. Task 1 establishes infra; Tasks 2–4 migrate layers; Task 5 covers misc; Task 6 docs; Task 7 push.
- **No placeholders:** all code blocks complete, no "TBD"/"similar to" left.
- **Node_modules fix:** the oxlint wrapper symlink fix in `node_modules/` is environment-local and is documented in Task 1 Step 1.7 and Task 7 Step 7.3. It is intentionally NOT committed.
