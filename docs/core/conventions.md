# 엄격 코딩 규칙

> **용법:** `[필수]` = 반드시 준수, 위반 시 PR 승인 불가. `[권장]` = 원칙적으로 따르되 예외 가능.

---

## 아키텍처

- [필수] **모듈 기반 구조**
  - 순수 UI, 어떤 도메인 타입도 직접 알 필요 없음 → `src/components/`
  - 특정 기능의 데이터(API/쿼리/훅) + 그 데이터를 표현하는 UI → `src/modules/<name>/`
  - → [component-guide.md](../architecture/component-guide.md)
- [필수] **뷰 시스템** — 새 뷰는 `src/config/views.ts` + `src/app/(views)/` 하위 라우트 그룹. 뷰 `id`는 라우트 세그먼트명과 일치
- [필수] **데이터 계층** — `types.ts` → `service.ts` → `queries.ts` → `hooks` 순서. 컴포넌트에서 직접 `apiClient`/`fetch`/Prisma 호출 금지. mock-api 직접 임포트 금지
- [필수] **RBAC 내비게이션** — `nav-config.ts` 아이템 추가 시 `access` 속성 필수 (`requireOrg`, `permission`, `role`), 누락 시 무조건 노출됨
- [권장] **기존 패턴 따르기** — 유사 컴포넌트가 이미 존재하는지 확인 후 신규 생성

## React & 컴포넌트

- [필수] **서버 컴포넌트 기본** — `'use client'`는 브라우저 API/이벤트/React 훅 필요 시에만
- [필수] **함수 선언문** `function ComponentName() {}`, Props: `{ComponentName}Props`
  - → [rules/react.md](../rules/react.md)
- [필수] **HydrationBoundary 패턴** — 서버 prefetch 후 `<HydrationBoundary state={dehydrate(queryClient)}>` + `<Suspense fallback>` 필수 조합. 단독 `Suspense`로 대체 금지
- [필수] **데이터 페칭 전략**
  - 서버 prefetch + client hydration → `useSuspenseQuery` (선언적 로딩, `<Suspense>` 필수)
  - 조건부 페칭(`enabled`), 점진적 렌더링 → `useQuery` + `isLoading`/`isError` 직접 처리
- [필수] **에러 바운더리**
  - 루트: `app/global-error.tsx` (치명적 에러, `<html>`/`<body>` 필수)
  - 페이지 단위: `page.tsx`와 동일 디렉토리에 `error.tsx`
  - ⚠️ `error.tsx`는 동일 세그먼트의 `layout.tsx` 에러를 잡지 못함 → 필요 시 상위 배치
- [필수] **페이지 헤더** — `PageContainer` props (`pageTitle`, `pageDescription`, `pageHeaderAction`) 사용, `<Heading>` 직접 임포트 금지
- [필수] **메타데이터** — `page.tsx`마다 `Metadata` export 또는 `generateMetadata` 사용

## TypeScript

- [필수] **`any` 금지** — 필요 시 `unknown` + 타입 가드 사용. 서드파티 제네릭 제약, TanStack Form + Zod 불일치 등은 `// @reason` 주석과 함께 예외 허용
- [권장] **객체 정의에 `interface` 우선** — 병합/확장성 고려. Union type, mapped type은 `type` 사용
- [필수] **환경 변수** — 클라이언트 접근만 `NEXT_PUBLIC_` 접두사. 비밀키는 절대 `NEXT_PUBLIC_` 사용 금지
- → [rules/typescript.md](../rules/typescript.md)

## UI & 스타일

- [필수] **`cn()`으로 className 병합** — 문자열 연결, 템플릿 리터럴, `!important` 접미사 금지
  - → [rules/styling.md](../rules/styling.md)
- [필수] **shadcn 컴포넌트** — `src/components/ui/` 직접 수정 금지, 확장만
- [필수] **아이콘** — `@/components/icons`에서만 임포트 (`@tabler/icons-react` 직접 임포트 금지). 새 아이콘은 `icons.tsx`에 등록 → `Icons.keyName` 사용
- [필수] **폼** — `useAppForm` + `useFormFields<T>()` 사용. `AppField` render props 내에서 폼 필드 상태 관리를 위한 `useState` 금지 (Sheet/모달 open 상태는 예외)
- [필수] **버튼 로딩** — `<Button isLoading={isPending}>` 사용, `SubmitButton`은 form 상태로 자동 처리
- [필수] **접근성** — 아이콘 전용 `<Button>`에 `aria-label`, 로딩 상태(`Skeleton`, `PageSkeleton`)에 `aria-hidden="true"`, 페이지당 단일 `<h1>`, Skip Link(`#main-content`) 제공
  - → [rules/react.md](../rules/react.md)
