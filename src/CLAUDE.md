# src/ 소스코드 컨벤션

모든 공통 코딩 규칙은 @docs/core/conventions.md 및 @docs/rules/react.md 참조.

## 뷰 시스템
뷰 정의 → `src/config/views.ts`의 `ViewConfig` 배열. `getViewByPath(pathname)`로 현재 뷰 감지, `useCurrentView()`로 사이드바 동적 렌더링. 새 뷰는 `(main)/<view-id>/` 라우트 그룹에 추가.

## 테마 시스템
10개 내장 테마 (레지스트리: `src/components/themes/theme.config.ts`). CSS: `src/styles/themes/<name>.css`. 폰트: `src/components/themes/font.config.ts`. 사용자 변경은 `/settings/appearance`. → [docs/themes/cheat-sheet.md](../docs/themes/cheat-sheet.md)
