# 엄격 코딩 규칙

1. 항상 `cn()`으로 className 병합 — 문자열 수동 연결 금지
2. 모듈 기반 구조:
   - 도메인 로직(API, 훅, 스키마, 도메인 의존 UI) → `src/modules/<name>/`
   - 도메인 무관 공통 UI(여러 모듈에서 재사용) → `src/components/`
   - 판단 기준: "이 모듈을 삭제해도 이 컴포넌트가 의미 있는가?"
   - 상세: @docs/architecture/component-guide.md
3. 기본적으로 서버 컴포넌트 — 브라우저 API/React 훅 필요 시만 `'use client'`
4. 타입 안전성 우선 — `any` 금지, 명시적 타입 사용
5. 객체 정의에 `type`보다 `interface` 우선 — 병합/확장성 고려
6. 기존 패턴 따르기 — 유사 컴포넌트 먼저 확인 후 신규 생성
7. 환경 변수 — 클라이언트 사이드 접근엔 `NEXT_PUBLIC_` 접두사
8. shadcn 컴포넌트 — `src/components/ui/` 직접 수정 금지, 확장만
9. 아이콘 — `@/components/icons`에서만 임포트, `@tabler/icons-react` 직접 임포트 금지. 새 아이콘은 `icons.tsx`에 등록 → `Icons.keyName`으로 사용
10. 페이지 헤더 — `PageContainer` props (`pageTitle`, `pageDescription`, `pageHeaderAction`) 사용, `<Heading>` 직접 임포트 금지
11. 폼 — `useAppForm` + `useFormFields<T>()` 사용, `AppField` render props 내 `useState` 금지
12. 버튼 로딩 — `<Button isLoading={isPending}>` 사용, `SubmitButton`은 form 상태로 자동 처리
13. 데이터 계층 — `types.ts` → `service.ts` → `queries.ts` → `hooks` 순서. 컴포넌트에서 직접 `apiClient`/`fetch`/Prisma 호출 금지. mock-api 직접 임포트 금지
14. 쿼리 키 — 문자열 하드코딩 금지, 키 팩토리(`entityKeys.all/list/detail`) 사용
15. 뷰 시스템 — 새 뷰는 `src/config/views.ts` + `src/app/(views)/` 하위 라우트 그룹. 뷰 `id`는 라우트 세그먼트명과 일치
16. Prisma — `prisma db push` 단독 사용 금지, 마이그레이션 워크플로 (`migrate dev` → `generate` → `build`) 준수
17. API 에러 — `ZodError`(400)와 서버 에러(500) 구분, `apiClient`의 `res.ok` 체크 활용
18. 접근성 — 아이콘 전용 `<Button>`에 `aria-label`, 로딩 상태(`Skeleton`, `PageSkeleton`)에 `aria-hidden="true"`, 페이지당 단일 `<h1>`, Skip Link(`#main-content`) 제공
19. 포매팅 — 작은따옴표, JSX 작은따옴표, trailing comma 없음, 2칸 들여쓰기
20. 컴포넌트 정의 — 함수 선언문 `function ComponentName() {}`, Props 인터페이스: `{ComponentName}Props`
21. HydrationBoundary 패턴 — 서버 prefetch 후 `<HydrationBoundary state={dehydrate(queryClient)}>` + `<Suspense fallback>` 필수 조합, 단독 `Suspense`로 대체 금지
22. RBAC 내비게이션 — `nav-config.ts` 아이템 추가 시 `access` 속성 필수 (`requireOrg`, `permission`, `role`), 누락 시 무조건 노출됨
23. 에러 처리 강화 — `global-error.tsx`에 `<html>`/`<body>` 태그 필수 (레이아웃 없이 마운트됨), API 라우트에서 `ZodError`(400)와 서버 에러(500) 엄격 구분
24. apiClient headers — `options.headers`가 기본 `Content-Type: application/json`을 덮어쓰므로, `Content-Type` 변경이 필요할 때만 명시적 오버라이드
25. 메타데이터 — `page.tsx`마다 `Metadata` export 또는 `generateMetadata` 사용, SEO/OG 태그 필수