- [권장] **포매팅** — 작은따옴표, 2칸 들여쓰기. trailing comma 여부는 포매터(oxfmt) 설정에 위임

## API & 데이터

- [필수] **쿼리 키** — 문자열 하드코딩 금지, 키 팩토리(`entityKeys.all/list/detail`) 사용
- [필수] **API 에러 구분** — `ZodError`(400)와 서버 에러(500) 엄격 구분. `apiClient`의 `res.ok` 체크 활용. `global-error.tsx`는 `<html>`/`<body>` 태그 필수 (레이아웃 없이 마운트됨)
- [필수] **apiClient headers** — `options.headers`가 기본 `Content-Type: application/json`을 덮어쓰므로, `Content-Type` 변경이 필요할 때만 명시적 오버라이드
- [필수] **Prisma** — `prisma db push` **절대 금지** (기존 데이터 전량 삭제, migration 이력 파괴). 스키마 변경은 반드시 `prisma migrate dev` → `prisma generate` → `migrate deploy` 워크플로만 사용. DB 이관 시에도 `migrate deploy`만 허용.
  - → [rules/prisma.md](../rules/prisma.md)

## 네이밍 & Import

- [필수] **네이밍** — 파일 kebab-case, 컴포넌트 PascalCase, 훅 `use` 접두사
  - → [rules/naming.md](../rules/naming.md)
- [권장] **Import 순서** — ① Node built-in ② 외부 라이브러리 ③ `@/` 내부 모듈 ④ 상대 경로

## 상태 관리

- [필수] **상태 구분** — 서버 상태(CRUD 데이터)는 React Query, UI 상태(사이드바, 테마, 모달)는 Zustand, 지역 상태는 `useState`
- [필수] **URL 상태** — 필터/페이지네이션/정렬은 NUQS로 관리. `nuqs/server`(서버) + `useQueryStates`(클라이언트) 조합

---

## 외부 라이브러리 선정 원칙

신규 기능 구현 시 **자체 개발보다 검증된 외부 라이브러리 도입을 우선**한다.

### 선택 체크리스트

1. **신뢰성** — 주간 다운로드, GitHub Stars, 최근 커밋/릴리즈 일자, 메인테이너 수
2. **호환성** — 현재 기술 스택(React/Next.js/Prisma 등) 버전과 peer dependency 일치 여부
3. **통일성** — 기존 프로젝트 의존성과 기능 중복/충돌 여부, 추가되는 하위 의존성 개수
4. **번들 영향** — Tree-shaking 지원 여부, gzipped 크기. 폐쇄망은 `bunx bundle-buddy` 등 로컬 도구 활용
5. **라이선스** — MIT/Apache-2.0 등 상업적 사용에 제한 없는 라이선스
6. **대체재 비교** — 동일 기능을 제공하는 라이브러리가 2개 이상이면 위 체크리스트로 비교

### 결정 트리

```
기능 구현 필요
  ├── 검증된 외부 라이브러리 존재? (주간 50K+ 또는 Stars 1K+ AND 최근 3개월 내 커밋)
  │     ├── 예 → 호환성 체크리스트 통과? → 도입
  │     └── 아니오 → 자체 개발
  └── 외부 라이브러리 없음 → 자체 개발
```

> **예시**: react-grid-layout (23만/주, 80K+ stars, React ≥16.3) → 12열 그리드 대시보드에 도입  
> **반례**: 특수 Brocade 포트 네이밍 파서 → 자체 개발 (외부 라이브러리 부재)

### 도입 후

