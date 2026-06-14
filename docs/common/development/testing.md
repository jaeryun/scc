# 테스팅 규칙

<!-- 관련 Skills: playwright-best-practices (E2E 패턴, selectors, fixtures)
     이 문서는 프로젝트 테스트 규칙(프레임워크 선택, 컨벤션, TDD 기대)만 기술합니다.
     일반 TDD 방법론은 유저 레벨 자유. -->

> **현 상태 (2026-06-14):** Playwright는 설치되어 있으나 실제 테스트 코드는 작성되지 않음.
> 이 문서는 앞으로의 테스트 작성 규칙을 정의한다.

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

## E2E 작성 패턴

Skills `playwright-best-practices` 참조. 프로젝트 규칙:

- 페이지 객체 패턴 (POM) 사용: `e2e/pages/<view>.ts`
- 픽스처: `e2e/fixtures/` (인증된 사용자, 시드 데이터 등)
- 직렬화(`workers: 1`) 기본 — 병렬은 분리 후 단계적 적용
- CI 환경 변수: `BASE_URL` (Playwright 설정에서 사용)

## 새 프레임워크 도입

신규 테스트 도구 도입 시 PR에 `왜 Vitest/Playwright로 부족한지` 명시 + 이 문서 갱신.

## 참고

- 일반 TDD 워크플로우(red-green-refactor)는 superpowers `test-driven-development` Skill 참조 (유저 레벨)
- 검증 습관: superpowers `verification-before-completion` Skill 참조 (유저 레벨)
