# Bug Handoff: 상품/사용자 관리 페이지 데이터 미표시

## 버그 증상
- `/demo-components/products` (상품 관리) 페이지 진입 시 테이블이 비어있음 (더미 데이터 20개가 표시되지 않음)
- `/demo-components/users` (사용자 관리) 페이지 진입 시 테이블이 비어있음 (더미 데이터 50개가 표시되지 않음)
- 빌드는 성공하며, API 엔드포인트(`/api/products`, `/api/users`)는 정상적으로 JSON 데이터를 반환함
- 클라이언트 사이드 hydration 이후에도 데이터가 렌더링되지 않음

---

## 확인된 사실

### 1. API 응답은 정상
```bash
curl "http://localhost:3000/api/products?page=1&limit=10"
# → total_products: 20, products: [...10 items...] 정상 반환

curl "http://localhost:3000/api/users?page=1&limit=10"
# → total_users: 50, users: [...10 items...] 정상 반환
```

### 2. Mock 데이터 초기화는 정상
- `src/constants/mock-api.ts`: `fakeProducts.initialize()`가 파일 로드 시 즉시 실행됨
- `src/constants/mock-api-users.ts`: `fakeUsers.initialize()`가 파일 로드 시 즉시 실행됨
- 두 파일 모두 모듈 수준에서 `initialize()`를 호출하므로 import 시점에 데이터가 생성됨

### 3. HTML 렌더링 결과 확인
```bash
curl -s http://localhost:3000/demo-components/products | grep "Handmade Steel Tuna"
# → 결과 없음 (데이터가 HTML에 포함되지 않음)
```
- SSR 단계에서 데이터가 HTML에 포함되지 않음
- hydration 이후에도 React 컴포넌트 트리에 데이터가 없음

### 4. 데이터 흐름 구조
```
demo-components/products/page.tsx (Server Component)
  └── searchParamsCache.parse()
  └── <ProductListingPage /> (Server Component)
        └── getQueryClient()
        └── void queryClient.prefetchQuery(productsQueryOptions(filters))
        └── <HydrationBoundary state={dehydrate(queryClient)}>
              └── <ProductTable /> (Client Component)
                    └── useSuspenseQuery(productsQueryOptions(filters))
                    └── useDataTable({ data: data.products, ... })
```

### 5. 동일 증상: 상품/사용자 두 페이지 모두
- 같은 패턴(`HydrationBoundary` + `useSuspenseQuery`)을 사용함
- 두 페이지 모두 동일하게 데이터가 표시되지 않음

---

## 시도한 것과 결과

| 시도 | 결과 | 비고 |
|------|------|------|
| `useSuspenseQuery` → `useQuery`로 변경 + 로딩 상태 추가 | **미시도** | 롤백됨. 이 방식이 유력한 해결책일 수 있음 |
| `HydrationBoundary` 제거 후 클라이언트 컴포넌트로 변경 | **미시도** | Next.js 15 + React Query v5의 hydration 패턴 문제로 추정 |
| 서버 컴포넌트에서 데이터 직접 fetch 후 props 전달 | **미시도** | `getProducts()`를 `page.tsx`에서 직접 호출하는 방식 |

---

## 의심 가는 원인

### 원인 1 (가장 유력): Next.js 15 + React Query v5 Hydration 불일치
- `dehydrate(queryClient)`가 서버에서 데이터를 직렬화할 때 `undefined`나 빈 상태로 직렬화될 가능성
- 클라이언트의 `useSuspenseQuery`가 hydrated 상태를 제대로 복원하지 못함
- Next.js 15에서 `searchParams`가 `Promise`로 변경된 점과 관련 있을 수 있음

### 원인 2: `searchParamsCache`와 필터 불일치
- `searchParamsCache.parse(searchParams)` 이후의 값과 `ProductTable`의 `useQueryStates` 초기값이 불일치
- 예: 서버에서는 `page=undefined` → 클라이언트에서는 `page=1` (withDefault)
- 필터 객체가 서버/클리아이언트에서 다륍게 생성되어 query key가 달라짐

### 원인 3: `useSuspenseQuery` + `shallow: true` 상호작용
- `useDataTable`의 `shallow: true` 옵션이 URL 파라미터를 깊은 객체로 직렬화/역직렬화하면서 데이터 불일치 유발
- `sort` 필드의 `JSON.stringify`/`JSON.parse` 과정에서 타입 불일치

