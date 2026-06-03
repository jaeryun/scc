---
name: scc-develop-guide
description: |
  SCC 프로젝트 개발 가이드 — Next.js 16, shadcn/ui, 뷰 시스템, 모듈 패턴.
  신규 기능 추가, 페이지 생성, 데이터 테이블/폼 작성, 네비게이션 변경, 테마 작업 시 사용.
---

# SCC Development Guide

SE Command Center — Next.js 16 + shadcn/ui 사내 인프라팀 관리 대시보드.

## Quick Reference: What Goes Where

| Task             | Location                                    |
| ---------------- | ------------------------------------------- |
| 신규 Product 모듈 | `src/modules/<name>/api/` → `hooks/` → `components/` |
| 신규 데모 모듈    | `src/modules/demo/<name>/`                  |
| 공통 UI 컴포넌트  | `src/components/ui/`                        |
| 공통 레이아웃     | `src/components/layout/`                    |
| 네비게이션        | `src/config/views.ts` + `nav-config.ts`     |
| 아이콘 등록       | `src/components/icons.tsx`                  |
| Mock 데이터       | `src/constants/mock-api-<name>.ts`          |
| 테마 CSS          | `src/styles/themes/<name>.css`              |
| 테마 등록         | `src/components/themes/theme.config.ts`     |

## 뷰 시스템

- `src/config/views.ts`의 `views` 배열에 뷰 등록 (id, label, icon, navItems)
- 라우트 그룹: `src/app/(main)/<view-id>/page.tsx`
- 현재 뷰: `home`, `dcim` (product), `demo` (데모 쇼케이스), `settings`, `api-reference`
- → [references/view-system-guide.md](references/view-system-guide.md)

## Demo vs Product 경계

- **Product 모듈** (`src/modules/<name>/`): Prisma + apiClient + 실제 API routes
- **Demo 모듈** (`src/modules/demo/<name>/`): in-memory mock 데이터, API routes 없음
- Product 코드는 `@/modules/demo/*` import 금지 (CI 스크립트로 검사)
- 데모 모듈 아키텍처는 유형별로 다름:
  - CRUD: `@/constants/mock-api*.ts` + `api/{types,service,queries,mutations}.ts` + `hooks/`
  - 클라이언트 상태: Zustand store (`utils/store.ts`)
  - 순수 UI: 데이터 레이어 없음
- → [references/demo-product-boundary.md](references/demo-product-boundary.md)

## 모듈 패턴

### CRUD 데모 모듈

`types.ts` → `service.ts` → `queries.ts` → `mutations.ts` → `hooks/` → `components/`

Mock 데이터는 `src/constants/mock-api-<name>.ts`에 faker + match-sorter 패턴으로 정의.

→ [references/crud-module-guide.md](references/crud-module-guide.md)

### Zustand 데모 모듈

클라이언트 상태만 필요한 경우 (chat, kanban, notifications): Zustand store + 컴포넌트.

→ [references/zustand-module-guide.md](references/zustand-module-guide.md)

### Product 모듈

`types.ts` → `service.ts` (apiClient) → `queries.ts` → `mutations.ts` (mutationOptions) → `hooks/` → `components/`

더 자세한 패턴 → `docs/data/cheat-sheet.md`

## 폼

TanStack Form + Zod + `useAppForm` + `useFormFields<T>()`

→ `docs/forms/guide.md`

## 테마

OKLCH 색상 공간, 10개 내장 테마, CSS 변수 기반

→ `docs/themes/guide.md`

## 코딩 컨벤션

→ `docs/core/conventions.md`

## 검증 체크리스트

신규 page.tsx / 기능 추가 시:
- [ ] `export const metadata: Metadata`
- [ ] `cn()`으로 className 병합
- [ ] CSS 변수 토큰 (`text-primary`, `bg-muted/50`) 사용
- [ ] `any` 타입 금지
- [ ] 데이터 계층: `types.ts` → `service.ts` → `queries.ts` 완전 분리
- [ ] `hooks/` 계층 존재 (컴포넌트는 hook 통해서만 데이터 접근)
- [ ] `useMutation({mutationFn: ...})` 인라인 금지 → `api/mutations.ts`에 `mutationOptions`
- [ ] Query Key Factory 사용
- [ ] `bun tsc --noEmit` 통과
- [ ] `bun run build` 성공
