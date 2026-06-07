# development/ — 코딩 규칙 + 구현 패턴

모든 코드 작성 가이드를 담습니다. 구현 중이거나 규칙 위반 시 로딩됩니다.

**플랫 구조 — 하위 디렉토리 생성 금지.** 파일명으로 성격을 구분합니다.

## 파일 목록

### 규칙 (반드시 지켜야 함, 위반 시 버그/리뷰 거절)

- `react.md` — React 컴포넌트 규칙
- `typescript.md` — TypeScript 규칙
- `styling.md` — 스타일링 규칙 (cn(), Tailwind, CSS)
- `naming.md` — 파일명/변수명 컨벤션
- `data-layer.md` — 데이터 페칭 계층 규칙 (service → queries → hooks)
- `forms.md` — TanStack Form + Zod 규칙
- `prisma.md` — Prisma 스키마/마이그레이션 규칙
- `docs.md` — 문서화 규칙 (이 파일)

### 패턴 (권장 접근법, 코드 예제, 복사해서 시작할 템플릿)

- `component-patterns.md` — 컴포넌트 배치/작성 패턴
- `data-patterns.md` — React Query 패턴
- `form-patterns.md` — TanStack Form 패턴
- `theme-patterns.md` — OKLCH 테마 패턴
- `first-feature.md` — 신규 입문자 IPAM 따라하기

> 구조와 파일 목록은 `@docs/common/development/index.md` 참조.
