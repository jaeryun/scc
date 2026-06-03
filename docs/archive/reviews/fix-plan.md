# SCC 감사 수정 계획 v2

**기준:** audit-00-consolidated.md (2026-06-03)  
**구현 완료:** 2026-06-03 (commit `5c5058f` ~ `7918b15`)  
**작성:** 2026-06-03 / **리뷰:** Code Reviewer (a9e7d711)  
**원칙:** 원본 템플릿 패턴을 신뢰하고 최대한 일치시킨다. SCC 구조적 결정(`src/modules/`, 뷰 시스템, Clerk 제거)은 유지.

---

## 리뷰 피드백 반영 사항 (v1 → v2)

| 리뷰 지적 | 조치 |
|-----------|------|
| `loading.tsx` 누락 | Phase 5를 "Error Boundary + Loading"으로 확장 |
| `getQueryClient()` SSR-safety 검증 누락 | ✅ 검증 완료 — `isServer` 분기로 요청별 신규 생성, 안전함 |
| Phase 4(API Zod)가 Phase 3(Suspense)보다 우선 | 순서 조정: 1-2-4-3-5-6-7-8-9 |
| Phase 8 데모 모듈 과잉 추상화 위험 | 검증 결과: 모든 데모 모듈이 순수 클라이언트 UI. `api/` 강제 생성하지 않고, 실제 데이터 연동이 필요한 모듈만 대상 축소 |
| `any` 타입 수정 난이도 과소평가 | "재검토 후 가능한 것만, 불가능은 `@reason` 보강"으로 스코프 조정 |
| 런타임 smoke test 누락 | 각 Phase 검증에 "주요 경로 수동 확인" 추가 |
| `.passthrough()` vs `.strip()` | `.strip()`으로 변경 (NetBox strict validation 대비) |
| Mutation `onSuccess` 덮어쓰기 혼동 위험 | Phase 1에 명시적 경고 추가 |
| `error.tsx` layout 커버리지 한계 | conventions.md에 이미 명시된 제약 — Phase 5에 참고 추가 |

---

## 사전 검증 완료

- ✅ `getQueryClient()` SSR-safe — `isServer`일 때 `makeQueryClient()`로 요청별 신규 생성
- ✅ 기존 hooks(`useDashboards`, `useDevices`, `useWorkspaces` 등) 존재 확인
- ✅ 데모 모듈(auth, overview, elements, profile, forms) 순수 클라이언트 UI 확인 — `api/` 강제 구축 불필요

---

## 🔴 Phase 1 — Mutation 패턴 전면 교체

### 문제

8개 모듈의 `api/mutations.ts`가 `useMutation` 커스텀 훅 패턴 사용. `mutationOptions()`를 사용해야 React 독립적이고 테스트 가능한 구조가 됨.

### 현재 → 목표

```typescript
// ❌ 현재
export function usePrefixMutations() {
  const queryClient = useQueryClient();
  return { createMutation: useMutation({ mutationFn: ..., onSuccess: () => queryClient.invalidateQueries(...) }) };
}

// ✅ 목표
import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';

export const createPrefixMutation = mutationOptions({
  mutationFn: createPrefix,
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: prefixKeys.all });
  }
});
```

### ⚠️ 중요: onSuccess 덮어쓰기 패턴

`mutationOptions`의 `onSuccess`에는 **invalidateQueries만** 둔다. toast, router.push 등 UI 콜백은 컴포넌트에서 spread로 덮어쓴다:

```typescript
// ✅ 올바름 — 컴포넌트의 onSuccess가 mutationOptions의 onSuccess를 덮어씀
const mutation = useMutation({
  ...createPrefixMutation,
  onSuccess: () => {
    toast.success('생성 완료');          // UI 피드백
    router.push('/dcim/ipam');           // 네비게이션
    // invalidateQueries는 덮어써지므로, 컴포넌트에서도 필요하면 직접 호출
    getQueryClient().invalidateQueries({ queryKey: prefixKeys.all });
  }
});
```

> 컴포넌트 `onSuccess`가 `mutationOptions`의 `onSuccess`를 **완전히 덮어쓰므로**, invalidateQueries가 필요한 경우 컴포넌트 쪽에서도 명시적으로 호출해야 한다.

