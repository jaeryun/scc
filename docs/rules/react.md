# React 규칙

- 함수 선언문으로 컴포넌트 정의: `function ComponentName() {}`
- Props 인터페이스: `{ComponentName}Props`
- `cn()`으로 className 병합
- 기본적으로 서버 컴포넌트, `'use client'`는 필요 시만
- `useSuspenseQuery` + `void prefetchQuery()` + `HydrationBoundary` 패턴
