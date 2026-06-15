# ADR-001: 테스트 인프라 — Vitest + Playwright + GitLab CI

> 2026-06-15 · 상태: Accepted

## 컨텍스트

SCC 프로젝트는 테스트 코드 0개, `playwright`만 devDependency에 설치된 상태. 데이터 페칭은 Prisma(직접) + `apiClient`(HTTP) 두 경로가 혼재하며, GitLab CI 도입 예정 + 폐쇄망 정책. 모듈은 `src/modules/<name>/api/{types,service,queries,mutations}.ts` 4-레이어.

자동화 테스트 파이프라인 도입을 결정함. **도구 선택 / 격리 전략 / CI 구조**는 향후 모든 테스트 작성의 토대가 되므로 ADR로 기록.

## 결정

### 1. 프레임워크 3계층

- **단위**: Vitest + `vi.mock()` (Prisma 또는 apiClient)
- **통합**: Vitest + RTL + MSW + 실 Postgres (docker-compose / GitLab services)
- **E2E**: Playwright (`@playwright/test`), Chromium only

Jest / Mocha / Cypress 신규 도입 금지. 자세한 모듈별 mock 전략은 [`docs/common/development/testing.md`](../development/testing.md) 참조.

### 2. 통합 테스트 격리 = truncate + seed

- `scripts/test-seed.ts` (scc_test) / `scripts/e2e-seed.ts` (scc_e2e) — 매 테스트 전 `TRUNCATE ... CASCADE` + 시드
- `src/test-utils/create-test-db.ts`의 `ensureTestDatabase()` — DB 없으면 자동 생성
- **트랜잭션-롤백 채택 안 함** — Prisma `$transaction` 호출이 코드 내부에 있으면 중첩 트랜잭션이 발생해 Prisma가 미지원. truncate+seed는 안전하지만 약간 느림

### 3. CI 러너 이미지 = 자체 빌드

- 베이스: `oven/bun:1.2.10-debian` + `playwright install --with-deps chromium`
- 정의: `Dockerfile.ci-runner`
- 사내 레지스트리(`registry.scc.local/ci-runner:<tag>`)에 빌드/푸시 후 `.gitlab-ci.yml`이 그 태그 참조
- `psql`은 의도적 제외 — CI는 Prisma로만 DB 접근. 통합/E2E 잡은 GitLab 표준 `services:` Postgres 사용
- 자세한 빌드/푸시 절차: [`docs/common/operations/build-deploy.md`](../operations/build-deploy.md) § CI 러너 이미지

### 4. 브랜치별 CI 게이트

`feature → develop → staging → main` (Git Flow).

| 잡 | feature | develop | staging | main |
|----|---------|---------|---------|------|
| lint, type-check, unit | ✅ | ✅ | ✅ | ✅ |
| integration, build | ❌ | ✅ | ✅ | ✅ |
| e2e | ❌ | ❌ | ❌ | ✅ |

- E2E는 main에서만 — 비용 대비 효과. develop/staging은 unit + integration으로 커버
- 캐시: `node_modules/.cache`, `.bun/cache` (key: `${CI_COMMIT_REF_SLUG}`)

### 5. Playwright 패키지 = `@playwright/test`

`playwright`(lib)는 `@playwright/test`(테스트 러너)로 교체. 두 패키지 중복 + 테스트 러너는 `@playwright/test`만 제공.

## 고려한 대안

- **Vitest 단독 (E2E 없음)**: 사용자 플로우 회귀 검증 불가. 기각.
- **Playwright Test (Vitest 없음)**: 모듈 단위 테스트에 과함. 격리 어려움. 기각.
- **Testcontainers (테스트마다 DB 컨테이너)**: 격리 완벽하나 폐쇄망 + 외부 이미지 pull 문제로 기각.
- **트랜잭션-롤백 격리**: 빠르나 Prisma `$transaction` 중첩 미지원. 기각.
- **MSW vs vi.mock** — 둘 다 채택. 모듈 데이터 접근 방식에 따라 분기 (testing.md § Mocking 규칙 참조).

## 결과

- 단위 9 테스트 케이스 추가 (formatBytes 5 + getMergedViewSettings 2 + createPrefix 2)
- E2E 2 시나리오 추가 (메인 페이지 로드, 뷰 셀렉터)
- 커버리지 임계값: vitest 전역 80% (vitest는 디렉터리별 임계값 미지원, 80% 통일 + PR 리뷰에서 정성 확인)
- `bun test:unit` 9/9 통과, `bun tsc --noEmit` 클린

## 후속 작업

- Prisma 스키마에 `Site`/`Subnet`/`IpAddress`/`Device` 모델 추가 + 마이그레이션 → seed 스크립트의 `@ts-expect-error` 제거
- staging DB가 production-like 해지면 e2e를 staging에서도 발화 검토
- 사내 레지스트리에 `Dockerfile.ci-runner` 빌드/푸시 → `.gitlab-ci.yml`의 `image:` 실제 태그로 교체
