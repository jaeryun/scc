# React 규칙

<!-- 관련 Skills: vercel-react-best-practices (React 19 hooks, 성능),
                  next-best-practices (RSC, error.tsx, metadata)
     이 문서는 프로젝트 고유 결정만 기술합니다. -->

## 컴포넌트 정의 (필수)

- `function ComponentName() {}` -- 함수 선언문, 화살표 함수 금지
- Props 인터페이스: `{ComponentName}Props`

## 서버/클라이언트 경계 (필수)

- 서버 컴포넌트 기본, 브라우저 API/이벤트/훅 필요 시에만 `'use client'`

## 데이터 페칭 (필수)

- 서버 prefetch + 클라이언트 hydration: `void queryClient.prefetchQuery(...)` + `<HydrationBoundary>` + `<Suspense fallback>`. 세 가지 모두 필수 조합.
- 조건부 페칭/enabled: `useQuery` + 명시적 `isLoading`/`isError` 처리

## 에러 바운더리 (필수)

- 모든 신규 라우트 그룹은 `error.tsx` + `loading.tsx` 모두 포함 필수
- 루트: `app/global-error.tsx` (`<html>`/`<body>` 포함 필수)
- `error.tsx`는 동일 세그먼트의 `layout.tsx` 에러를 잡지 못함 -- 필요 시 상위에 배치

## 페이지 규칙 (필수)

- `PageContainer` props (`pageTitle`, `pageDescription`, `pageHeaderAction`) -- `<Heading>` 직접 임포트 금지
- 모든 `page.tsx`에 `export const metadata: Metadata` 또는 `generateMetadata` 필수

## 버튼 로딩 (필수)

- 수동 버튼: `<Button isLoading={isPending}>`
- `<form.SubmitButton>`은 로딩/비활성화 상태 자동 처리

## 접근성 (필수)

- 아이콘 전용 `<Button>`: `aria-label` 필수
- 로딩 상태 (`Skeleton`, `PageSkeleton`): `aria-hidden="true"`
- 페이지당 단일 `<h1>`
- 모든 레이아웃에 Skip Link (`#main-content`) 제공
