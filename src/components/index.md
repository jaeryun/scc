# components/ — 공통 컴포넌트

## 디렉터리 용도

도메인 타입/로직에 의존하지 않는 범용 UI 컴포넌트. 어떤 프로젝트에 가져다 쓸 수 있는 순수 UI만 위치하며, 도메인 의존 컴포넌트는 `src/modules/<name>/` 에 배치한다.

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `ui/` | shadcn/ui 원본 컴포넌트 (직접 수정 금지, 확장만 허용) | shadcn, primitive |
| `charts/` | Recharts 래퍼 컴포넌트 | recharts, 시각화 |
| `layout/` | 애플리케이션 셸 (사이드바, 헤더, 페이지 컨테이너) | shell, sidebar, header |
| `forms/` | TanStack Form + Zod 폼 컴포넌트 및 필드 | form, validation, zod |
| `themes/` | OKLCH 테마 컴포넌트 및 레지스트리 | theme, oklch, color |
| `kbar/` | kbar 커맨드 팔레트 | command-palette, search |
| `icons/` | 아이콘 소스 파일 | icon, svg |
| `modal/` | 모달 컴포넌트 | modal, dialog |
| `icons.tsx` | 아이콘 레지스트리 — `@tabler/icons-react`를 시맨틱 키로 중앙 관리 | icon-registry |
| `breadcrumbs.tsx` | 경로 탐색 표시 | breadcrumb, navigation |
| `file-uploader.tsx` | 파일 업로드 컴포넌트 | upload, file |
| `form-card-skeleton.tsx` | 폼 카드 로딩 스켈레톤 | skeleton, loading |
| `github-stars-button.tsx` | GitHub Stars 버튼 | github, external-link |
| `nav-main.tsx` | 메인 내비게이션 | navigation, menu |
| `nav-projects.tsx` | 프로젝트 전환 내비게이션 | navigation, projects |
| `nav-user.tsx` | 사용자 메뉴 내비게이션 | navigation, user-menu |
| `search-input.tsx` | 검색 입력 필드 | search, input |
| `user-avatar-profile.tsx` | 사용자 아바타 및 프로필 표시 | avatar, profile |

## 포함 금지 항목

- 도메인 타입/로직에 의존하는 컴포넌트 — `src/modules/<name>/components/` 에 배치
- `src/modules/` 디렉토리 임포트 — `components/` 는 `modules/` 에 의존할 수 없음
