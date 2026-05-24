# 레이아웃 컴포넌트 컨벤션

## 개요

`src/components/layout/` — 애플리케이션 셸(shell)을 구성하는 컴포넌트들. 사이드바, 헤더, 페이지 컨테이너, 프로바이더 래퍼.

## 뷰 기반 내비게이션

모든 내비게이션은 `src/config/views.ts`의 `ViewConfig` 배열을 기준으로 동작:

```
views.ts → useCurrentView() → navItems 렌더링
```

- **`useCurrentView()`** (`src/hooks/use-current-view.ts`): URL pathname에서 현재 뷰 감지
- **`getViewByPath(pathname)`** (`views.ts`): pathname → ViewConfig 매핑
- 새 뷰 추가 시 `views.ts`의 `views` 배열에 `ViewConfig` 등록 → 자동으로 사이드바에 반영

### 뷰 전환 메커니즘

- `AppSidebar` 상단: 카카오뱅크 로고 고정 (브랜드 가이드 준수 — 라이트: White 배경 + Black 심볼, 다크: Black 배경 + White 심볼)
- `AppSidebar` 상단 드롭다운: `views` 배열 전체를 순회하며 `router.push('/<view-id>')`로 전환
- 현재 뷰 감지 실패 시(`useCurrentView()` → `undefined`): `views[0]`로 폴백
- 뷰 드롭다운 아이콘: `views.ts` 기본값 사용 (DB 오버라이드 없음)

## 컴포넌트 구조

### AppSidebar (`app-sidebar.tsx`)

- `'use client'` — 클라이언트 컴포넌트
- shadcn `Sidebar` 기반, `collapsible='icon'`
- **hydrate 불일치 방지**: `mounted` state로 초기 렌더 시 로딩 스켈레톤 표시
- **상단 로고**: 카카오뱅크 심볼 고정 (`Icons.kakaobank`) — 뷰 전환과 무관

  #### ⚠️ 카카오뱅크 로고
  - `Icons.kakaobank` 사용 — 브랜드 가이드 엄격 적용
  - 색상 규칙: 라이트(White bg + `#1d1d1d`), 다크(`#1E1E1E` bg + White)
  - 상세 규칙 → [components/CLAUDE.md](../CLAUDE.md#⚠️-카카오뱅크-브랜드-로고-iconskakaobank)

- **뷰 전환 드롭다운**: `DropdownMenu` + `views` 배열 순회
- **내비게이션 아이템**: `useCurrentView()` → `effectiveView.navItems` → `SidebarMenuButton`
- **사용자 메뉴**: 하단 `SidebarFooter`에 `mockUser` 기반 유저 드롭다운
- 실제 유저 도입 시 `mockUser`를 Clerk/Auth 세션으로 교체 필요

### AppSidebar ↔ SidebarNav ↔ ClientSidebarNav 관계

```
AppSidebar (뷰 전환 + navItems 직접 렌더링)
  └── (독립적, AppSidebar 내에서 navItems 직접 매핑)

ClientSidebarNav (useCurrentView 래퍼)
  └── SidebarNav (순수 nav 렌더링)
```

- `SidebarNav`는 `NavItem[]` props만 받는 순수 UI 컴포넌트
- `ClientSidebarNav`는 `useCurrentView()`로 뷰 감지 후 `SidebarNav`에 전달
- `AppSidebar`는 자체적으로 `useCurrentView()`를 호출하며, 더 풍부한 UI (아이콘, 툴팁 등)

### PageContainer (`page-container.tsx`)

- 페이지 콘텐츠의 표준 래퍼 — 모든 페이지가 이 컴포넌트로 감싸짐
- **Props 시그니처**:
  ```tsx
  {
    children: React.ReactNode;
    isLoading?: boolean;        // true → 스켈레톤 표시
    access?: boolean;           // false → 접근 거부 메시지
    accessFallback?: React.ReactNode; // 커스텀 거부 UI
    pageTitle?: string;         // <Heading>으로 렌더링
    pageDescription?: string;   // <Heading> 부제목
    infoContent?: InfobarContent; // InfoSidebar 데이터
    pageHeaderAction?: React.ReactNode; // 우측 액션 버튼 영역
  }
  ```
- **isLoading**: `true`일 때 `PageSkeleton` (애니메이트 펄스) 표시
- **access**: `false`일 때 접근 거부 메시지 또는 `accessFallback` 표시
- **헤더 영역**: `pageTitle`이나 `pageHeaderAction` 중 하나라도 있으면 `<Heading>` + 액션 버튼 영역 렌더링
- 페이지 헤더는 `PageContainer` props로 통일 — 별도 `<h1>` 사용 금지

### Header (`header.tsx`)

- 서버 컴포넌트 (클라이언트 훅 없음)
- `sticky top-0` + `backdrop-blur-md` — 스크롤 시 고정
- 좌측: `SidebarTrigger` | `Separator` | `Breadcrumbs`
- 우측: `SearchInput`(md+) | `ThemeModeToggle` | `ThemeSelector`(sm+) | `NotificationCenter`

### Providers (`providers.tsx` + `query-provider.tsx`)

- `'use client'` — 클라이언트 컴포넌트
- **중첩 순서**: `ActiveThemeProvider` > `QueryProvider` > `children`
- `QueryProvider`: `getQueryClient()`로 싱글톤 QueryClient 제공 + `ReactQueryDevtools`

### SidebarShell (`sidebar-shell.tsx`)

- 서버 컴포넌트
- 단순 `<aside>` 래퍼: `w-64`, `border-r`, `bg-background`, `h-screen`, `flex flex-col`
- 구식 사이드바 레이아웃에서 사용 (shadcn Sidebar 도입 전)

### InfoSidebar (`info-sidebar.tsx`)

- `'use client'` — `useInfobar()` 훅 사용
- `Infobar` + `InfobarTrigger` 기반 우측 정보 패널
- `PageContainer`의 `infoContent` prop을 통해 데이터 주입

### UserNav (`user-nav.tsx`)

- `'use client'` — `useRouter()` 사용
- 독립형 사용자 드롭다운 (AppSidebar 하단과 별개)
- 간소화된 프로필 메뉴

## 새 레이아웃 컴포넌트 추가 시 체크리스트

1. 서버/클라이언트 컴포넌트 판단 (`'use client'` 필요 여부)
2. `views.ts` 의존성 확인 — 새 뷰 추가면 `views` 배열에 등록
3. `Icons` 레지스트리에 새 아이콘 필요한지 확인
4. 접근성: `role`, `aria-label` 적절히 설정