### 작업 범위

**A. `api/mutations.ts` 변환 (8개 파일)**

| # | 파일 | 현재 export | → export |
|---|------|------------|----------|
| 1 | `ipam/api/mutations.ts` | `usePrefixMutations()`, `useIpMutations()` | `createPrefixMutation`, `assignIpMutation`, `releaseIpMutation` |
| 2 | `products/api/mutations.ts` | `useProductMutations()` | `createProductMutation`, `updateProductMutation`, `deleteProductMutation` |
| 3 | `users/api/mutations.ts` | `useUserMutations()` | `createUserMutation`, `updateUserMutation`, `deleteUserMutation` |
| 4 | `cables/api/mutations.ts` | `useCableMutations()` | 개별 `mutationOptions` |
| 5 | `devices/api/mutations.ts` | `useDeviceMutations()` | 개별 `mutationOptions` |
| 6 | `dashboard/api/mutations.ts` | `useDashboardMutations()` | 개별 `mutationOptions` |
| 7 | `view-settings/api/mutations.ts` | `useViewSettingsMutations()` | `updateViewSettingMutation` |
| 8 | `workspaces/api/mutations.ts` | `useWorkspaceMutations()` | 개별 `mutationOptions` |

**B. 컴포넌트 수정 (9개 파일)**

| # | 파일 | 변경 |
|---|------|------|
| 1 | `products/components/product-form.tsx` | `useProductMutations()` → `useMutation({ ...createProductMutation })` |
| 2 | `products/components/product-tables/cell-action.tsx` | → `useMutation({ ...deleteProductMutation })` |
| 3 | `users/components/user-form-sheet.tsx` | → `useMutation({ ...createUserMutation })` |
| 4 | `users/components/users-table/cell-action.tsx` | → `useMutation({ ...deleteUserMutation })` |
| 5 | `workspaces/components/team-view.tsx` | → `useMutation({ ...updateMemberRoleMutation })` |
| 6 | `workspaces/components/workspace-view.tsx` | → `useMutation({ ...createWorkspaceMutation })` |
| 7 | `dashboard/components/dashboard-canvas.tsx` | `useDashboardMutations()` → 개별 `useMutation` |
| 8 | `dashboard/components/dashboard-list.tsx` | `useDashboardMutations()` → 개별 `useMutation` |
| 9 | `view-settings/components/view-settings-form.tsx` | → `useMutation({ ...updateViewSettingMutation })` |

**C. hooks/use-*-mutations.ts 정리 (8개 파일)**

현재 `api/mutations.ts`의 단순 re-export. `mutationOptions` 패턴에서는 불필요 → 삭제.

### 검증
- `bun tsc --noEmit` 통과
- `bun run build` 성공
- 주요 CRUD 동작 수동 smoke test (제품 생성/수정/삭제, IPAM 할당/해제)

---

## 🔴 Phase 2 — Data Layer Bypass 수정

### 2-A. Service 직접 import (1건)

**파일:** `src/app/(main)/library/modules/dashboard/[dashboardId]/page.tsx`

```typescript
// ❌ 현재
import { getDashboardById } from '@/modules/dashboard/api/service';
const dashboard = await getDashboardById(dashboardId);  // generateMetadata + 페이지 본문 모두에서 호출

// ✅ 수정 — 페이지 본문은 prefetchQuery + HydrationBoundary
const queryClient = getQueryClient();
await queryClient.prefetchQuery(dashboardDetailQueryOptions(dashboardId));
```

> `generateMetadata` 내부는 React Query 사용 불가 → `getDashboardById` import 유지. 함수 분리는 과잉 추상화이므로 하지 않음.

### 2-B. 클라이언트 컴포넌트 — queryOptions 직접 import (9건)

