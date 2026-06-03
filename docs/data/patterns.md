# 데이터 패턴 상세 가이드

> `src/modules/CLAUDE.md`에서 핵심 규칙을 먼저 확인하고, 이 문서는 상세 예제와 심화 패턴을 제공합니다.
> 빠른 참조: [cheat-sheet.md](./cheat-sheet.md)

## 1. React Query 상세 패턴

### 신규 페이지 표준 패턴

**서버 컴포넌트 — `void prefetchQuery`:**

```typescript
// app/(main)/subnets/page.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { subnetsQueryOptions } from '@/modules/ipam/api/queries';

export default async function SubnetsPage() {
  const queryClient = getQueryClient();

  // void: await 하지 않음 — 서버 컴포넌트를 차단하지 않고
  // prefetch만 예약한 후 클라이언트에서 Suspense로 기다림
  void queryClient.prefetchQuery(subnetsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<SubnetsTableSkeleton />}>
        <SubnetsTable />
      </Suspense>
    </HydrationBoundary>
  );
}
```

**클라이언트 컴포넌트 — `useSuspenseQuery`:**

```typescript
'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { subnetsQueryOptions } from '@/modules/ipam/api/queries';

export function SubnetsTable() {
  // useQuery 말고 useSuspenseQuery 사용
  // React Suspense와 통합되어 prefetch된 데이터가 스트리밍됨
  const { data: subnets } = useSuspenseQuery(subnetsQueryOptions());
  return (/* ... */);
}
```

### 왜 `void` + `useSuspenseQuery` 인가?

- **`void`**: 서버 컴포넌트에서 `await` 하지 않아 렌더링이 차단되지 않음
- **`useSuspenseQuery`**: React Suspense와 통합되어 prefetch된 데이터가 준비될 때까지 `<Suspense fallback>`을 자동으로 표시
- 이 조합으로 TTFB(Time to First Byte)를 최소화하면서도 데이터 일관성을 보장
- `useQuery`는 `undefined` 반환 가능 → 빈 상태 체크 필요, 로딩 조건 분기 등 보일러플레이트 증가

### 서버 컴포넌트에서 데이터 읽기 (헤더/메타데이터 용도)

```typescript
import { getQueryClient } from '@/lib/query-client';

export default async function SubnetDetailPage({ params }) {
  const queryClient = getQueryClient();

  // await 사용 — 서버에서 헤더/메타데이터용으로 데이터 필요 시
  const subnet = await queryClient.fetchQuery(
    subnetDetailQueryOptions(params.id)
  );

  return <PageHeader title={subnet.network} />;
}
```

---

## 2. 백엔드 패턴 표

`service.ts`가 지원하는 백엔드 연결 방식은 5가지입니다. 프로젝트 상황에 맞게 선택하고, **교체 시 service.ts만 수정**합니다.

| 패턴                     | service.ts 구현                                                         | 사용 시점                                 |
| ------------------------ | ----------------------------------------------------------------------- | ----------------------------------------- |
| **Mock (기본)**          | 인메모리 가짜 데이터 저장소 호출                                        | 백엔드 없는 초기 개발, UI 프로토타입      |
| **Route Handlers + ORM** | `apiClient('/api/...')` → route handler → \*-handlers.ts → Prisma       | Next.js 풀스택, 같은 레포에서 API+DB 운영 |
| **Server Actions + ORM** | `'use server'` 상단에 선언, ORM 직접 호출                               | 서버 컴포넌트 전용, 간단한 CRUD           |
| **BFF (Next.js → 외부)** | `apiClient('/api/...')` → route handler → Laravel/Go 등 외부 API 프록시 | 마이그레이션 과도기, 외부 백엔드 연동     |
| **Direct External API**  | `fetch('https://ext-api/...')` 직접 호출                                | Next.js 외부의 서드파티 API 직접 연동     |

---

## 3. 뮤테이션 상세 예제

`api/mutations.ts`에 `mutationOptions`로 공유 설정을 정의하고, 컴포넌트에서 spread로 UI 콜백을 조합합니다.

```typescript
// api/mutations.ts
import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createSubnet, updateSubnet, deleteSubnet } from './service';
import type { CreateSubnetPayload, UpdateSubnetPayload } from './types';
import { subnetKeys } from './queries';

export const createSubnetMutation = mutationOptions({
  mutationFn: (data: CreateSubnetPayload) => createSubnet(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: subnetKeys.all });
  }
});

export const updateSubnetMutation = mutationOptions({
  mutationFn: ({ id, data }: { id: number; data: UpdateSubnetPayload }) =>
    updateSubnet(id, data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: subnetKeys.all });
  }
});

export const deleteSubnetMutation = mutationOptions({
  mutationFn: (id: number) => deleteSubnet(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: subnetKeys.all });
  }
});
```

```typescript
// 컴포넌트 — spread로 공유 설정 + UI 콜백 조합
import { createSubnetMutation } from '../../api/mutations';

const createMutation = useMutation({
  ...createSubnetMutation,
  onSuccess: () => {
    toast.success('서브넷이 생성되었습니다');
    router.push('/dashboard/subnets');
  }
});

const deleteMutation = useMutation({
  ...deleteSubnetMutation,
  onSuccess: () => {
    toast.success('삭제되었습니다');
    setDeleteOpen(false);
  }
});
```

### 뮤테이션 + 토스트

```typescript
onSuccess: () => {
  getQueryClient().invalidateQueries({ queryKey: subnetKeys.all });
  toast.success('서브넷이 생성되었습니다');
},
onError: (error) => {
  toast.error(error.message);
}
```

---

## 4. nuqs URL 상태 관리

검색, 필터, 페이지네이션 등의 URL 상태는 nuqs로 관리합니다.

**서버 — `searchParamsCache`:**

```typescript
// lib/searchparams.ts
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  name: parseAsString,
  sort: parseAsString
});

// 서버 컴포넌트에서 파라미터 읽기
export default async function Page({ searchParams }) {
  const { page, name } = searchParamsCache.parse(searchParams);
}
```

**클라이언트 — `useQueryStates`:**

```typescript
'use client';
import { useQueryStates } from 'nuqs';
import { parseAsInteger, parseAsString } from 'nuqs';

export function useSubnetFilters() {
  return useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      name: parseAsString,
      sort: parseAsString
    },
    { shallow: true } // 클라이언트 사이드 상호작용은 shallow
  );
}
```

---

## 5. 데이터 테이블 (TanStack Table)

### 파일 구조

```
modules/<name>/
  api/queries.ts              ← 쿼리 옵션 정의
  components/<name>-tables/
    columns.tsx               ← 컬럼 정의 (header, accessorKey, cell, filterFn)
  app/(main)/<name>/page.tsx ← 서버 컴포넌트 (prefetch + HydrationBoundary)
```

### 컬럼 정의 예시

```typescript
// columns.tsx
import { ColumnDef } from '@tanstack/react-table';

export const subnetColumns: ColumnDef<Subnet>[] = [
  {
    accessorKey: 'network',
    header: '네트워크',
    enableSorting: true
  },
  {
    accessorKey: 'description',
    header: '설명',
    cell: ({ row }) => row.original.description ?? '—'
  }
];
```

### 공통 테이블 컴포넌트

`src/components/ui/table/data-table.tsx`를 사용합니다.
헬퍼 유틸은 `@/lib/data-table`의 `getCommonPinningStyles`, `getValidFilters` 등을 활용합니다.
