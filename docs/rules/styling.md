---
paths:
  - "**/*.{tsx,css}"
---

# 스타일링 규칙

- `cn()`으로 className 병합 필수 (Tailwind 충돌 방지)
- 반응형 mobile-first: `sm:` → `md:` → `lg:` 순서
- Tailwind v4 `@import 'tailwindcss'` 구문 사용
- `@apply` 지시문 사용 금지 (컴포넌트와 스타일 결합)
- 커스텀 CSS 최소화, Tailwind 유틸리티 우선
- 다크모드: `dark:` 접두사 사용
- OKLCH 색상 포맷: `oklch(lightness chroma hue)`
- 테마 CSS: `src/styles/themes/<name>.css`에 위치
- 전역 스타일: `src/styles/globals.css`에만 배치
