# Data layer rules

## Layer ordering (required)

Every API module must follow: `types.ts` -> `service.ts` -> `queries.ts` -> `hooks`.

- Components must never call `apiClient`/`fetch`/Prisma directly
- `mock-api` must never be imported directly
- `service.ts` is the single data access point (queries and mutations call it, never `apiClient` directly)
- If CRUD exists: `api/mutations.ts` required (defines `mutationOptions`, components import from it)

## Query keys (required)

- No hardcoded strings -- use key factories (`entityKeys.all/list/detail`)
- Form: `export const entityKeys = { all: ['entity'] as const, lists: () => [...entityKeys.all, 'list'] as const, detail: (id: string) => [...entityKeys.all, 'detail', id] as const };`

## Mutation pattern (required)

- Define with `mutationOptions` in `api/mutations.ts` -- no inline `useMutation({mutationFn: ...})` in components
- Components spread the shared options: `useMutation({ ...createMutation, onSuccess: () => { ... } })`
- `getQueryClient()` works on both SSR and client

## Data fetching strategy (required)

- Server prefetch + client hydration -> `useSuspenseQuery` (declarative loading, `<Suspense>` required)
- Conditional fetching (`enabled`), progressive rendering -> `useQuery` + `isLoading`/`isError` direct handling
- Server component prefetch: `void queryClient.prefetchQuery(...)` -- don't await, don't block rendering
