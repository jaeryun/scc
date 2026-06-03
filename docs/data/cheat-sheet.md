# 데이터 패턴 — Cheat Sheet

> 빠른 참조용. 전체 가이드는 [data/patterns.md](./patterns.md) 및 [data/ipam-reference.md](./ipam-reference.md) 참조.
> 심화 패턴: [data/patterns.md](./patterns.md), [data/external-api-types.md](./external-api-types.md)

## 데이터 계층 구조 (3파일)

```
src/modules/<name>/api/
  types.ts    → 응답 타입, 필터 타입, 뮤테이션 페이로드
  service.ts  → 백엔드 호출 전용 (apiClient 외 import 금지)
  queries.ts  → queryOptions + 쿼리 키 팩토리
```

## 쿼리 키 팩토리

```typescript
export const entityKeys = {
  all: ['entity'] as const,
  lists: () => [...entityKeys.all, 'list'] as const,
  detail: (id: string) => [...entityKeys.all, 'detail', id] as const
};
```

## 데이터 페칭 핵심

| 위치                | API                                   | 설명                             |
| ------------------- | ------------------------------------- | -------------------------------- |
| 서버 컴포넌트       | `void queryClient.prefetchQuery(...)` | 렌더링 차단 안 함                |
| 서버 컴포넌트       | `await queryClient.fetchQuery(...)`   | 헤더/메타데이터용 데이터 필요 시 |
| 클라이언트 컴포넌트 | `useSuspenseQuery(queryOptions())`    | `useQuery` 말고 반드시 이걸 사용 |
| 래퍼                | `<HydrationBoundary>` + `<Suspense>`  | prefetch → stream 연결           |

## 금지사항

- ❌ 컴포넌트 내 직접 `fetch()` / Prisma 호출
- ❌ 컴포넌트 내 `useMutation({mutationFn: ...})` 인라인 정의 금지 → `api/mutations.ts`에 `mutationOptions`로 분리 후 spread 조합
- ❌ 쿼리 키 문자열 하드코딩 → 항상 쿼리 키 팩토리 사용
- ❌ `service.ts` 외부에서 `apiClient` 직접 호출

## Mutation 패턴 (권장)

```typescript
// api/mutations.ts — 공유 설정 (React 독립적)
import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';

export const createItemMutation = mutationOptions({
  mutationFn: (data: CreatePayload) => createItem(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: itemKeys.all });
  }
});

// 컴포넌트 — spread로 공유 설정 + UI 콜백 조합
import { useMutation } from '@tanstack/react-query';
import { createItemMutation } from '../api/mutations';

const mutation = useMutation({
  ...createItemMutation,
  onSuccess: () => {
    toast.success('생성 완료');
  }
});
```

> ⚠️ 컴포넌트의 `onSuccess`가 `mutationOptions`의 `onSuccess`를 덮어쓰므로, `invalidateQueries`가 필요한 경우 컴포넌트에서도 명시적으로 호출해야 한다.

## 임포트 경로

| 용도                          | 경로                    |
| ----------------------------- | ----------------------- |
| queryOptions, mutationOptions | `@tanstack/react-query` |
| useSuspenseQuery, useMutation | `@tanstack/react-query` |
| dehydrate, HydrationBoundary  | `@tanstack/react-query` |
| getQueryClient                | `@/lib/query-client`    |
| apiClient                     | `@/lib/api-client`      |
| searchParams (서버)           | `nuqs/server`           |
| useQueryStates (클라이언트)   | `nuqs`                  |
