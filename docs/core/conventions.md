# 엄격 코딩 규칙

1. 항상 `cn()`으로 className 병합 — 문자열 수동 연결 금지
2. 모듈 기반 구조:
   - 도메인 로직(API, 훅, 스키마, 도메인 의존 UI) → `src/modules/<name>/`
   - 도메인 무관 공통 UI(여러 모듈에서 재사용) → `src/components/`
   - 판단 기준: "이 모듈을 삭제해도 이 컴포넌트가 의미 있는가?"
   - 상세: [docs/architecture/component-guide.md](../architecture/component-guide.md)
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

## 외부 라이브러리 선정 원칙

신규 기능 구현 시 **자체 개발보다 검증된 외부 라이브러리 도입을 우선**한다.

### 선택 체크리스트

외부 라이브러리 도입 검토 시 아래 항목을 확인한다:

1. **신뢰성** — 다운로드 수, GitHub Stars, 유지보수 활성도, 최근 업데이트 일자
2. **호환성** — 현재 기술 스택(React/Next.js/Prisma) 버전과의 peer dependency 일치 여부
3. **통일성** — 기존 프로젝트 의존성과 기능 중복/충돌 여부 (`package.json` 확인)
4. **별개 수** — 라이브러리가 추가로 설치하는 하위 의존성 개수 및 크기
5. **라이선스** — MIT/Apache-2.0 등 상업적 사용에 제한 없는 라이선스
6. **번들 크기** — Tree-shaking 지원 여부, gzipped 크기 (via bundlephobia)
7. **대체재 비교** — 동일 기능을 제공하는 라이브러리가 2개 이상이면 위 체크리스트로 비교

### 결정 트리

```
기능 구현 필요
  ├── 검증된 외부 라이브러리 존재? (다운로드 100K+/Stars 5K+)
  │     ├── 예 → 호환성 체크리스트 통과? → 도입
  │     └── 아니오 → 자체 개발
  └── 외부 라이브러리 없음 → 자체 개발
```

> **예시**: react-grid-layout (23만/주, 80K+ stars, React ≥16.3) → 12열 그리드 대시보드에 도입  
> **반례**: 특수 Brocade 포트 네이밍 파서 → 자체 개발 (외부 라이브러리 부재)

### 도입 후

도입이 결정되면 아래 [외부 UI 라이브러리 통합 규칙](#외부-ui-라이브러리-통합-규칙)을 따른다.

---

## 외부 UI 라이브러리 통합 규칙

외부 라이브러리(react-day-picker, @dnd-kit, recharts 등)를 래핑할 때:

1. `cn()`으로 className 병합 필수 — 문자열 연결, 템플릿 리터럴, `!important` 접미사 금지
2. `data-slot='<component-name>'` 속성 부여 — shadcn/ui와 동일한 디버깅/선택자 패턴
3. CSS 변수 기반 색상 — 하드코딩(`bg-blue-500`) 대신 `bg-primary`, `text-muted-foreground` 사용
4. 아이콘은 `Icons.*`로 사용 — 외부 라이브러리 아이콘 직접 임포트 금지. 새 아이콘은 `icons.tsx`에 등록
5. `{...props}`로 나머지 props 전달 — `className`은 `cn()`으로, `ref`는 `forwardRef` 또는 `ref` prop으로
6. 필요한 타입만 `export type` 재익스포트 — 사용처에서 원본 라이브러리 import 방지
7. 접근성 기본: 아이콘 버튼 `aria-label`, 키보드 네비게이션, `focus-visible:ring-*`
8. `'use client'`는 브라우저 API/이벤트/React 훅 사용 시에만
9. 컴포넌트: 함수 선언문 `function Name() {}`, Props: `{Name}Props`
10. 래핑 깊이: 단순 스타일 통합=얇은 래퍼(1:1), 복잡한 상태/조합=두꺼운 래퍼(새 API)

## CLAUDE.md 로딩 정책
- 항상 로딩: 루트 CLAUDE.md에서 @import (총 200줄 이하)
- 컨텍스트 로딩: 디렉토리별 CLAUDE.md에서 @import
- 상세: [docs/core/loading-policy.md](../core/loading-policy.md) 참조
