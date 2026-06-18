# 테스트 준비도 평가 (Living Doc)

> SCC 프로젝트의 테스트 4계층(Static / Unit / Integration / E2E) 준비도를 주기적으로 점검하는 살아있는 문서.
> 규칙 자체는 [testing.md](./testing.md) 참조. 이 문서는 **현재 상태의 스냅샷 + 다음 단계**를 다룬다.

---

## 0. 현재 단계와 목표

> **현 단계: 기반 구축 단계 (Foundation Phase)**

테스트 평가는 *성숙한 스위트* 기준이 아니라 **현재 단계의 목표**로 한다.

**현재 목표:**

1. **테스트 기반 체계 구현** — 도구 선택, 설정, CI, 격리, 문서
2. **각 계층의 대표 example 1개** — Static / Unit / Integration / E2E 각 계층에 최소 1개의 작동하는 example

**왜 "기반 구축 단계"인가:**

- 평가 점수(테스트 개수)가 낮은 건 *부채*가 아니라 *현재 단계*의 자연스러운 상태다.
- 성숙한 스위트 기준(예: 핵심 비즈니스 로직 80% 커버리지)을 이 단계에 적용하면 형식적 테스트를 양산한다.
- 기반이 먼저, 적용은 그 다음.

---

## 1. 평가 프레임워크

### 1.1 4계층 모델

| 계층 | 목적 | 도구 | 검증 범위 |
|------|------|------|----------|
| **Static** | 실행 전 문법/타입/스타일 오류 차단 | TypeScript, ESLint 계열, 포매터 | 코드 자체 |
| **Unit** | 개별 함수/훅/컴포넌트의 의도된 동작 | Vitest, React Testing Library | 고립된 조각 |
| **Integration** | 여러 단위의 상호작용, 페이지/모듈 레벨 검증 | Vitest + RTL + MSW, 테스트 DB | 컴포넌트 간 경계 |
| **E2E** | 실제 브라우저에서 사용자 플로우 종단 검증 | Playwright | 시스템 전체 |

### 1.2 E2E 외부 연동 처리 전략 (준비된/예정된 정책)

외부 서비스(인증/세금/PG 등) 연동 시 테스트 속도 저하 및 깨짐 방지:

- **통제 가능한 범위만 테스트** — 외부 시스템이 변경되어도 우리 코드가 견디는지 검증
- **브라우저 레벨 호출** → `page.route()` 로 네트워크 응답을 가로채고 고정 응답 반환
- **서버/BFF 레벨 호출** → E2E 전용 환경변수로 외부 API 분기, 고정 응답 반환

> 현재 SCC는 외부 연동 없음(`.env.example`에 SSO 자리만 표시). 정책은 향후 인증/외부 API 도입 시 적용.

### 1.3 핵심 원칙 — 확신(Confidence) 우선

**"이 테스트는 배포 시 충분한 확신을 주는가?"**

4계층의 *진짜* 판단 기준은 비율이 아니라 확신이다. Testing Trophy의 "Mostly"는 *방향성*이지 정량 목표가 아니다.

- **모듈 역할별 유연성** — 파서/유틸리티는 unit이 90%+ 차지하는 게 맞다. AI 에이전트 오케스트레이션은 integration이 압도적으로 중요하다. 일률 비율은 이 유연성을 파괴한다.
- **Goodhart's Law 회피** — 비율이 목표가 되는 순간 형식적 테스트가 양산된다. 검증 가치 없는 테스트는 유지보수 비용만 갉아먹는다.

권고 표현 규칙:
- ❌ "integration 테스트가 X% 부족하다"
- ✅ "integration 갭으로 main 머지 확신이 부족하다"

---

## 2. 점수 요약 (현재 단계 목표 대비)

