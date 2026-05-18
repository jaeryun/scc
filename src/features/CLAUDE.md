# 기능 모듈 컨벤션

## API 계층 구조

```
src/features/<name>/api/
  types.ts      ← 응답 타입, 필터, 페이로드
  service.ts    ← 데이터 액세스 (백엔드 교체 시 이 파일만 수정)
  queries.ts    ← React Query 옵션 + 쿼리 키 팩토리
  mutations.ts  ← mutationOptions + 캐시 무효화 (선택)
```

- 모든 데이터는 `service.ts`를 통해서만 접근. 컴포넌트/훅에서 `fetch`, `apiClient`, DB 직접 호출 금지.
- `service.ts`는 백엔드 교체의 **유일한 지점**: mock → Route Handlers → External API 전환 시 이 파일만 수정.

## 쿼리 키 팩토리

```typescript
export const entityKeys = {
  all: ['entity-name'] as const,
  lists: () => [...entityKeys.all, 'list'] as const,
  detail: (id: string) => [...entityKeys.all, 'detail', id] as const
};
```

- 문자열 하드코딩 금지, 항상 키 팩토리 변수로 참조.
- `all` 키: 뮤테이션 성공 시 `invalidateQueries` 용도.

## 데이터 페칭

- 신규 페이지: `void prefetchQuery`(서버) + `useSuspenseQuery`(클라이언트) + `HydrationBoundary` + `Suspense`.
- `await prefetchQuery` 금지, 신규 페이지에 `useQuery` 금지.

## 뮤테이션

- `api/mutations.ts`에 `mutationOptions`로 분리 → `useMutation(mutationOptions)`.
- 간단 케이스: `hooks/use-<name>-mutations.ts`에 인라인 (컴포넌트 내 직접 정의 금지).

## 폼

- `useAppForm` + `useFormFields<T>()` (TanStack Form + Zod)
- 스키마: `schemas/<name>.ts`(복잡) 또는 `schemas.ts`(스키마 2~3개)
- `AppField` render props 내 `useState` 금지, `SubmitButton`은 `isSubmitting` 자동 처리

## 훅

- 쿼리: `use-<name>s.ts` — `useQuery` 또는 `useSuspenseQuery` 래핑
- 뮤테이션: `use-<name>-mutations.ts` — `useMutation` + `useQueryClient`

## 안티패턴

| 금지 | 올바른 방법 |
|------|-----------|
| 컴포넌트에서 `fetch`/`apiClient` 직접 호출 | `queries.ts → service.ts` 경로로만 |
| 쿼리 키 문자열 하드코딩 | `entityKeys.all/lists/detail` |
| `useMutation` 인라인 정의 | `mutations.ts` 또는 `use-*-mutations.ts` |
| `api/types.ts` 생략 | `types.ts`에 모든 타입 정의 |
| 신규 페이지에 `useQuery` | `useSuspenseQuery` |
| `await prefetchQuery` | `void prefetchQuery` |
