# Audit #1: 데이터 계층 & 아키텍처

**감사 항목:** 모듈 구조, 데이터 계층 완전성, mutation 패턴, 쿼리 키 팩토리, any 타입, 컴포넌트 선언 스타일

---

## 1. 데이터 계층 완전성

각 모듈은 `api/types.ts`, `api/service.ts`, `api/queries.ts` 필수. CRUD 존재 시 `api/mutations.ts`도 필수.

### 완전한 모듈 (13개)

| 모듈 | types.ts | service.ts | queries.ts | mutations.ts |
|------|----------|------------|------------|-------------|
| billing | ✅ | ✅ | ✅ | -- (CRUD 없음) |
| cables | ✅ | ✅ | ✅ | ✅ |
| dashboard | ✅ | ✅ | ✅ | ✅ |
| devices | ✅ | ✅ | ✅ | ✅ |
| exclusive | ✅ | ✅ | ✅ | -- (CRUD 없음) |
| interfaces | ✅ | ✅ | ✅ | -- (CRUD 없음) |
| ipam | ✅ | ✅ | ✅ | ✅ |
| products | ✅ | ✅ | ✅ | ✅ |
| sites | ✅ | ✅ | ✅ | -- (CRUD 없음) |
| switch-mapping | ✅ | ✅ | ✅ | -- (CRUD 없음) |
| users | ✅ | ✅ | ✅ | ✅ |
| view-settings | ✅ | ✅ | ✅ | ✅ |
| workspaces | ✅ | ✅ | ✅ | ✅ |

### 미구축 모듈 (9개)

| 모듈 | 누락 | 비고 |
|------|------|------|
| **auth** | `api/` 전체 | `components/`만 존재 |
| **chat** | `api/` 전체 | `utils/store.ts`로 데이터 관리 |
| **elements** | `api/` 전체 | 컴포넌트 1개 |
| **forms** | `api/` 전체 | 컴포넌트 5개 |
| **kanban** | `api/` 전체 | `utils/store.ts`로 데이터 관리 |
| **notifications** | `api/` 전체 | `utils/store.ts`로 데이터 관리 |
| **overview** | `api/` 전체 | 컴포넌트 1개 |
| **profile** | `api/` 전체 | `utils/form-schema.ts` |
| **react-query-demo** | `types.ts`, `service.ts` | `queries.ts`만 존재, `fetch` 직접 호출 |

> auth, chat, kanban, notifications는 Zustand 기반이라 `api/` 계층이 필요 없을 수 있지만, elements, forms, overview, profile은 데모 페이지로 `api/` 계층 구축 권장.

---

## 2. Mutation 패턴

### 규칙

`api/mutations.ts`는 `mutationOptions({...})` 객체를 export → 컴포넌트에서 `useMutation({...createMutation})`로 spread 조합:

```typescript
// ✅ 규칙
import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';

export const createPrefixMutation = mutationOptions({
  mutationFn: createPrefix,
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: prefixKeys.all })
});
```

### 현실 (전면 위반)

모든 mutations.ts가 커스텀 훅(`useEntityMutations()`) 패턴 사용, 내부에서 `useMutation` 직접 호출:

```typescript
// ❌ 현재 (9개 모듈 전부)
export function usePrefixMutations() {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: createPrefix,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: prefixKeys.all })
  });
  return { createMutation };
}
```

### 영향받는 파일

| 파일 | `useMutation` 호출 수 |
|------|----------------------|
| `src/modules/ipam/api/mutations.ts` | 3 |
| `src/modules/products/api/mutations.ts` | 3 |
| `src/modules/users/api/mutations.ts` | 3 |
| `src/modules/workspaces/api/mutations.ts` | 2 |
| `src/modules/dashboard/api/mutations.ts` | 7 |
| `src/modules/cables/api/mutations.ts` | 2 |
| `src/modules/devices/api/mutations.ts` | 3 |
| `src/modules/view-settings/api/mutations.ts` | 1 |

**총 23개 `useMutation` 호출이 `mutationOptions` 대신 사용됨.**

긍정적: 컴포넌트(.tsx)에서 `useMutation` 직접 호출은 0건. 모두 `api/mutations.ts`에 중앙화됨.

---

## 3. 쿼리 키 팩토리

### 규칙