- **UI 라이브러리**: 아래 [외부 UI 라이브러리 통합 규칙](#외부-ui-라이브러리-통합-규칙) 적용
- **비UI 라이브러리**: `src/lib/`에 래퍼 모듈 작성, 전역 직접 import는 래퍼 내부로 제한

---

## 외부 UI 라이브러리 통합 규칙

## Tailwind / 스타일링

- [필수] **테마 색상만 사용** — `text-amber-500`, `text-blue-600` 등 Tailwind 정적 색상 **절대 금지**. 10개 내장 테마가 전환될 때 하드코딩된 색상은 전혀 반응하지 않아 UI가 깨짐. 항상 shadcn CSS 변수 기반 토큰 사용:
  - 주요 요소: `bg-primary`, `text-primary-foreground`, `ring-primary/30`
  - 보조/비활성: `text-muted-foreground`, `text-muted-foreground/40`
  - 배경/호버: `bg-muted/50`, `hover:bg-muted/50`
  - 강조/파괴: `text-destructive`, `bg-destructive`
  - 카드/팝오버: `bg-card`, `bg-popover`
  - 차트 구분: `text-[--chart-1]` ~ `text-[--chart-5]`
  - → [themes/cheat-sheet.md](../themes/cheat-sheet.md)
- [필수] **`cn()` 헬퍼** — `className`에 조건부 클래스 병합 시 `clsx` + `tailwind-merge` 사용
  ```tsx
  import { cn } from '@/lib/utils';
  <div className={cn('base', isActive && 'active', className)} />;
  ```

외부 라이브러리(react-grid-layout, react-day-picker, recharts 등)를 래핑할 때:

1. `data-slot='<component-name>'` 속성 부여 — shadcn/ui와 동일한 디버깅/선택자 패턴
2. CSS 변수 기반 색상 — 하드코딩(`bg-blue-500`) 대신 `bg-primary`, `text-muted-foreground` 사용
3. `{...props}`로 나머지 props 전달 — `className`은 `cn()`으로, React 19에서는 `ref`를 일반 prop으로 받음 (`forwardRef` 불필요)
4. 필요한 타입만 `export type` 재익스포트 — 사용처에서 원본 라이브러리 import 방지
5. 래핑 깊이 — 단순 스타일 통합: 얇은 래퍼(1:1 매핑). 복잡한 상태/조합: 두꺼운 래퍼(새 API 제공)
   - 얇은 예: `react-day-picker` → 스타일 + className만 주입
   - 두꺼운 예: `@dnd-kit` → Kanban 보드 (상태 관리 + 오버레이 + restrict)
6. 접근성 — 아이콘 버튼 `aria-label`, 키보드 네비게이션, `focus-visible:ring-*` (본문 규칙 재확인)

> 나머지 규칙(`cn()` 병합, 아이콘 `Icons.*`, `'use client'`, 함수 선언문 등)은 본문 규칙을 그대로 따른다.

---

## 정적 파일 (`public/`)

- [필수] **Public 디렉토리 용도** — `/` 경로로 서빙될 정적 자산만 배치
  - `robots.txt`, `sitemap.xml` — SEO 메타 파일 (Next.js 자동 감지)
  - `next.svg` — 기본 OG 이미지 폴백 (metadata에 명시적 설정이 없을 때 사용)
  - 폰트, 다운로드 파일, 외부 노출 필요한 정적 리소스
  - **금지**: 컴포넌트/타입/로직 파일, 번들되는 에셋 (`src/`로)
- [필수] **파비콘은 `src/app/`에** — `favicon.ico`, `icon.{png,svg}`, `apple-icon.png` 등 앱 아이콘은 `src/app/` 디렉토리에 배치 (Next.js App Router 컨벤션, `public/` 아님)
- [필수] **디렉토리 구조** — 3개 이하 파일이면 `public/` 평탄하게 유지. 많아지면 `public/<category>/` 구성
- [필수] **참조 방식** — 코드에서는 `public/` 접두사 없이 `/filename.ext` (절대 경로)로 참조. `<Image src="/logo.svg">`, `<a href="/downloads/manual.pdf">`. 상대 경로(`./`, `../`) 금지
- [필수] **폐쇄망 고려** — 외부 CDN/URL 리소스 대신 로컬 `public/` 파일 사용. Google Fonts, 외부 이미지 URL 사용 불가

## CLAUDE.md 로딩 정책

- 항상 로딩: 루트 CLAUDE.md에서 @import (총 200줄 이하)
- 컨텍스트 로딩: 디렉토리별 CLAUDE.md에서 @import
- → [loading-policy.md](../core/loading-policy.md)
