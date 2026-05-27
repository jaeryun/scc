# 테마 시스템 — Cheat Sheet

> 빠른 참조용. 전체 가이드는 [themes/guide.md](./guide.md) 참조.

## 🚨 정적 색상 금지

`text-amber-500`, `bg-blue-600` 등 Tailwind 정적 색상은 10개 테마 전환 시 반응하지 않아 UI 파괴. **항상 CSS 변수 기반 토큰 사용:**

| 목적        | 토큰                                                |
| ----------- | --------------------------------------------------- |
| 주요 강조   | `bg-primary`, `text-primary`, `ring-primary/30`     |
| 보조/비활성 | `text-muted-foreground`, `text-muted-foreground/40` |
| 배경/호버   | `bg-muted/50`, `hover:bg-muted/50`                  |
| 파괴적 액션 | `text-destructive`, `bg-destructive`                |
| 카드/팝오버 | `bg-card`, `bg-popover`                             |
| 차트 구분   | `text-[var(--chart-1)]` ~ `text-[var(--chart-5)]`    |

## OKLCH 형식

`oklch(L C H)` — L:0~1(밝기), C:0+(채도), H:0~360(색상)

## 테마 추가 5단계

| 순서 | 파일                                     | 작업                            |
| ---- | ---------------------------------------- | ------------------------------- |
| 1    | `src/styles/themes/<name>.css`           | `[data-theme='name']` CSS 정의  |
| 2    | `src/styles/theme.css`                   | `@import './themes/<name>.css'` |
| 3    | `src/components/themes/theme.config.ts`  | `THEMES` 배열에 등록            |
| 4    | `src/components/themes/font.config.ts`   | 커스텀 폰트 필요 시만           |
| 5    | `src/components/themes/active-theme.tsx` | 기본값 변경 원할 시만           |

## 필수 토큰

`--background, --foreground, --card, --primary, --muted, --border, --ring, --radius`

## 기본값 변경

```typescript
// src/components/themes/theme.config.ts
export const DEFAULT_THEME = 'your-theme-name';
```

## `--chart-*` vs 기본 토큰 선택 가이드

| 상황                        | 사용할 토큰                 | 이유                               |
| --------------------------- | --------------------------- | ---------------------------------- |
| 주요 액션/강조 (blue-ish)   | `--chart-1`                 | 모든 테마에서 primary 계열         |
| 성공/활성 상태 (green)      | `--chart-2`                 | 모든 테마에서 green 계열           |
| 중간/정보 상태 (orange)     | `--chart-3`                 | 모든 테마에서 orange 계열          |
| 경고 (amber/yellow)         | `--chart-4`                 | 모든 테마에서 amber 계열           |
| 보조/기타 (purple)          | `--chart-5`                 | 모든 테마에서 purple 계열          |
| 파괴적 액션 (red)           | `bg-destructive`, `text-destructive` | shadcn 기본 토큰, 테마 불문 일관 |
| 보조/비활성 텍스트          | `text-muted-foreground`     | shadcn 기본 토큰                   |

> `--chart-1~5`는 모든 10개 내장 테마의 `[data-theme]` 블록에 각각 정의되어 있어 테마 전환 시 자동으로 색상이 변경됨. 커스텀 시맨틱 토큰(`--success`, `--warning` 등)은 `@theme inline` 블록에 추가해도 `[data-theme]` 셀렉터 내부가 아니면 테마 전환 시 반응하지 않아 사용 금지.
