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

> **예외**: 고빈도 scrape endpoint(Prometheus 등)는 `debug` 사용 — [ADR-003](../decisions/adr-003-metrics-endpoint-logger-debug.md) 참조.

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
