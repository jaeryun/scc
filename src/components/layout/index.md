# layout/ — 레이아웃 컴포넌트

## 디렉터리 용도

애플리케이션 셸(shell)을 구성하는 레이아웃 컴포넌트. 사이드바, 헤더, 페이지 컨테이너, 프로바이더 래퍼 등 화면 구조를 담당하며, `src/config/views.ts` 기반 뷰 전환 시스템과 연동된다.

## 디렉터리 구조

| 파일 | 용도 | 키워드 |
|------|------|--------|
| `app-sidebar.tsx` | shadcn Sidebar 기반 메인 사이드바 — 뷰 전환 드롭다운, navItems 렌더링, 사용자 메뉴 | sidebar, view-selector, navigation |
| `client-sidebar-nav.tsx` | `useCurrentView()` 래퍼 — 현재 뷰 감지 후 `SidebarNav`에 props 전달 | client-component, view-detection |
| `header.tsx` | 상단 고정 헤더 — SidebarTrigger, Breadcrumbs, SearchInput, ThemeToggle | header, sticky, search |
| `info-sidebar.tsx` | `useInfobar()` 기반 우측 정보 패널 | infobar, side-panel |
| `page-container.tsx` | 페이지 콘텐츠 표준 래퍼 — 로딩/접근제어/헤더 통합 | page-wrapper, loading, access-control |
| `providers.tsx` | 테마 + Query 프로바이더 중첩 래퍼 | provider, theme, query |
| `query-provider.tsx` | React Query 싱글톤 QueryClient 프로바이더 | react-query, cache |
| `sidebar-nav.tsx` | `NavItem[]` props를 받는 순수 사이드바 내비게이션 렌더링 | navigation, nav-items |
| `sidebar-shell.tsx` | 구식 단순 `<aside>` 사이드바 래퍼 (shadcn Sidebar 도입 전) | sidebar, legacy |
| `user-nav.tsx` | 독립형 사용자 드롭다운 메뉴 | user-menu, dropdown |

## 포함 금지 항목

- 페이지 단독으로 사용하는 레이아웃 — 각 뷰 `app/(main)/<view-id>/` 에서 자체 정의
- 도메인 데이터에 의존하는 레이아웃 로직 — 해당 모듈의 `components/` 로 이동
