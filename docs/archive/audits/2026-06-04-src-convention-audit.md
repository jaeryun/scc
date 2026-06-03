# src/ 디렉터리 컨벤션 감사 보고서 (v2)

**기준:** `docs/core/conventions.md`, `docs/core/project.md`
**일자:** 2026-06-04
**범위:** `src/` 전체 (modules, components, hooks, types, app)
**이전 감사:** 2026-06-03 → 2026-06-04 변경사항 반영

---

## 이전 감사 대비 개선사항

| 영역 | 이전 상태 | 현재 상태 |
|------|-----------|-----------|
| `library` → `demo` 리네임 | `library/` 라우트 | `demo/` 로 변경, redirect 적용 |
| 데모 모듈 격리 | 12개 모듈이 `src/modules/` 평탄 | 13개 모듈이 `src/modules/demo/` 로 이동 |
| `overview` 모듈 | 별도 모듈 존재 | 삭제됨 |
| `use-*-mutations.ts` 훅 | 7개 모듈에 존재 | 전량 삭제, `api/mutations.ts` + spread 패턴으로 통일 |
| inline `useMutation({mutationFn})` | 다수 존재 | **0건** |
| 하드코딩 query key | 1건 존재 | **0건** |
| 컴포넌트 `api/service.ts` 직접 import | 없음 | **0건** (유지) |
| 신규 production 모듈 | ipam, view-settings 중심 | `cables`, `devices`, `interfaces`, `sites`, `switch-mapping` 추가 |

---

## A. `src/modules/` — 데이터 계층 감사

### 모듈 구조

**Production 모듈 (9개):** `auth`, `cables`, `devices`, `interfaces`, `ipam`, `sites`, `switch-mapping`, `view-settings`, `demo/`

**Demo 서브모듈 (13개, `src/modules/demo/` 하위):** `billing`, `chat`, `dashboard`, `elements`, `exclusive`, `forms`, `kanban`, `notifications`, `products`, `profile`, `react-query-demo`, `users`, `workspaces`

### Production 모듈 점검

| 모듈 | types | service | queries | mutations | hooks | key factory | 비고 |
|------|:-----:|:-------:|:-------:|:---------:|:-----:|:-----------:|------|
| **cables** | Y | Y | Y | Y | Y | `lists` ✓ | 완전 준수 |
| **devices** | Y | Y | Y | Y | Y | `lists` ✓ | 완전 준수 |
| **interfaces** | Y | Y | Y | N/A | Y | `lists` ✓ | read-only |
| **ipam** | Y | Y | Y | Y | Y | `lists` ✓ | 완전 준수 |
| **sites** | Y | Y | Y | N/A | Y | `lists` ✓ | read-only |
| **switch-mapping** | Y | Y | Y | N/A | Y | `byRole` ✓ | read-only |
| **view-settings** | Y | Y | Y | Y | Y | `lists` ✓ | 완전 준수 |
| **auth** | -- | -- | -- | -- | -- | N/A | NextAuth UI, 데이터 페칭 없음 |

### Demo 서브모듈 점검

| 모듈 | types | service | queries | mutations | hooks | key factory | 비고 |
|------|:-----:|:-------:|:-------:|:---------:|:-----:|:-----------:|------|
| **billing** | Y | Y | Y | N/A | Y | `lists` ✓ | read-only |
| **dashboard** | Y | Y | Y | Y | Y | `lists` ✓ | ⚠️ 컴포넌트가 hook 우회 |
| **exclusive** | Y | Y | Y | N/A | Y | `lists` ✓ | read-only |
| **products** | Y | Y | Y | Y | Y | `list` ✗ | legacy 의도적 유지 |
| **react-query-demo** | Y | Y | Y | N/A | Y | `detail` ✓ | read-only |
| **users** | Y | Y | Y | Y | Y | `list` ✗ | legacy 의도적 유지 |
| **workspaces** | Y | Y | Y | Y | Y | `lists` ✓ | ⚠️ 컴포넌트가 hook 우회 |
| **chat** | -- | -- | -- | -- | -- | N/A | Zustand 로컬 상태 |
| **elements** | -- | -- | -- | -- | -- | N/A | 아이콘 쇼케이스 |
| **forms** | -- | -- | -- | -- | -- | N/A | 폼 패턴 데모 |
| **kanban** | -- | -- | -- | -- | -- | N/A | Zustand 로컬 상태 |
| **notifications** | -- | -- | -- | -- | -- | N/A | Zustand 로컬 상태 |
| **profile** | -- | -- | -- | -- | -- | N/A | 정적 프로필 폼 |

