# 공통 컴포넌트 컨벤션

컴포넌트 작성 규칙, shadcn, 접근성 → [@docs/core/conventions.md](../../docs/core/conventions.md) 참조.

## 디렉토리 구조
- `ui/` — shadcn 원본 (직접 수정 금지, 확장만)
- `layout/` — 레이아웃, 사이드바, 뷰 전환 → [layout/CLAUDE.md](layout/CLAUDE.md)
- `forms/` — TanStack Form + Zod → [@docs/forms/guide.md](../../docs/forms/guide.md)
- `themes/` — OKLCH 테마 → [@docs/themes/guide.md](../../docs/themes/guide.md)
- `icons.tsx` — 아이콘 레지스트리

## 아이콘 시스템
- 단일 진실 공급원: `src/components/icons.tsx`
- `@tabler/icons-react`에서 import → `Icons` 객체에 시맨틱 키로 등록
- 사용: `import { Icons } from '@/components/icons'` → `<Icons.search className='h-4 w-4' />`
- `@tabler/icons-react` 직접 임포트 금지
- 아이콘 쇼케이스: `/demo-components/elements/icons`
