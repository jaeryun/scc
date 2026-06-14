# foundation/ — 구조와 파일 목록

## 디렉터리 용도

SCC 프로젝트의 정체성, 제약, 아키텍처, 행동 원칙을 정의합니다.

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `foundation/` | 프로젝트 헌장 | 헌장, 정체성, 제약 |
| `project.md` | 프로젝트 개요, 기술 스택, 제약사항, 디렉터리 구조 | 프로젝트, 기술스택, 환경설정 |
| `architecture.md` | 모듈 기반 구조, 뷰 시스템, 데모/제품 경계, 컴포넌트 배치 | 아키텍처, 모듈, 뷰 |
| `behavior.md` | AI 행동 원칙 (구현 전, 중, 후) | 행동원칙, 구현, 검증 |
| `conventions.md` | 핵심 코딩 규칙 (cn(), 아이콘, tsc/build) | 규칙, cn, 아이콘 |
| `index.md` | 이 파일 — foundation/ 디렉터리 구조 | 인덱스 |
| `CLAUDE.md` | AI 에이전트 로딩 지침 | AI, 로딩 |

## 포함 금지 항목

- AI 지침 — 로딩 시점, 행동 규칙은 CLAUDE.md에서 관리
- 뷰별 문서 — [views/](../../views/) 에 배치



<!-- LINK STATUS START -->
## 🔗 링크 상태

> ⚠️ `scripts/doc-links.py` 자동 생성 — 직접 수정 금지 · 2026-06-14 09:20 UTC

| 파일 | 피참조 |
|:-----|:-------|
| `architecture.md` | CLAUDE.md, conventions.md |
| `behavior.md` | CLAUDE.md, conventions.md |
| `conventions.md` | CLAUDE.md, docs/common/development/component-patterns.md, prisma/CLAUDE.md, src/app/CLAUDE.md, src/app/api/CLAUDE.md, src/components/CLAUDE.md |
| `project.md` | CLAUDE.md |
| `index.md` | CLAUDE.md |
| `CLAUDE.md` | 🟢 auto-loading |
<!-- LINK STATUS END -->