| # | 파일 | 현재 | → 수정 (이미 존재하는 hook) |
|---|------|------|---------------------------|
| 1 | `products/components/product-view-page.tsx` | `useSuspenseQuery(productByIdOptions())` | `useProductById()` |
| 2 | `products/components/product-tables/index.tsx` | `useSuspenseQuery(productsQueryOptions())` | `useProducts()` |
| 3 | `users/components/users-table/index.tsx` | `useSuspenseQuery(usersQueryOptions())` | `useUsers()` |
| 4 | `devices/components/device-table/index.tsx` | `useSuspenseQuery(devicesQueryOptions())` | `useDevices()` |
| 5 | `dashboard/components/dashboard-canvas.tsx` | `useQuery(dashboardDetailQueryOptions())` | `useDashboardDetail()` |
| 6 | `dashboard/components/dashboard-list.tsx` | `useQuery(foldersQueryOptions())` 등 | `useFolders()`, `useDashboards()` |
| 7 | `workspaces/components/team-view.tsx` | `useQuery(workspaceByIdOptions())` | `useWorkspaceById()`, `useTeamMembers()` |
| 8 | `workspaces/components/workspace-view.tsx` | `useQuery(workspacesQueryOptions())` | `useWorkspaces()` |
| 9 | `react-query-demo/components/pokemon-info.tsx` | `useSuspenseQuery(pokemonOptions())` | **hook 신규 생성 필요** |

> **제외 (서버 컴포넌트):** `product-listing.tsx`, `user-listing.tsx`, `products/[productId]/page.tsx` — prefetch 패턴에 `queryOptions` 직접 import가 올바름.

### 검증
- `bun tsc --noEmit` 통과
- `bun run build` 성공
- 각 목록/상세 페이지 정상 로딩 확인

---

## 🔴 Phase 3 — API Route Zod 검증 추가

### 문제

5개 API 라우트에서 POST/PUT 요청 바디를 검증 없이 NetBox로 전달. 잘못된 입력도 400 없이 NetBox까지 도달.

### 대상 (5개 라우트)

| # | 라우트 | 메서드 |
|---|--------|--------|
| 1 | `app/api/dcim/cables/route.ts` | POST |
| 2 | `app/api/dcim/devices/route.ts` | POST |
| 3 | `app/api/dcim/devices/[id]/route.ts` | PUT |
| 4 | `app/api/ipam/prefixes/route.ts` | POST |
| 5 | `app/api/ipam/ip-addresses/assign/route.ts` | POST |

### 수정

```typescript
import { z, ZodError } from 'zod';

const cableCreateSchema = z.object({
  type: z.string().optional(),
  termination_a_type: z.string().min(1),
  termination_a_id: z.number(),
  termination_b_type: z.string().min(1),
  termination_b_id: z.number(),
  status: z.string().optional(),
  label: z.string().optional(),
}).strip();  // .strip(): 알 수 없는 필드 제거 (NetBox strict validation 대비)

export async function POST(req: NextRequest) {
  try {
    const body = cableCreateSchema.parse(await req.json());
    // ...
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        failure(error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')),
        { status: 400 }
      );
    }
    // ...
  }
}
```

> `.passthrough()` 대신 `.strip()` 사용 — NetBox가 예상치 못한 필드로 400을 내는 것보다 안전.

### 검증
- `bun tsc --noEmit` 통과
- 각 API에 잘못된 바디로 curl 테스트 → 400 응답 확인

---

## 🔴 Phase 4 — Suspense 경계 누락 수정

### 대상 (2건)

| # | 파일 | 문제 |
|---|------|------|
| 1 | `products/components/product-listing.tsx` | `<HydrationBoundary>` 내 `<ProductTable>`가 `useSuspenseQuery` 사용하나 `<Suspense>` 없음 |
| 2 | `products/components/product-view-page.tsx` | `<EditProductView>`가 `useSuspenseQuery` 사용하나 `<Suspense>` 없음 |

> 감사 보고서는 `product/[productId]/page.tsx:24`를 지목했으나, 실제 `useSuspenseQuery` 사용 파일은 `product-view-page.tsx:22`가 맞다. fix-plan v2의 대상이 정확함.

### 수정

```tsx
// product-listing.tsx
<HydrationBoundary state={dehydrate(queryClient)}>
  <Suspense fallback={<ProductsTableSkeleton />}>
    <ProductTable />
  </Suspense>
</HydrationBoundary>

// product-view-page.tsx
<Suspense fallback={<ProductFormSkeleton />}>
  <EditProductView productId={Number(productId)} />
</Suspense>
```

### 검증
- `bun tsc --noEmit` 통과
- 클라이언트 네비게이션으로 제품 목록/상세 이동 시 Suspense fallback 정상 표시 확인

