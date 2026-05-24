# 공통 컴포넌트 컨벤션

컴포넌트 작성 규칙, shadcn, 접근성 → [docs/core/conventions.md](../../docs/core/conventions.md) 참조.
컴포넌트 배치 가이드 → @docs/architecture/component-guide.md

## 디렉토리 구조

- `ui/` — shadcn 원본 (직접 수정 금지, 확장만)
- `charts/` — Recharts 래퍼
- `kanban/` — dnd-kit 기반 칸반 UI
- `layout/` — 레이아웃, 사이드바, 뷰 전환 → [layout/CLAUDE.md](layout/CLAUDE.md)
- `forms/` — TanStack Form + Zod → [docs/forms/guide.md](../../docs/forms/guide.md)
- `themes/` — OKLCH 테마 → [docs/themes/guide.md](../../docs/themes/guide.md)
- `icons.tsx` — 아이콘 레지스트리

## 아이콘 시스템

- 단일 진실 공급원: `src/components/icons.tsx`
- `@tabler/icons-react`에서 import → `Icons` 객체에 시맨틱 키로 등록
- 사용: `import { Icons } from '@/components/icons'` → `<Icons.search className='h-4 w-4' />`
- `@tabler/icons-react` 직접 임포트 금지
- 아이콘 쇼케이스: `/demo-components/elements/icons`

### ⚠️ 카카오뱅크 브랜드 로고 (`Icons.kakaobank`)

- **일반 아이콘과 다름**: `currentColor` 대신 브랜드 지정 색상 하드코딩
- **수정 금지**: fill, stroke, viewBox, 비율 등 모든 변경 불가
- **출처**: 공식 브랜드 자산 (`Print_Symbol_Primary_Black.svg`, `Print_Symbol_Secondary_White.svg`)
- **사용처**: 사이드바 헤더 전용. 일반 UI 아이콘으로 사용 금지
- **색상 규칙**: 라이트(White bg + `#1d1d1d`), 다크(`#1E1E1E` bg + White)
- 파일: `src/components/icons/kakaobank-symbol.tsx` — 상단 주석에 전체 규칙 명시