### 발견 사항

**1) Hook 우회 (2개 모듈) 🆕**

`demo/workspaces`와 `demo/dashboard`는 `hooks/` 디렉토리와 훅 함수가 존재하지만, 컴포넌트가 훅을 사용하지 않고 `api/queries.ts`에서 `queryOptions`를 직접 import 하여 `useQuery(queryOptions(...))` 형태로 사용:

- `demo/workspaces/components/workspace-view.tsx` — `useWorkspaces()` 대신 `useQuery(workspacesQueryOptions())`
- `demo/workspaces/components/team-view.tsx` — `useWorkspaceById()` / `useTeamMembers()` 대신 `useQuery(workspaceByIdOptions(...))`
- `demo/dashboard/components/dashboard-list.tsx` — `useFolders()` / `useDashboards()` 대신 `useQuery(...)`
- `demo/dashboard/components/dashboard-canvas.tsx` — `useDashboardDetail()` 대신 `useQuery(...)`

**2) `view-settings/api/get-view-settings-handler.ts` 위치 부적절** 🆕

Prisma 직접 접근하는 핸들러가 module `api/` 디렉토리에 위치. `api/` 는 클라이언트 데이터 계층용 — 서버 전용 Prisma 코드는 `src/app/api/` 또는 `src/lib/` 에 위치해야 함.

---

## B. `src/components/` + `src/hooks/` + `src/types/` 감사

### Cross-import 격리

- `src/components/` → `@/modules/` import: **0건** ✓
- `src/hooks/` → `@/modules/` import: **0건** ✓
- `src/types/` → `@/modules/` import: **0건** ✓

### 위반 사항 (5건, 이전 감사에서 미해결)

| # | 파일 | 문제 | 심각도 |
|---|------|------|--------|
| 1 | `components/github-stars-button.tsx:14` | Server Component에서 직접 `fetch()` 호출 | 🔴 |
| 2 | `components/user-avatar-profile.tsx:6-11` | `emailAddresses: Array<{ emailAddress: string }>` — Clerk-specific shape | 🟡 |
| 3 | `components/layout/app-sidebar.tsx:33-39` | 하드코딩 `mockUser` (`primary_team`, `secondary_team`, `role`) | 🟡 |
| 4 | `hooks/use-breadcrumbs.tsx:12-18` | 하드코딩 `/demo/modules` 라우트 매핑 + 한글 라벨 | 🟡 |
| 5 | `components/form-card-skeleton.tsx:21-33` | "Product Name", "Category", "Price" 도메인 특정 주석 | 🟢 |

---

## C. `src/app/` — 라우트 & API 감사

### C-1. Metadata (47개 페이지)

모든 `page.tsx`가 `metadata` 또는 `generateMetadata` export. **단, 18개 파일이 `: Metadata` 타입 어노테이션 누락:**

```ts
// 현재 (18개 파일)
export const metadata = { title: '...' };

// 컨벤션
export const metadata: Metadata = { title: '...' };
```

누락 파일 목록: `demo/components/{chat,kanban,icons,notifications,profile,forms/*}`, `demo/modules/{react-query,products,workspaces,dashboard,users,exclusive,billing}` 하위 page.tsx

### C-2. Route Group Error/Loading

| 라우트 그룹/세그먼트 | layout.tsx | error.tsx | loading.tsx |
|---------------------|:----------:|:---------:|:-----------:|
| `(main)/` | Y | Y ✓ | Y ✓ |
| `(main)/dcim/` | Y | Y ✓ | Y ✓ |
| `(main)/demo/` | Y | Y ✓ | Y ✓ |
| `(main)/demo/components/` | Y | **✗** | **✗** |
| `(main)/demo/modules/` | Y | **✗** | **✗** |
| `(main)/settings/` | (상속) | Y ✓ | Y ✓ |

`demo/components/`와 `demo/modules/`는 자체 `layout.tsx`가 있으나 `error.tsx` + `loading.tsx` 누락.

### C-3. API Route Zod 검증

**POST/PUT은 전부 Zod 적용됨.** GET handler의 query param 파싱만 문제:

| # | 파일 | 안티패턴 |
|---|------|----------|
| 1 | `api/dcim/cables/route.ts` (GET) | `Object.fromEntries(...) as Record<string, string>` |
| 2 | `api/dcim/devices/route.ts` (GET) | 동일 |
| 3 | `api/dcim/interfaces/route.ts` | 동일 |
| 4 | `api/dcim/sites/route.ts` | 동일 |
| 5 | `api/dcim/sites/platforms/route.ts` | 동일 |
| 6 | `api/dcim/sites/racks/route.ts` | 동일 |
| 7 | `api/dcim/sites/roles/route.ts` | 동일 |
| 8 | `api/ipam/ip-addresses/route.ts` | 동일 |
| 9 | `api/ipam/prefixes/route.ts` (GET) | 동일 |

9개 파일, 모두 GET handler에서 `Object.fromEntries()` + `as` type cast 패턴 사용.

### C-4. HydrationBoundary + Suspense

| 파일 | HydrationBoundary | Suspense | 상태 |
|------|:-----------------:|:--------:|------|
| `dcim/devices/page.tsx` | Y | Y | ✓ |
| `dcim/devices/[id]/page.tsx` | Y | Y | ✓ |
| `demo/modules/billing/page.tsx` | Y | Y | ✓ |
| `demo/modules/dashboard/page.tsx` | Y | Y | ✓ |
| `demo/modules/workspaces/page.tsx` | Y | Y | ✓ |
| `demo/modules/workspaces/team/[[...rest]]/page.tsx` | Y | Y | ✓ |
| **`demo/modules/products/[productId]/page.tsx`** | Y | **✗** | 🔴 |

### C-5. global-error.tsx

`<html lang='en'>` + `<body>` 포함. ✓

---

## D. 종합 점수표

| 영역 | 평가 | 변경 |
|------|------|------|
| Production 모듈 데이터 계층 (7개) | ✅ 완전 준수 | +4 (cables, devices, interfaces, sites, switch-mapping 추가) |
| Demo 모듈 데이터 계층 (6개) | ✅ 완전 준수 | demo 격리로 구조 개선 |
| Mutation 패턴 (inline `mutationFn`) | ✅ 0건 | 이전 23건 → 전량 해결 |
| 하드코딩 query key | ✅ 0건 | 이전 1건 → 해결 |
| `use-*-mutations.ts` 훅 | ✅ 0건 | 이전 7개 → 전량 삭제 |
| `components/` → `modules/` cross-import | ✅ 0건 | 유지 |
| `hooks/` → `modules/` cross-import | ✅ 0건 | 유지 |
| Metadata export (47개 페이지) | ✅ 전체 존재 | 유지 |
| Metadata `: Metadata` 타입 | ⚠️ 18개 누락 | 🆕 |
| `global-error.tsx` | ✅ | 유지 |
| Hook 우회 (컴포넌트가 queryOptions 직접 import) | ⚠️ 2개 모듈 (workspaces, dashboard) | 🆕 |
| `view-settings/api/` Prisma handler 위치 | ⚠️ 1건 | 🆕 |
| Route group error/loading | ⚠️ 2곳 누락 (`demo/components/`, `demo/modules/`) | 🆕 |
| API route Zod query param 검증 | 🔴 9개 누락 | 변화 없음 |
| HydrationBoundary + Suspense | 🔴 1건 누락 | 변화 없음 |
| 컴포넌트/훅 도메인 오염 | 🔴 1건 + 🟡 3건 + 🟢 1건 | 변화 없음 |

---

## E. 수정 우선순위

### 🔴 High

1. **API route Zod query param 검증** (9개 파일) — `Object.fromEntries()` + type cast 제거
2. **`products/[productId]/page.tsx` Suspense 추가** (1개 파일)
3. **`demo/components/` + `demo/modules/` error.tsx + loading.tsx** (4개 파일)
4. **Hook 우회 수정** — `demo/workspaces`, `demo/dashboard` 컴포넌트가 hook 통하도록

### 🟡 Medium

5. **Metadata `: Metadata` 타입 어노테이션** (18개 파일)
6. **`github-stars-button.tsx`** — fetch() 분리
7. **`user-avatar-profile.tsx`** — Prop 일반화
8. **`app-sidebar.tsx`** — mockUser 제거
9. **`use-breadcrumbs.tsx`** — 라우트 매핑 외부 주입
10. **`view-settings/api/get-view-settings-handler.ts`** — 위치 재검토

### 🟢 Low

11. **`form-card-skeleton.tsx`** — 도메인 주석 일반화
12. **7개 정적 demo 모듈** — 향후 API 연동 시 데이터 계층 구축