---

## 🟡 Phase 5 — Error Boundary + Loading 추가

### 현재 상태
- `error.tsx`: 0개
- `loading.tsx`: 0개
- `global-error.tsx`: 1개

### 대상 (라우트 그룹·섹션 레벨, error.tsx + loading.tsx 동시 추가)

| # | 위치 | 파일 |
|---|------|------|
| 1 | `src/app/(main)/` | `error.tsx` + `loading.tsx` |
| 2 | `src/app/(main)/dcim/` | `error.tsx` + `loading.tsx` |
| 3 | `src/app/(main)/dcim/devices/[id]/` | `error.tsx` + `loading.tsx` |
| 4 | `src/app/(main)/dcim/ipam/prefixes/[id]/` | `error.tsx` + `loading.tsx` |
| 5 | `src/app/(main)/library/modules/products/` | `error.tsx` + `loading.tsx` |
| 6 | `src/app/(main)/library/modules/products/[productId]/` | `error.tsx` + `loading.tsx` |
| 7 | `src/app/(main)/library/modules/dashboard/` | `error.tsx` + `loading.tsx` |
| 8 | `src/app/(main)/library/modules/users/` | `error.tsx` + `loading.tsx` |
| 9 | `src/app/(main)/library/modules/workspaces/` | `error.tsx` + `loading.tsx` |
| 10 | `src/app/(main)/settings/` | `error.tsx` + `loading.tsx` |

### error.tsx 템플릿

```tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/page-container';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <PageContainer pageTitle="오류 발생" pageDescription="페이지를 불러오는 중 문제가 발생했습니다">
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-muted-foreground">{error.message || '알 수 없는 오류'}</p>
        <Button onClick={reset}>다시 시도</Button>
      </div>
    </PageContainer>
  );
}
```

### loading.tsx 템플릿

```tsx
import { PageSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return <PageSkeleton />;
}
```

> ⚠️ `error.tsx`는 동일 세그먼트의 `layout.tsx` 에러를 잡지 못한다 (conventions.md에 명시된 Next.js 제약). 각 배치 위치가 실제로 의도한 범위를 커버하는지 확인 필요.

### 검증
- 의도적 오류 발생 시 error.tsx 표시 확인 (주요 라우트 3곳)
- 페이지 전환 시 loading.tsx 표시 확인

---

## 🟡 Phase 6 — HydrationBoundary 도입

### 대상 (7개 페이지)

| # | 페이지 | 현재 |
|---|--------|------|
| 1 | `dcim/devices/page.tsx` | client-only `useQuery` |
| 2 | `dcim/devices/[id]/page.tsx` | client-only |
| 3 | `library/modules/workspaces/page.tsx` | client-only |
| 4 | `library/modules/workspaces/team/[[...rest]]/page.tsx` | client-only |
| 5 | `library/modules/exclusive/page.tsx` | client-only |
| 6 | `library/modules/billing/page.tsx` | client-only |
| 7 | `library/modules/dashboard/page.tsx` | client-only |

### 패턴

```tsx
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { xxxQueryOptions } from '@/modules/xxx/api/queries';
import PageContainer from '@/components/layout/page-container';

export default function Page() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(xxxQueryOptions());

  return (
    <PageContainer pageTitle="..." pageDescription="...">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<PageSkeleton />}>
          <ClientComponent />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
```

> ⚠️ 서버 prefetch의 queryKey와 클라이언트 `useSuspenseQuery`의 queryKey가 정확히 일치해야 한다. 키 팩토리를 사용하므로 가능성은 낮지만, 각 페이지에서 확인할 것.

### 검증
- `bun tsc --noEmit` 통과
- 각 페이지 첫 로딩 시 스피너 없이 즉시 데이터 표시되는지 확인

---

## 🟡 Phase 7 — PageContainer 적용

### 대상 (8개 페이지)

| # | 페이지 |
|---|--------|
| 1 | `app/(main)/home/page.tsx` |
| 2 | `library/components/chat/page.tsx` |
| 3 | `library/components/kanban/page.tsx` |
| 4 | `library/components/icons/page.tsx` |
| 5 | `library/components/notifications/page.tsx` |
| 6 | `library/components/profile/[[...profile]]/page.tsx` |
| 7 | `dcim/ipam/prefixes/[id]/page.tsx` |
| 8 | `library/components/forms/page.tsx` |

