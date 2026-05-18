# 공통 컴포넌트 컨벤션

컴포넌트 작성 규칙은 [.claude/rules/react.md](../../.claude/rules/react.md)와 [.claude/rules/conventions.md](../../.claude/rules/conventions.md)를 따릅니다.

## 아이콘 시스템
- 단일 진실 공급원: `src/components/icons.tsx`
- `@tabler/icons-react`에서 import → `Icons` 객체에 시맨틱 키로 등록
- 사용: `import { Icons } from '@/components/icons'` → `<Icons.search className='h-4 w-4' />`
- `@tabler/icons-react` 직접 임포트 금지
- 아이콘 쇼케이스: `/demo-components/elements/icons`

## shadcn/ui 기본 규칙
- `src/components/ui/` — shadcn 원본 컴포넌트, 직접 수정 금지
- 스타일/동작 변경은 래퍼 컴포넌트나 확장 패턴으로 처리
- 새 shadcn 컴포넌트 추가: `npx shadcn add <component-name>`
- 컴포넌트별 의존성은 shadcn CLI가 자동 처리

## 접근성
- 아이콘 전용 버튼은 `aria-label` 필수:
  ```tsx
  <Button variant='ghost' size='icon' aria-label='검색'><Icons.search /></Button>
  ```
- 로딩 상태 표시 요소에 `aria-hidden='true'`:
  ```tsx
  <Skeleton className='h-4 w-[250px]' aria-hidden='true' />
  <PageSkeleton aria-hidden='true' />
  ```
- 페이지당 단일 `<h1>` 유지 (`PageContainer`의 `pageTitle`이 자동 처리)

## 하위 디렉토리별 컨벤션
- `layout/` → [layout/CLAUDE.md](layout/CLAUDE.md) — 레이아웃, 사이드바, 뷰 전환
- `forms/` → [docs/forms.md](../../docs/forms.md) — TanStack Form + Zod 폼 시스템
- `themes/` → [docs/themes.md](../../docs/themes.md) — OKLCH 테마 시스템
- `ui/` — shadcn 원본, 별도 컨벤션 불필요
