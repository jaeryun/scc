# 테마 패턴

<!-- 관련 Skills: shadcn (semantic colors), web-design-guidelines (theming)
     이 문서는 프로젝트 테마 토큰 사용 패턴만 기술합니다.
     OKLCH 이론, 색상 정의, 새 테마 추가 절차는 shadcn 공식 문서 참조. -->

> **현 상태 (2026-06-14):** OKLCH 기반 디자인 토큰은 이미 토큰화되어 `src/styles/`에 정의됨.
> 새 테마 추가 시 필요한 파일 구조/절차는 [shadcn themes 공식 가이드](https://ui.shadcn.com/docs/theming) 참조.
> 이 문서는 토큰을 **어떻게 사용하는지**만 다룬다.

## 테마 토큰 사용 (필수)

- 정적 색상 클래스(`text-red-500`, `bg-blue-600` 등) 절대 금지 — [styling.md](styling.md) 참조
- 항상 정의된 토큰 사용:
  - `bg-primary`, `text-primary-foreground`, `ring-primary/30`
  - `text-muted-foreground`, `text-muted-foreground/40`, `bg-muted/50`
  - `text-destructive`, `bg-destructive`
  - `text-warning`, `bg-warning/20`
  - `text-success`, `bg-success`
  - `text-info`, `bg-info`
  - `bg-card`, `bg-popover`
  - 차트: `text-[--chart-1]` ~ `text-[--chart-5]`

## 다크/라이트 모드 전환 (필수)

- `next-themes` 사용 (`src/components/themes/theme-provider.tsx`)
- 시스템 설정 따름: `defaultTheme="system"`
- 전환은 `useTheme()` 훅 경유, 직접 DOM 조작 금지
- 다크 모드 분기는 CSS 변수로 처리 (`dark:` 접두사 또는 `.dark` 셀렉터)

## 활성 테마 전환 (다중 테마 시스템)

- `useActiveTheme()` 훅 사용 — `src/components/themes/active-theme.tsx`
- 활성 테마는 `data-theme` 속성으로 `<html>`에 적용됨
- 사용자 선택은 쿠키(`active_theme`)에 영속화됨
- 모든 테마는 light/dark 두 변형을 모두 제공해야 함

## 새 토큰 추가 절차

1. `src/styles/globals.css`에 OKLCH 값 정의
2. `tailwind.config.ts`의 `theme.extend.colors`에 매핑
3. 이 문서의 "테마 토큰 사용" 섹션에 사용 예시 추가

## 새 테마 추가 (참조)

- 파일 위치: `src/styles/themes/<name>.css` (`[data-theme='<name>']` 셀렉터)
- 등록: `src/components/themes/theme.config.ts`의 `THEMES` 배열
- 기본값 변경: `theme.config.ts`의 `DEFAULT_THEME` 상수
- 폰트 추가: `src/components/themes/font.config.ts`
- light/dark 모드 모두 정의: `[data-theme='<name>']` + `[data-theme='<name>'].dark`
- Tailwind 통합: `@theme inline` 블록에 색상 매핑
- Scaled 변형은 자동 적용 (`.theme-scaled` 클래스) — 추가 CSS 불필요
- 상세 절차: [shadcn theming 가이드](https://ui.shadcn.com/docs/theming) 참조

## 필수 토큰 (최소)

새 테마는 다음을 반드시 정의:

- `--background`, `--foreground`
- `--card` & `--card-foreground`, `--popover` & `--popover-foreground`
- `--primary` & `--primary-foreground`
- `--secondary` & `--secondary-foreground`
- `--muted` & `--muted-foreground`
- `--accent` & `--accent-foreground`
- `--destructive` & `--destructive-foreground`
- `--border`, `--input`, `--ring`, `--radius`

선택: `--chart-1..5`, `--sidebar-*`, `--font-*`, `--shadow-*`, `--tracking-normal`

전체 예시: `src/styles/themes/claude.css` 참조.

## 금지 패턴

- ❌ 정적 색상 클래스 — [styling.md](styling.md) 참조
- ❌ 인라인 `style={{ color: '#...' }}` — 토큰 우선
- ❌ 다크 모드 분기를 JSX에서 (`theme === 'dark' ? ... : ...`) — CSS 변수로 처리
- ❌ 직접 `document.documentElement.classList` 조작 — `useTheme()` 경유
- ❌ 새 테마 등록 시 `THEMES` 배열과 CSS `data-theme` 값 불일치