| 계층 | 인프라 | Example 수 | 목표 대비 | 비고 |
|------|------:|--------:|------:|------|
| **(1) Static** | 75/100 | — | **✅ 목표 달성** | oxlint + oxfmt + tsc + CI + husky |
| **(2) Unit** | 80/100 | 3 | **✅ 목표 달성** | formatBytes, createPrefix, getMergedViewSettings (3 패턴) |
| **(3) Integration** | 75/100 | 0 | **❌ Example 미구현** | 인프라는 OK, 다음 단계 |
| **(4) E2E** | 70/100 | 1 | **✅ 목표 달성** | 메인 페이지 스모크 |

**기반 구축 단계 종합: 3/4 계층 목표 달성 (75%)**

> ⚠️ 이 점수는 "기반 구축 단계" 기준이다. 성숙한 스위트 기준으로 평가하면 점수가 낮아진다. 단계가 올라가면 평가 기준도 갱신한다.

---

## 3. 계층별 상세 평가

### 3.1 Static (✅ 목표 달성)

**갖춘 것 (+):**

- 린터: `oxlint` — TypeScript/React/Next.js/import/jsx-a11y 플러그인 활성화
  - 핵심 규칙 error 강제: `no-explicit-any`, `react-hooks/rules-of-hooks`
  - jsx-a11y 규칙 warning
- 포매터: `oxfmt` (single quote, no trailing comma)
- 타입체크: `tsc --noEmit` 별도 CI 잡
- CI: `.gitlab-ci.yml`에 `lint`, `type-check` 잡 분리
- pre-commit: husky + lint-staged (lint + format 자동화)

**부족 (−):**

- pre-commit에 **테스트 실행 없음** → 회귀가 커밋 단계에서 미차단 (기반 구축 단계 범위 밖)
- strict 모드(`lint:strict`)는 정의되어 있으나 CI에서 미사용

### 3.2 Unit (✅ 목표 달성)

**갖춘 것 (+):**

- Vitest 2.1.9 + @testing-library/react 16 + @testing-library/jest-dom + jsdom
- MSW 2.7 — 네트워크 mock 인프라
- `vitest.setup.ts` — cleanup, server.listen, jest-dom matchers
- 커버리지: v8, threshold (lines 80 / functions 80 / branches 75 / statements 80)
- 스크립트: `test`, `test:unit`, `test:integration`, `test:coverage` 분리
- 모듈 mock 전략 문서화: Prisma 직접 호출 / apiClient / 순수 유틸 3가지 ([testing.md:65-71](./testing.md))

**Example 커버리지 (3 examples, 9 tests, 모두 통과):**

| Example | 모듈 패턴 | Mocking |
|---------|----------|---------|
| `formatBytes` | 순수 유틸 (`src/lib/`) | 불필요 |
| `createPrefix` (ipam) | apiClient 호출 (`src/modules/*/api/service.ts`) | `vi.mock('@/lib/api-client')` |
| `getMergedViewSettings` (view-settings) | Prisma 직접 호출 | `vi.mock('@/lib/prisma')` |

→ **3가지 모듈 패턴 모두 example 1개 확보** — 기반 구축 단계 목표 초과 달성.

**현재 통과 상태 (2026-06-17 00:03):**

```
Test Files  3 passed (3)
     Tests  9 passed (9)
  Duration  900ms
```

### 3.3 Integration (❌ Example 미구현)

**갖춘 것 (+):** (인프라는 기반 구축 단계 목표 초과)

- 테스트 DB 자동 생성: `src/test-utils/create-test-db.ts::ensureTestDatabase()`
- 시드 스크립트: `scripts/test-seed.ts` (scc_test), `scripts/e2e-seed.ts` (scc_e2e)
- 픽스처 팩토리: `src/test-utils/factories.ts` (Faker 기반)
- Prisma 테스트 헬퍼: `src/test-utils/prisma-test-db.ts`
- 렌더 헬퍼: `src/test-utils/render.tsx`
- `docker-compose.test.yml` — 격리된 테스트 DB 컨테이너
- CI 잡: `.gitlab-ci.yml` `integration` — `prisma migrate deploy` + seed + `*.integration.test.ts` 실행
- 파일 컨벤션: `*.integration.test.ts` 명시, `test:integration` 스크립트 분리

