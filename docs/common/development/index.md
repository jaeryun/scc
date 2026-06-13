# development/ — 구조와 파일 목록

## 디렉터리 용도

모든 코드 작성 가이드. 하위 디렉토리 없는 플랫 구조.

## 파일 구분

파일명으로 성격을 구분한다:

| 파일명 패턴 | 성격 | 예시 |
|-------------|------|------|
| `*.md` (접미사 없음) | **규칙** — 반드시 지켜야 함, 위반 시 버그 또는 리뷰 거절 | `react.md`, `forms.md`, `naming.md` |
| `*-patterns.md` | **패턴** — 권장 접근법, 코드 예제, 복사해서 쓰는 템플릿 | `form-patterns.md`, `component-patterns.md` |

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `development/` | 코딩 규칙 + 구현 패턴 | 규칙, 패턴, 컨벤션 |
| `react.md` | React 컴포넌트 규칙 | React, 컴포넌트 |
| `typescript.md` | TypeScript 규칙 (확장됨) | TypeScript, 타입 |
| `styling.md` | 스타일링 규칙 | cn(), Tailwind, CSS |
| `naming.md` | 파일명/변수명 컨벤션 | 네이밍, kebab-case |
| `data-layer.md` | 데이터 페칭 계층 규칙 | service, queries, hooks |
| `forms.md` | TanStack Form + Zod 규칙 | 폼, TanStack, Zod |
| `prisma.md` | Prisma 스키마/마이그레이션 규칙 (확장됨) | Prisma, 스키마 |
| `server-actions.md` | Server Actions 규칙 | Server Actions, mutation |
| `state-management.md` | 상태 관리 규칙 (Zustand) | Zustand, store |
| `testing.md` | 테스팅 규칙 | Vitest, Playwright, TDD |
| `component-patterns.md` | 컴포넌트 배치/작성 패턴 | 컴포넌트, 패턴 |
| `data-patterns.md` | React Query 패턴 | React Query, 패턴 |
| `form-patterns.md` | 폼 패턴 인덱스 (4개 파일로 분할됨) | 폼, 패턴 |
| `form-setup-patterns.md` | 폼 설정 패턴 | useAppForm, 필드 어댑터 |
| `form-validation-patterns.md` | 폼 유효성 검사 패턴 | Zod, onBlur/onChange |
| `form-submission-patterns.md` | 폼 제출 패턴 | mutation, 토스트 |
| `form-sheet-dialog-patterns.md` | Sheet/Dialog 폼 패턴 | Sheet, Dialog, 외부 제출 |
| `theme-patterns.md` | 테마 패턴 (슬림화됨) | 테마, OKLCH |
| `first-feature.md` | 신규 입문자 IPAM 따라하기 | 입문, IPAM |
| `index.md` | 이 파일 — development/ 디렉터리 구조 | 인덱스 |
| `CLAUDE.md` | AI 에이전트 로딩 지침 | AI, 로딩 |

## 포함 금지 항목

- AI 지침 — 로딩 시점, 행동 규칙은 CLAUDE.md에서 관리
- 하위 디렉토리 — development/ 는 플랫 구조 유지
- 문서화 규칙 — `docs.md`가 삭제되고 [documents/](../documents/) 로 이동됨


<!-- LINK STATUS START -->
## 🔗 링크 상태

> ⚠️ `scripts/doc-links.py` 자동 생성 — 직접 수정 금지 · 2026-06-07 16:36 UTC

| 파일 | 피참조 |
|:-----|:-------|
| `component-patterns.md` | index.md, src/components/CLAUDE.md, src/modules/CLAUDE.md |
| `data-layer.md` | .claude/rules/data-layer.md, index.md, docs/common/foundation/conventions.md, src/modules/CLAUDE.md |
| `data-patterns.md` | index.md |
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
