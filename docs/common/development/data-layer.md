# 데이터 계층 규칙

<!-- 관련 Skills: next-best-practices/data-patterns.md (RSC),
                  vercel-react-best-practices/server-*.md (서버 캐싱/액션)
     이 문서는 프로젝트 계층 구조(types → service → queries → hooks)와 규칙만 기술합니다. -->

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

## Server Actions (필수)

- Server Actions은 `service.ts`에 동거 또는 `api/actions.ts`에 별도 파일로 분리
- 호출 지점:
  - Server Component: 직접 호출 (await)
  - Client Component: `useActionState` (React 19) 또는 `mutationOptions` 경유
- 유효성 검사: Zod 스키마 + Server Action 내부 `schema.parse()` (예외는 표준 에러 객체로 변환)
- 재검증: 변경 mutation 성공 시 `revalidatePath` 또는 `revalidateTag` 호출
- 보안: Skills `vercel-react-best-practices/rules/server-auth-actions.md` (CRITICAL) 참조 — 인증/인가를 Action 내부에서 검증