---

## 관련 파일 목록

### 상품 관리
- `src/app/(views)/demo-components/products/page.tsx` — 페이지 엔트리
- `src/features/products/components/product-listing.tsx` — 서버 컴포넌트, prefetch 로직
- `src/features/products/components/product-tables/index.tsx` — 클라이언트 컴포넌트, `useSuspenseQuery`
- `src/features/products/api/queries.ts` — queryOptions, queryKey
- `src/features/products/api/service.ts` — `getProducts()` → `fakeProducts.getProducts()`
- `src/constants/mock-api.ts` — 더미 데이터 저장소
- `src/app/api/products/route.ts` — API 라우트 핸들러

### 사용자 관리
- `src/app/(views)/demo-components/users/page.tsx` — 페이지 엔트리
- `src/features/users/components/user-listing.tsx` — 서버 컴포넌트, prefetch 로직
- `src/features/users/components/users-table/index.tsx` — 클라이언트 컴포넌트, `useSuspenseQuery`
- `src/features/users/api/queries.ts` — queryOptions, queryKey
- `src/features/users/api/service.ts` — `getUsers()` → `fakeUsers.getUsers()`
- `src/constants/mock-api-users.ts` — 더미 데이터 저장소
- `src/app/api/users/route.ts` — API 라우트 핸들러

### 공유 유틸
- `src/lib/query-client.ts` — QueryClient 싱글톤
- `src/lib/searchparams.ts` — `searchParamsCache`
- `src/hooks/use-data-table.ts` — `useDataTable` 훅

---

## 다음 단계 제안 (새 세션에서 시도)

### 옵션 A: 클라이언트 사이드 fetch로 단순화 (권장)
1. `product-listing.tsx`와 `user-listing.tsx`를 클라이언트 컴포넌트(`'use client'`)로 변경
2. `HydrationBoundary`와 `dehydrate` 제거
3. 클라이언트에서 `useQuery`로 직접 데이터 fetch
4. 로딩 상태(`isLoading`) 처리 추가

```tsx
// product-listing.tsx 예시
'use client';
import { useQuery } from '@tanstack/react-query';
import { productsQueryOptions } from '../api/queries';

export default function ProductListingPage() {
  const { data, isLoading } = useQuery(productsQueryOptions({ page: 1, limit: 10 }));
  // ...
}
```

### 옵션 B: 서버 컴포넌트에서 직접 fetch
1. `page.tsx`에서 `getProducts(filters)`를 직접 `await` 호출
2. 결과를 `ProductTable`에 `initialData` prop으로 전달
3. 클라이언트 컴포넌트에서는 `initialData`를 사용하여 hydration 우회

### 옵션 C: `useSuspenseQuery` 문제 디버깅
1. `ProductTable`에서 `useSuspenseQuery` 대신 `useQuery` 사용
2. 콘솔 로그로 `data` 객체 출력하여 실제 값 확인
3. `queryClient.getQueryData()`로 캐시 상태 직접 확인
4. React Query DevTools로 쿼리 키/데이터 상태 확인

### 옵션 D: IPAM 패턴 참고
- `src/features/ipam/` 폴더의 데이터 fetch 패턴을 참고
- IPAM은 동일한 `service.ts` → `queries.ts` → `hooks` 패턴을 사용하며 정상 동작함
- 차이점 비교: IPAM은 `useQuery`를 사용, 상품/사용자는 `useSuspenseQuery`를 사용

---

## 환경 정보

- Next.js: 16.2.1 (Turbopack)
- React: 19.2.4
- @tanstack/react-query: 5.95.2
- nuqs: 2.8.9
- 패턴: Server Component prefetch → `dehydrate` → Client Component `useSuspenseQuery`

---

## 참고 사항

- 이 버그는 **이전에는 정상 동작**했으나, 최근 Next.js 15/16 업그레이드나 React Query 버전 변경 이후 발생한 것으로 추정됨
- `useSuspenseQuery`를 사용하는 다른 페이지(Kanban, Chat 등)는 정상 동작함 (이들은 서버 prefetch 없이 클라이언트에서만 fetch)
- 빌드 시에는 오류가 발생하지 않으며, 런타임에서만 데이터가 누락됨

---

*작성일: 2026-05-17*
*상태: 디버깅 중단, handoff 완료*