문자열 하드코딩 금지, 키 팩토리(`entityKeys.all/list/detail`) 사용.

### 위반

| 파일 | 라인 | 코드 |
|------|------|------|
| `src/modules/react-query-demo/api/queries.ts` | 18 | `queryKey: ['pokemon', id]` |

### 양호

나머지 모든 모듈은 키 팩토리 올바르게 사용:
- `productKeys.list(filters)`, `productKeys.detail(id)`, `productKeys.all`
- `prefixKeys.lists(params)`, `ipKeys.lists(params)`
- `cableKeys.lists(params)`, `cableKeys.detail(id)`, `cableKeys.all`
- 등

---

## 4. 컴포넌트의 데이터 계층 우회

### 규칙

컴포넌트 → hooks → api/queries. 직접 api/service.ts, api/queries.ts import 금지.

### 위반 (13건)

#### service 직접 import (1건)

| 파일 | 라인 | 코드 |
|------|------|------|
| `src/app/(main)/library/modules/dashboard/[dashboardId]/page.tsx` | 4 | `import { getDashboardById } from '@/modules/dashboard/api/service'` |

#### hooks 우회 — queryOptions 직접 import (12건)

| 파일 | 라인 | 비고 |
|------|------|------|
| `src/app/(main)/library/modules/products/[productId]/page.tsx` | 3 | `productByIdOptions` |
| `src/modules/products/components/product-view-page.tsx` | 7 | hooks 존재, 우회 |
| `src/modules/products/components/product-listing.tsx` | 4 | hooks 존재, 우회 |
| `src/modules/products/components/product-tables/index.tsx` | 9 | hooks 존재, 우회 |
| `src/modules/workspaces/components/team-view.tsx` | 32 | hooks 존재, `useQuery` 혼용 |
| `src/modules/workspaces/components/workspace-view.tsx` | 28 | hooks 존재, `useQuery` 혼용 |
| `src/modules/dashboard/components/dashboard-canvas.tsx` | 12 | |
| `src/modules/dashboard/components/dashboard-list.tsx` | 38 | |
| `src/modules/users/components/user-listing.tsx` | 4 | hooks 존재, 우회 |
| `src/modules/users/components/users-table/index.tsx` | 9 | hooks 존재, 우회 |
| `src/modules/react-query-demo/components/pokemon-info.tsx` | 5 | |
| `src/modules/devices/components/device-table/index.tsx` | 16 | |

### 양호

- hooks에서 `apiClient`/`fetch` 직접 호출 0건
- 컴포넌트에서 `apiClient`/`fetch` 직접 호출 0건

---

## 5. `any` 타입 사용

| 파일 | 라인 | 코드 | @reason |
|------|------|------|----------|
| `src/lib/netbox/cache.ts` | 31 | `data as any` | ✅ 있음 (Prisma Json) |
| `src/lib/netbox/cache.ts` | 38 | `data as any` | ✅ 있음 (Prisma Json) |
| `src/modules/forms/components/sheet-product-form.tsx` | 46 | `productSchema as any` | ✅ 있음 (TanStack Form+Zod) |
| `src/modules/products/schemas/product.ts` | 8 | `z.any()` | ❌ 없음 |
| `src/components/forms/demo-form.tsx` | 53 | `z.any().optional()` | ❌ 없음 |
| `src/components/forms/demo-form.tsx` | 60 | `z.array(z.any()).optional()` | ❌ 없음 |

---

## 6. 컴포넌트 선언 스타일

### 규칙

`function ComponentName() {}` 함수 선언문 사용, 화살표 함수 금지.

### 결과: 양호

`src/modules/` 내 모든 컴포넌트가 `function` 선언문 사용. 화살표 함수는 TanStack Table column 정의, 이벤트 핸들러, `useMemo` 콜백 등 적절한 용도로만 사용.

---

## 요약

| 카테고리 | 위반 수 | 심각도 |
|----------|---------|--------|
| 데이터 계층 누락 | 9개 모듈 | 🟡 중간 |
| Mutation 패턴 | 9개 파일, 23건 | 🔴 심각 |
| 쿼리 키 하드코딩 | 1건 | 🟢 경미 |
| 데이터 계층 우회 | 13건 | 🔴 심각 |
| `any` 타입 | 6건 | 🟢 경미 |
| 컴포넌트 선언문 | 0건 | ✅ 양호 |
