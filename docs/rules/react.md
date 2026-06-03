# React rules

## Component definition (required)

- `function ComponentName() {}` -- function declarations, no arrow functions
- Props interface: `{ComponentName}Props`

## Server/client boundary (required)

- Server components by default, `'use client'` only when browser APIs/events/hooks needed

## Data fetching (required)

- Server prefetch + client hydration: `void queryClient.prefetchQuery(...)` + `<HydrationBoundary>` + `<Suspense fallback>`. All three required together.
- Conditional fetching/enabled: `useQuery` + explicit `isLoading`/`isError` handling

## Error boundaries (required)

- Every new route group must include both `error.tsx` + `loading.tsx`
- Root: `app/global-error.tsx` (must include `<html>`/`<body>`)
- `error.tsx` does NOT catch errors in same-segment `layout.tsx` -- place higher if needed

## Page conventions (required)

- `PageContainer` props (`pageTitle`, `pageDescription`, `pageHeaderAction`) -- never import `<Heading>` directly
- `export const metadata: Metadata` or `generateMetadata` on every `page.tsx`

## Button loading (required)

- `<Button isLoading={isPending}>` for manual buttons
- `<form.SubmitButton>` auto-handles loading/disable states

## Accessibility (required)

- Icon-only `<Button>`: `aria-label` required
- Loading states (`Skeleton`, `PageSkeleton`): `aria-hidden="true"`
- Single `<h1>` per page
- Skip Link (`#main-content`) on every layout
