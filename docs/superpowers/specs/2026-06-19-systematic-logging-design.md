# 체계적 로깅 환경 구축

- **날짜**: 2026-06-19 (revised after SRE + Code Reviewer review)
- **상태**: Revised (검토 대기)
- **대상**: `src/`, `prisma/seeds/`, `docs/common/development/`
- **트리거**: `git push` 시 pre-push hook (`bun run lint:strict`)에서 `no-console` 규칙 위반 2건 발견

## Revision History

- **v1 (초안)**: ALS + `mixin`으로 requestId 자동 전파, 4단계 레벨, 5단계 PR 마이그레이션
- **v2 (revised)**: SRE + Code Reviewer 검증 후 다음 변경
  - **ALS 제거**: Next.js 16 middleware는 Edge Runtime 기본 → `node:async_hooks` 사용 불가. ALS는 per-isolate이므로 middleware→handler 컨텍스트가 production에서 단절
  - **requestId 제거**: ALS 없이 명시적 propagation은 보일러플레이트 발생 → 단순 logger로 시작, 향후 필요해지면 `headers()` 기반 추가
  - **PII redact 추가**: password, token, secret, authorization, cookie 마스킹
  - **마이그레이션 순서 변경**: route.ts 먼저 (Phase 2), service.ts는 그 후 (Phase 3) → 중간 상태 double logging 방지
  - **에러 컨텍스트 강화**: `op`, `durationMs`, `userId` 가이드 추가
  - **health check 제외**: middleware matcher에서 `/api/health` 제외 → stdout 폭주 방지

## 배경 및 동기

현재 코드베이스에 일관된 로깅 컨벤션이 없음:

- `src/test-utils/create-test-db.ts`, `prisma/seeds/index.ts`에서 raw `console.log` 사용
- `src/app/(main)/**/error.tsx` (10+ 파일)에서 `console.error` 사용
- server-side 코드가 자체적으로 `console.*` 호출
- PII/secret 로그 노출 위험 (IP, MAC, device name 외에 향후 password/token 추가 시)

`pre-push` hook의 `--deny-warnings`로 인해 `console.log`가 그대로 push를 막는 상황. 단순 우회(`oxlint-disable`)는 근본 원인을 남기므로, 로깅 인프라를 체계적으로 설계한다.

## 목표

1. 일관된 로깅 컨벤션 확립 (레벨, 메시지 패턴, 에러 처리)
2. PII/secret 자동 redact (password, token, secret, authorization, cookie)
3. `no-console` lint 정책 준수
4. server-side 전체 마이그레이션: `console.*` → `logger`
5. 향후 신규 코드도 같은 컨벤션을 따를 수 있도록 문서화

## 비목표

- 요청별 자동 requestId/traceId — ALS 작동 불가 (production), 명시적 propagation 보일러플레이트 큼. 향후 별도 spec
- IP/MAC 자동 redact — DCIM 도메인 정보 가치 큼. code review로 민감 정보 노출 방지
- 외부 로깅 시스템 통합 (Fluentd, Sentry) — 폐쇄망 운영
- Log rotation, sampling, rate-limit — 현재 미적용, 향후 추가
- 분산 추적 (OpenTelemetry)
- Background jobs / cron logging (현재 없음)
- health check endpoint logging (matcher 제외로 처리)

## 아키텍처

### 컴포넌트

| 위치 | 역할 |
|------|------|
| `src/lib/logger.ts` | `pino` 인스턴스. PII redact, dev/prod 분기 (pino-pretty vs JSON) |
| `src/middleware.ts` | health check 제외 matcher. logger와 무관 |
| `docs/common/development/logging.md` | 컨벤션 문서 |

### 데이터 흐름

```
[Client Request]
   ↓
[Next.js routing]  (middleware: health check 제외만)
   ↓
[Route Handler]  →  logger.info({ op, ...ctx }, 'message')
   ↓
[Service Layer]   →  logger.error({ err, op, durationMs, userId }, 'message')
   ↓
[stdout]          →  [Docker logs]
```

