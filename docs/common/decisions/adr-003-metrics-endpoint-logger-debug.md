# ADR-003: Metrics endpoint는 logger.debug로 로그 홍수 방지

- **날짜**: 2026-06-20
- **상태**: 승인
- **맥락**: Prometheus가 `/metrics`를 15~30초마다 스크랩. `logger.info` 사용 시 하루 3,000~6,000개의 빈 200 응답 로그가 쌓여 제로 비즈니스 가치의 로그 홍수 발생. 엔드포인트는 빈 200을 반환하며 유일한 신호는 에러.

## 결정

`src/app/metrics/route.ts`의 성공 경로는 `logger.debug`를 사용한다. 실패 경로는 `logger.error`를 유지한다.

```typescript
// 성공 경로 — debug (스크랩마다 info 불필요)
logger.debug({ durationMs }, 'Metrics collected');
// 실패 경로 — error (운영자가 알아야 함)
logger.error({ err, durationMs }, 'Failed to collect metrics');
```

### 고려한 대안

- **`logger.info` 유지** — Prometheus 스크랩 빈도(15~30초)를 고려할 때 하루 수천 줄의 무의미한 로그. 거부.
- **로깅 생략** — 추후 디버깅이 필요한 경우 신호 손실. 거부. debug 레벨이 필요한 경우 조정 가능.
- **로그 샘플링** — 추가 복잡성 도입. 단순한 debug 레벨로 해결 가능. 거부.

## 결과

- **긍정**: 로그 볼륨이 관리 가능하게 유지됨. 운영자는 여전히 에러를 볼 수 있음.
- **부정**: 기본 `LOG_LEVEL=info`(프로덕션)에서는 성공 이벤트가 조용함. 개발자는 `LOG_LEVEL=debug`로 설정해야 확인 가능.

## 이 패턴을 적용해야 하는 경우

모니터링 도구(Prometheus, Grafana 에이전트 등)가 자주 스크랩하는 엔드포인트나, 신호 대비 빈도가 낮은(high-frequency, low-signal) 모든 엔드포인트에 적용.

기본값은 일반 비즈니스 이벤트에 `info`를 사용하고, `debug`는 정당한 사유가 있을 때만 사용한다.

## 관련 문서

- [src/app/metrics/route.ts](../../../src/app/metrics/route.ts) — 적용 대상
- [logging.md](../../development/logging.md) — 로깅 규칙 (§ 레벨)
- [ADR-001](./adr-001-test-infra.md), [ADR-002](./adr-002-prisma-schema-architecture.md) — 이전 ADR