> 제외: `app/page.tsx`(루트 랜딩), `app/api-reference/page.tsx`(API 문서), `app/(main)/settings/page.tsx`(리디렉션 전용)

### 검증
- 각 페이지 PageContainer 적용 확인
- pageTitle, pageDescription 적절성 확인

---

## 🟡 Phase 8 — 데모 모듈 데이터 계층 보강

### 사전 검증 결과

데모 모듈을 전수 확인한 결과:
- **auth, overview, elements, profile, forms** — 순수 클라이언트 UI. 서버 데이터 페칭 없음. **`api/` 강제 구축하지 않음.**
- **react-query-demo** — `api/queries.ts`만 있고 `types.ts`, `service.ts` 분리 안 됨 + hook 없음 → **보강 대상**

### 대상 (1개 모듈)

| 모듈 | 현재 | 조치 |
|------|------|------|
| `react-query-demo` | `api/queries.ts`에 types+service 통합 | `api/types.ts`, `api/service.ts` 분리 + hook 생성 |

> chat, kanban, notifications는 Zustand 기반이므로 제외.

### 검증
- `bun tsc --noEmit` 통과

---

## 🟢 Phase 9 — 경미한 항목 일괄 수정

| # | 항목 | 건수 | 수정 방식 |
|---|------|------|----------|
| 1 | aria-label 누락 | 7 | 아이콘 전용 버튼에 `aria-label="설명"` 추가 |
| 2 | cn() 우회 (삼항 연산자) | 7 | `cn('base', cond && 'active')` 로 변경 |
| 3 | 정적 Tailwind 색상 | 4 | CSS 변수 토큰으로 변경 (차트는 `--chart-1`~`--chart-5` 사용) |
| 4 | `!important` Tailwind | 2 | `!` 접미사 제거, CSS 우선순위로 해결 |
| 5 | 하드코딩 쿼리 키 | 1 | `pokemonKeys` 키 팩토리 생성 |
| 6 | any 타입 | 6 | **재검토 후 가능한 것만 `unknown` + 타입 가드로 변경. TanStack Form + Zod 제네릭 제약으로 불가능한 것은 `@reason` 주석 보강.** |
| 7 | Import 순서 혼합 | 13 | ① Node built-in ② 외부 라이브러리 ③ `@/` ④ 상대경로 순 정렬 |

---

## 실행 순서

| 순서 | Phase | 내용 | 예상 |
|------|-------|------|------|
| **1** | Phase 1 | Mutation → `mutationOptions()` | 3-4h |
| **2** | Phase 2 | Data layer bypass 수정 | 2-3h |
| **3** | Phase 3 | API Route Zod 검증 | 1-2h |
| **4** | Phase 4 | Suspense 경계 추가 | 30m |
| **5** | Phase 5 | Error + Loading 추가 (10곳) | 1-2h |
| **6** | Phase 6 | HydrationBoundary 도입 | 2-3h |
| **7** | Phase 7 | PageContainer 적용 | 1h |
| **8** | Phase 8 | react-query-demo 데이터 계층 보강 | 1h |
| **9** | Phase 9 | 경미한 항목 일괄 | 1-2h |

**총 예상: 12-18h**

---

## 의도적 유지 항목

| 항목 | 사유 |
|------|------|
| `src/modules/<name>/` | 프로젝트 구조적 결정, rename 실익 없음 |
| `src/app/(main)/` 뷰 시스템 | 멀티뷰 Select 전환 — 프로젝트 핵심 설계 |
| Clerk/Sentry 제거 | Phase 1 의도적 제거 |
| `mock-store.ts` 사용 | Phase 1 과도기 |
| 데모 모듈(auth, overview, elements, profile, forms) `api/` 미구축 | 순수 클라이언트 UI, 서버 데이터 페칭 없음 |
| chat, kanban, notifications `api/` 미구축 | Zustand 로컬 상태 |
| 서버 컴포넌트의 `queryOptions` 직접 import | 올바른 prefetch 패턴 |