(요청별 자동 correlation 없음. v1에서 시도했으나 production ALS 작동 불가로 폐기.)

## 컨벤션

### 레벨 (4단계)

| 레벨 | 용도 | 예시 |
|------|------|------|
| `debug` | 개발 중 흐름 추적, 변수 값 | `logger.debug({ cidr }, 'Checking overlap')` |
| `info` | 비즈니스 이벤트, 성공한 작업 | `logger.info({ op: 'createSubnet', subnetId }, 'Subnet created')` |
| `warn` | 복구 가능한 이슈, 검증 실패 | `logger.warn({ op: 'validate', errors }, 'Validation failed')` |
| `error` | 실패, 예외 (catch 블록에서 throw 직전) | `logger.error({ err, op, durationMs, userId }, 'Failed to create')` |

- dev: `LOG_LEVEL=debug` (기본)
- prod: `LOG_LEVEL=info` (기본)
- 환경변수 `LOG_LEVEL`로 override

### 메시지 패턴

```typescript
logger.info({ key: value }, 'Human readable message');
//       ↑ context 객체 (camelCase 키)  ↑ message
```

- 첫 인자는 항상 context 객체 (없으면 생략 가능)
- 키는 camelCase
- 메시지는 사람이 읽기 좋은 영문/한국어 한 줄

### 에러 패턴 (강화됨)

```typescript
const start = Date.now();
try {
  // ...
  logger.info({ op: 'createSubnet', subnetId: result.id, durationMs: Date.now() - start }, 'Subnet created');
  return result;
} catch (err) {
  logger.error(
    { err, op: 'createSubnet', durationMs: Date.now() - start, userId },
    'Failed to create subnet'
  );
  throw err;  // re-throw
}
```

- `err`은 context의 첫 키
- `op` (operation name) **항상 포함** — 로그 grep의 anchor
- `durationMs` — `Date.now() - start`로 계산, info/error 양쪽에
- `userId` — 인증된 컨텍스트에서 사용 가능할 때 포함, 없으면 생략
- `throw err`로 re-throw (호출자가 처리)

### PII/secret 자동 redact

`src/lib/logger.ts`의 pino `redact` 설정:

```typescript
redact: [
  '*.password',
  '*.token',
  '*.secret',
  'req.headers.authorization',
  'req.headers.cookie',
],
```

→ IP, MAC, device name은 redact하지 않음 (DCIM 도메인 정보). password/token/secret이 context에 포함되면 자동 마스킹.

## 마이그레이션 계획 (5단계, PR 단위)

| Phase | 대상 | 변경량 | 위험도 | 검증 |
|-------|------|--------|--------|------|
| 1 | `src/lib/logger.ts` + `src/middleware.ts` (health check 제외) | 신규 (~30줄) | 낮음 | `lint:strict`, `build`, redact 동작 테스트 |
| 2 | `src/app/api/**/route.ts` × 10+ | 각 5–10줄 | 중간 (try/catch 표준) | `lint:strict`, `build`, curl로 API 호출 |
| 3 | `src/modules/*/api/service.ts` × 15 | 각 3–5줄 | 낮음 (route가 표준화, service는 단순) | `lint:strict`, `build`, 단위 테스트 |
| 4 | `src/app/(main)/**/error.tsx` × 10+ | 각 3줄 | 낮음 (`console.error` → `logger.error`) | `lint:strict`, `build` |
| 5 | `prisma/seeds/`, `src/test-utils/` | 소량 | 낮음 | `lint:strict`, `prisma db seed` 실행 |

각 Phase = 1 PR. **Phase 1 머지 후 Phase 2 진행.** Phase 2 (route)가 표준을 잡은 후 Phase 3 (service)는 일관된 패턴을 따름.

### Phase 1 상세

**`src/lib/logger.ts`**:
```typescript
import 'server-only';
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  redact: [
    '*.password',
    '*.token',
    '*.secret',
    'req.headers.authorization',
    'req.headers.cookie',
  ],
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, ignore: 'pid,hostname' },
    },
  }),
});
```