**다음 단계 (가장 큰 갭):**

- **대표 example 1개 구현** — 기반 구축 단계의 마지막 조각
- 후보:
  - `view-settings` 라우트 핸들러 round-trip (Prisma 통합 검증)
  - IPAM 서브넷 생성 DB 통합
  - Server Action 통합
- DB 자동 생성/시드/마이그레이션이 모두 준비되어 있어 *추가 비용 낮음*

### 3.4 E2E (✅ 목표 달성)

**갖춘 것 (+):**

- Playwright 1.60 — chromium 프로젝트, CI에서 workers 2 / retries 2
- `playwright.config.ts` — `webServer` 자동 기동, `BASE_URL` 환경변수 지원
- CI 잡: `.gitlab-ci.yml` `e2e` — main 브랜치에서만, build + start + Playwright
- 페이지 객체 패턴(POM) 컨벤션 정의: `e2e/pages/<view>.ts`, `e2e/fixtures/`

**Example 커버리지 (1 example, 2 tests):**

- `e2e/example.spec.ts`
  - 메인 페이지 로드 (`/` → 타이틀 검증)
  - 뷰 셀렉터 드롭다운 표시

→ 기반 구축 단계 목표 (스모크 수준 example 1개) 충족.

**다음 단계 (선택):**

- 페이지 객체(`e2e/pages/`) 디렉토리 실구현
- 핵심 워크플로우 example (서브넷 생성, 디바이스 등록)
- 다중 브라우저 (firefox, webkit) — 기반 구축 단계 범위 밖

---

## 4. 다음 단계 (기반 완성)

| 순위 | 작업 | 비고 |
|------|------|------|
| **1** | **Integration 대표 example 1개 구현** | 가장 큰 갭, 기반 완성의 마지막 조각 |
| 2 | (선택) Unit example 추가 | 패턴 다양화 (hooks, Server Actions) |
| 3 | (선택) E2E 핵심 플로우 1개 추가 | 메인 → 서브넷 생성 등 |

기반 완성 후 다음 단계 목표(예: 핵심 비즈니스 플로우 확신 확보)는 본 문서 갱신 시점에 다시 정의한다.

---

## 5. 다음 평가 시 체크리스트

- [ ] `bunx vitest run` 통과 상태 (Test Files / Tests / Duration)
- [ ] `bunx vitest run --coverage` — threshold 통과 + 영역별 비율
- [ ] `bunx playwright test` 통과 상태
- [ ] `*.integration.test.ts` 파일 개수
- [ ] `src/modules/*/api/service.test.ts` 존재 비율
- [ ] `e2e/*.spec.ts` 파일 개수 + 커버 플로우
- [ ] `.gitlab-ci.yml`의 6개 잡 최근 발화 이력 (성공/실패)
- [ ] 현재 단계 목표 갱신 필요 여부 (기반 → 다음 단계로 전환 시점)

---

## 6. 변경 이력

| 날짜 | 변경 | 작성자 |
|------|------|--------|
| 2026-06-17 | 초안 작성 — 인프라 75 / 커버리지 10 / 종합 45 (성숙 스위트 기준) | Claude |
| 2026-06-17 | 평가 기준 재조정: 성숙 스위트 → "기반 구축 단계" 목표 기준 | 사용자 + Claude |
| 2026-06-17 | 비율 명시 철회, "확신 우선" 원칙 채택 (§1.3) | 사용자 + Claude |
| 2026-06-17 | §4 로드맵 재구성: 가성비 순 → "기반 완성" 다음 단계 | Claude |
| 2026-06-17 | Integration을 가장 큰 갭으로 명시 (§3.3) | Claude |
