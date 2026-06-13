# development/ — 코딩 규칙 + 구현 패턴

모든 코드 작성 가이드. 하위 디렉토리 없는 플랫 구조.

## 파일 구분

파일명으로 성격을 구분한다. 두 종류만 존재:

| 파일명 패턴 | 성격 | 예시 |
|-------------|------|------|
| `*.md` (접미사 없음) | **규칙** — 반드시 지켜야 함, 위반 시 버그 또는 리뷰 거절 | `react.md`, `forms.md`, `naming.md` |
| `*-patterns.md` | **패턴** — 권장 접근법, 코드 예제, 복사해서 쓰는 템플릿 | `form-patterns.md`, `component-patterns.md` |

## 규칙 (필수 준수, 위반 시 버그/리뷰 거절)

- [react.md](react.md) — React 컴포넌트 규칙
- [typescript.md](typescript.md) — TypeScript 규칙
- [styling.md](styling.md) — 스타일링 규칙 (cn(), Tailwind, CSS)
- [naming.md](naming.md) — 파일명/변수명 컨벤션
- [data-layer.md](data-layer.md) — 데이터 페칭 계층 (service → queries → hooks)
- [forms.md](forms.md) — TanStack Form + Zod 규칙
- [prisma.md](prisma.md) — Prisma 스키마/마이그레이션 규칙
- [docs.md](docs.md) — 문서화 규칙

## 패턴 (권장 접근법, 복사해서 시작할 템플릿)

- [component-patterns.md](component-patterns.md) — 컴포넌트 배치/작성 패턴
- [data-patterns.md](data-patterns.md) — React Query 패턴
- [form-patterns.md](form-patterns.md) — TanStack Form 패턴
- [theme-patterns.md](theme-patterns.md) — OKLCH 테마 패턴
- [first-feature.md](first-feature.md) — 신규 입문자 IPAM 따라하기


<!-- LINK STATUS START -->
## 🔗 링크 상태

> ⚠️ `scripts/doc-links.py` 자동 생성 — 직접 수정 금지 · 2026-06-07 16:36 UTC

| 파일 | 피참조 |
|:-----|:-------|
| `component-patterns.md` | index.md, src/components/CLAUDE.md, src/modules/CLAUDE.md |
| `data-layer.md` | .claude/rules/data-layer.md, index.md, docs/common/foundation/conventions.md, src/modules/CLAUDE.md |
| `data-patterns.md` | index.md |
| `docs.md` | .claude/rules/docs.md, index.md, docs/common/index.md |
| `first-feature.md` | index.md |
| `form-patterns.md` | index.md, src/components/CLAUDE.md |
| `forms.md` | .claude/rules/forms.md, index.md, docs/common/foundation/conventions.md, src/modules/CLAUDE.md |
| `naming.md` | .claude/rules/naming.md, index.md, docs/common/foundation/conventions.md |
| `prisma.md` | .claude/rules/prisma.md, index.md, docs/common/foundation/conventions.md |
| `react.md` | .claude/rules/react.md, index.md, docs/common/foundation/conventions.md, src/CLAUDE.md |
| `styling.md` | .claude/rules/styling.md, index.md, docs/common/foundation/conventions.md |
| `theme-patterns.md` | index.md, src/CLAUDE.md, src/components/CLAUDE.md |
| `typescript.md` | .claude/rules/typescript.md, index.md, docs/common/foundation/conventions.md |
| `index.md` | CLAUDE.md |
| `CLAUDE.md` | 🟢 auto-loading |
<!-- LINK STATUS END -->