**`src/middleware.ts`** (health check 제외):
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

(`logger` import 없음. health check는 matcher에서 제외되어 logger 호출 없음.)

### Phase 2 패턴 (route.ts)

```typescript
// src/app/api/ipam/subnets/route.ts
import { logger } from '@/lib/logger';
import { getSubnets } from '@/modules/ipam/api/service';

export async function GET(request: Request) {
  const start = Date.now();
  try {
    const subnets = await getSubnets();
    logger.info(
      { op: 'listSubnets', count: subnets.length, durationMs: Date.now() - start },
      'Listed subnets'
    );
    return Response.json(subnets);
  } catch (err) {
    logger.error(
      { err, op: 'listSubnets', durationMs: Date.now() - start, url: request.url },
      'Failed to list subnets'
    );
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Phase 3 패턴 (service.ts)

```typescript
// service는 route가 표준화한 후 logger 직접 호출 불필요.
// throw만 하고 route가 잡아서 logger.error 호출.
// 단, service 내부 비즈니스 이벤트(info)는 직접 호출 가능.

import { logger } from '@/lib/logger';

export async function createSubnet(input: CreateSubnetInput) {
  // 검증
  if (!isValidCidr(input.cidr)) {
    throw new ValidationError('Invalid CIDR');  // route가 catch
  }
  
  const start = Date.now();
  const result = await prisma.subnet.create({ data: input });
  logger.info(
    { op: 'createSubnet', subnetId: result.id, durationMs: Date.now() - start },
    'Subnet created'
  );
  return result;
}
```

(에러 로깅은 route가 담당 — service는 throw만. service 내부 비즈니스 성공은 info로.)

## 테스트 컨벤션

- 테스트 환경: `LOG_LEVEL=silent` (출력 없음)
- spy가 필요한 경우: `vi.spyOn(logger, 'info')` 또는 `vi.spyOn(logger, 'error')`
- Phase 1에서 redact 동작 테스트 추가 (password가 마스킹되는지 검증)

## 위험

1. **마이그레이션 윈도우**: Phase 4 (error.tsx) 완료까지 `console.*` 잔존. Phase 1에서 oxlint 설정 업데이트 → Phase 4까지 lint 통과 못함. **허용** (마이그레이션 자체가 lint error 수정을 위해 진행).
2. **PII redact 누락 가능**: 새 필드 타입 추가 시 redact 목록 업데이트 필요. code review로 커버.
3. **log volume 폭주**: 현재 보호 없음 (health check 제외만). 향후 sampling/rate-limit 별도 spec.
4. **Background jobs 추가 시**: logger 패턴은 동일, `op` 필수.

## 성공 기준

- Phase 5 완료 시점: 코드베이스에서 server-side `console.*` 0건
- `docs/common/development/logging.md` 존재, 신규 코드가 컨벤션 따름
- `bun run lint:strict` 통과 유지
- `git push` 정상 동작
- PII redact가 실제로 마스킹 동작 (Phase 1에서 단위 테스트로 검증)

## 대안 검토 (v1 → v2 변경 사유)

| 옵션 | 폐기 사유 |
|------|-----------|
| **ALS + requestId 자동 전파** | Next.js 16 Edge Runtime에서 `node:async_hooks` 사용 불가, ALS는 per-isolate이라 production middleware→handler 컨텍스트 단절 |
| **명시적 propagation (headers + child)** | ALS보다 안정적이지만 service.ts마다 보일러플레이트. 사용자가 "단순 logger" 선택 |
| **PII 광범위 redact (IP/MAC 포함)** | DCIM 도메인 정보 가치 큼. code review로 커버 |
| **5 phase를 1 PR로** | PR 큼, 리뷰 어려움 |
| **route 먼저 vs service 먼저** | service 먼저 시 route 마이그레이션 중 double logging. route 먼저로 변경 |
