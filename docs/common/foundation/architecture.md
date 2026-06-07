# 아키텍처

## 모듈 기반 구조

- 공통 UI → `src/components/`
- 도메인 데이터 + UI → `src/modules/<name>/`
- → component-patterns.md

## 뷰 시스템

- `src/config/views.ts`에 뷰 등록 (id, label, icon, navItems)
- 라우트 그룹: `src/app/(main)/<view-id>/page.tsx`
- 현재 뷰: `home`, `dcim` (제품), `demo` (데모), `settings`, `api-reference`

## 데모/제품 경계

- 제품: `src/modules/<name>/` + Prisma + apiClient + API 라우트
- 데모: `src/modules/demo/<name>/` + 인메모리 mock 데이터
- 제품 코드는 `@/modules/demo/*`에서 절대 임포트 금지
- 경계 검사: `bash scripts/check-demo-imports.sh`

## 컴포넌트 배치

- `src/components/` → 순수 UI, 도메인 타입 의존성 없음
- `src/modules/<name>/components/` → 도메인 타입에 의존
- 상세 기준: `docs/common/development/component-patterns.md`
