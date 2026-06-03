# 데이터 계층 규칙

## 계층 순서 (필수)

모든 API 모듈은 다음 순서를 따라야 함: `types.ts` → `service.ts` → `queries.ts` → `hooks`.

- 컴포넌트에서 `apiClient`/`fetch`/Prisma 직접 호출 금지
- `mock-api` 직접 임포트 금지
- `service.ts`는 단일 데이터 접근 지점 (쿼리와 뮤테이션이 service를 호출, 절대 `apiClient` 직접 호출 금지)
- CRUD 존재 시: `api/mutations.ts` 필수 (`mutationOptions` 정의, 컴포넌트에서 직접 임포트)

## 쿼리 키 (필수)

- 문자열 하드코딩 금지 -- 키 팩토리 사용 (`entityKeys.all/list/detail`)
- 형식: `export const entityKeys = { all: ['entity'] as const, lists: () => [...entityKeys.all, 'list'] as const, detail: (id: string) => [...entityKeys.all, 'detail', id] as const };`

## 뮤테이션 패턴 (필수)

- `api/mutations.ts`에 `mutationOptions`로 정의 -- 컴포넌트에서 인라인 `useMutation({mutationFn: ...})` 금지
- 컴포넌트는 공유 옵션을 spread: `useMutation({ ...createMutation, onSuccess: () => { ... } })`
- `getQueryClient()`는 SSR과 클라이언트 양쪽에서 동작

## 데이터 페칭 전략 (필수)

- 서버 prefetch + 클라이언트 hydration → `useSuspenseQuery` (선언적 로딩, `<Suspense>` 필수)
- 조건부 페칭 (`enabled`), 점진적 렌더링 → `useQuery` + `isLoading`/`isError` 직접 처리
- 서버 컴포넌트 prefetch: `void queryClient.prefetchQuery(...)` -- await 금지, 렌더링 차단 금지
