# 테스팅 규칙

<!-- 관련 Skills: playwright-best-practices (E2E 패턴, selectors, fixtures)
     이 문서는 프로젝트 테스트 규칙(프레임워크 선택, 컨벤션, TDD 기대)만 기술합니다.
     일반 TDD 방법론은 유저 레벨 자유. -->

> **현 상태 (2026-06-15):** Vitest + Playwright 인프라 셋업 완료. 단위/통합/E2E 3계층 동작.
> 결정 이력: [`docs/common/decisions/adr-001-test-infra.md`](../decisions/adr-001-test-infra.md)

## 프레임워크 (필수)

| 계층 | 도구 | 용도 |
|------|------|------|
| 단위 | Vitest | 순수 함수, hook, 유틸 |
| 통합 | Vitest + Testing Library | 컴포넌트, 모듈 통합 |
| E2E | Playwright | 사용자 플로우, 크로스 브라우저 |

- Jest, Mocha, Cypress 신규 도입 금지
- React Testing Library는 컴포넌트 테스트 시 Vitest와 함께 사용

## 파일 컨벤션 (필수)

- 단위/통합: `*.test.ts(x)` 또는 `*.spec.ts(x)` — 모듈별로 통일
- E2E: `e2e/*.spec.ts` (Playwright 기본)
- 디렉터리: 모듈 내 co-location 권장 (`<module>/__tests__/`) 또는 src 최상위 `__tests__/`

```
src/modules/ipam/
├── service.ts
├── service.test.ts        # 같은 디렉터리
└── components/
    └── subnet-form.tsx
    └── subnet-form.test.tsx
```

## TDD 기대 (soft enforcement)

- 새 기능/버그 수정 시 테스트 선행 권장
- PR에서 미준수 시 **코드 리뷰 단계에서 코멘트** (도구 강제 없음)
- 핵심 비즈니스 로직(`api/`, `lib/`)은 PR 머지를 위해 테스트 필수
- UI 컴포넌트는 권장 (선택)

## 커버리지 기준

| 영역 | 의무 여부 | 기준 |
|------|----------|------|
| `src/lib/` (유틸) | 필수 | 라인 80% 이상 |
| `src/modules/<name>/api/` (service, queries) | 필수 | 라인 70% 이상 |
| `src/modules/<name>/hooks/` | 권장 | 정성적 검토 |
| `src/components/ui/` (shadcn) | 면제 | shadcn이 보장 |
| `src/components/`, `src/modules/<name>/components/` (도메인) | 권장 | 정성적 검토 |

- `vitest run --coverage`로 측정 (테스트 인프라 셋업 후)
- PR에 커버리지 리포트 첨부 권장

## Mocking 규칙

- 네트워크 mocking: MSW (Mock Service Worker) — `src/mocks/` 디렉터리
- 모듈 mocking: `vi.mock()` (Vitest)
- Prisma mocking: `vi.mock('@/lib/prisma')` 또는 통합 테스트 시 test DB
- 실 DB/외부 API 호출은 통합/E2E 테스트에서만

### 모듈별 mock 전략 (필수)

데이터 접근 방식에 따라 mock 대상이 다름. 모듈 작성 시 본인이 속한 케이스를 식별하고 맞는 패턴 적용:

| 모듈 유형 | 예시 | mock 대상 | 이유 |
|----------|------|----------|------|
| Prisma 직접 호출 | `view-settings/api/*`, `demo/*/api/service.ts` | `vi.mock('@/lib/prisma')` | SQL 자체 검증 불필요, 비즈니스 로직에 집중 |
| `apiClient` 호출 (HTTP) | `ipam/api/service.ts`, `cables/api/service.ts` | `vi.mock('@/lib/api-client')` | HTTP 호출을 가짜로 대체, 응답 매핑 검증 |
| 순수 유틸 | `src/lib/utils.ts` (`formatBytes`, `cn`) | mock 불필요 | I/O 없음, 직접 호출·검증 |

### Mock 작성 원칙

- **비즈니스 로직에 집중** — SQL/HTTP 자체는 통합 테스트에서 검증, 단위 테스트는 분기/검증/부수효과 순서 확인
- **타입 정확히** — `as any` 사용 금지 (oxlint 정책). Prisma 모델은 `@prisma/client`의 타입을 import해서 사용
- **호출 인자 검증** — URL, method, body를 `expect().toHaveBeenCalledWith(...)` 또는 `mock.calls[0]` 디스트럭처링으로 확인
- **테스트 간 격리** — `beforeEach(() => vi.clearAllMocks())` 기본

## 통합 테스트 격리

- `scc_test` DB는 `scripts/test-seed.ts`로 truncate + seed
- `scc_e2e` DB는 `scripts/e2e-seed.ts`로 truncate + seed
- DB 자동 생성: `src/test-utils/create-test-db.ts`의 `ensureTestDatabase()`
- 트랜잭션-롤백 방식 채택 안 함 (Prisma `$transaction` 중첩 회피)

## E2E 작성 패턴

Skills `playwright-best-practices` 참조. 프로젝트 규칙:

- 페이지 객체 패턴 (POM) 사용: `e2e/pages/<view>.ts`
- 픽스처: `e2e/fixtures/` (인증된 사용자, 시드 데이터 등)
- 직렬화(`workers: 1`) 기본 — 병렬은 분리 후 단계적 적용
- CI 환경 변수: `BASE_URL` (Playwright 설정에서 사용)

## GitLab CI

- 6개 잡: `lint`, `type-check`, `unit`, `integration`, `build`, `e2e`
- 단일 CI 러너 이미지: `registry.scc.local/ci-runner:1.0.0` (정의: `Dockerfile.ci-runner`)
- 브랜치별 발화:

| 잡 | feature | develop | staging | main |
|----|---------|---------|---------|------|
| lint, type-check, unit | ✅ | ✅ | ✅ | ✅ |
| integration, build | ❌ | ✅ | ✅ | ✅ |
| e2e | ❌ | ❌ | ❌ | ✅ |

- 통합/E2E 잡의 `services:`는 GitLab CI 표준 Postgres 서비스 사용
- 커버리지는 unit 잡에서 측정, MR에 리포트 첨부
- 캐시: `node_modules/.cache`, `.bun/cache` (key: `${CI_COMMIT_REF_SLUG}`)

## 새 프레임워크 도입

신규 테스트 도구 도입 시 PR에 `왜 Vitest/Playwright로 부족한지` 명시 + 이 문서 갱신.

## 참고

- 일반 TDD 워크플로우(red-green-refactor)는 superpowers `test-driven-development` Skill 참조 (유저 레벨)
- 검증 습관: superpowers `verification-before-completion` Skill 참조 (유저 레벨)
