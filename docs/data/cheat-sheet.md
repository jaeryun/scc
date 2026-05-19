# 데이터 패턴 — Cheat Sheet

> 빠른 참조용. 전체 가이드는 [data/patterns.md](./patterns.md) 및 [data/ipam-reference.md](./ipam-reference.md) 참조.

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
  detail: (id: string) => [...entityKeys.all, 'detail', id] as const,
};
```

## 데이터 페칭 핵심

| 위치 | API | 설명 |
|------|-----|------|
| 서버 컴포넌트 | `void queryClient.prefetchQuery(...)` | 렌더링 차단 안 함 |
| 서버 컴포넌트 | `await queryClient.fetchQuery(...)` | 헤더/메타데이터용 데이터 필요 시 |
| 클라이언트 컴포넌트 | `useSuspenseQuery(queryOptions())` | `useQuery` 말고 반드시 이걸 사용 |
| 래퍼 | `<HydrationBoundary>` + `<Suspense>` | prefetch → stream 연결 |

## 금지사항

- ❌ 컴포넌트 내 직접 `fetch()` / Prisma 호출
- ❌ 컴포넌트 내 `useMutation` 인라인 정의 → `mutations.ts` 또는 전용 훅으로 분리
- ❌ 쿼리 키 문자열 하드코딩 → 항상 쿼리 키 팩토리 사용
- ❌ `service.ts` 외부에서 `apiClient` 직접 호출

## 임포트 경로

| 용도 | 경로 |
|------|------|
| queryOptions, mutationOptions | `@tanstack/react-query` |
| useSuspenseQuery, useMutation | `@tanstack/react-query` |
| dehydrate, HydrationBoundary | `@tanstack/react-query` |
| getQueryClient | `@/lib/query-client` |
| apiClient | `@/lib/api-client` |
| searchParams (서버) | `nuqs/server` |
| useQueryStates (클라이언트) | `nuqs` |
