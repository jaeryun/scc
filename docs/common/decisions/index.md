# decisions/ — 구조와 파일 목록

## 디렉터리 용도

프로젝트 전반에 영향을 주는 아키텍처 결정을 시간 순으로 기록합니다.

## 작성 규칙

- 파일명: `adr-NNN-<kebab-case-title>.md`
- 각 ADR은 결정의 배경, 고려한 대안, 결정 사항, 결과를 포함
- 뷰별 결정은 `views/<view>/decisions/`에 별도 기록 가능

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `decisions/` | 아키텍처 결정 기록 (ADR) | ADR, 결정, 트레이드오프 |
| `index.md` | 이 파일 — decisions/ 디렉터리 구조 | 인덱스 |
| `CLAUDE.md` | AI 에이전트 로딩 지침 | AI, 로딩 |

## 포함 금지 항목

- AI 지침 — 로딩 시점, 행동 규칙은 CLAUDE.md에서 관리
- 뷰별 결정 — [views/<view>/decisions/](../../views/) 에 배치


<!-- LINK STATUS START -->
## 🔗 링크 상태

> ⚠️ `scripts/doc-links.py` 자동 생성 — 직접 수정 금지 · 2026-06-07 16:36 UTC

| 파일 | 피참조 |
|:-----|:-------|
| `index.md` | CLAUDE.md |
| `CLAUDE.md` | 🟢 auto-loading |
<!-- LINK STATUS END -->
