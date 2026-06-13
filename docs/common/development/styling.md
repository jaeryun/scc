# 스타일링 규칙

<!-- 관련 Skills: shadcn (UI 컴포넌트, semantic colors)
     이 문서는 프로젝트 고유 규칙만 기술합니다 (정적 색상 금지 등). -->

## className 병합 (필수)

- 모든 className 병합에 `cn()` 사용 -- 문자열 연결, 템플릿 리터럴, `!important` 접미사 금지

## 테마 색상만 사용 (필수)

- Tailwind 정적 색상 (`text-red-500`, `bg-blue-600` 등) **절대 금지**
- 항상 shadcn CSS 변수 토큰 사용:
  - 주요 요소: `bg-primary`, `text-primary-foreground`, `ring-primary/30`
  - 보조/비활성: `text-muted-foreground`, `text-muted-foreground/40`
  - 배경/호버: `bg-muted/50`, `hover:bg-muted/50`
  - 파괴적: `text-destructive`, `bg-destructive`
  - 경고: `text-warning`, `bg-warning/20`
  - 성공: `text-success`, `bg-success`
  - 정보: `text-info`, `bg-info`
  - 카드/팝오버: `bg-card`, `bg-popover`
  - 차트: `text-[--chart-1]` ~ `text-[--chart-5]`
  - 정적 색상→토큰 매핑: green → success, red → destructive, blue → primary, gray/zinc → muted / muted-foreground, amber → warning

## shadcn/ui (필수)

- `src/components/ui/` 직접 수정 금지 -- 확장만 허용
