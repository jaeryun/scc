# documents/ — 문서 작성 규칙

@index.md

파일 유형별 작성 규칙과 템플릿을 담는 디렉터리.

## 규칙

### 추가해도 되는 것

- 새 파일 유형에 대한 규칙 문서 (`*.md`)

### 추가하면 안 되는 것

- AI 지침 — 규칙 본문만, 로딩 시점은 `.claude/rules/`가 담당

### 새 문서 유형 규칙 추가 절차

1. `documents/<type>.md` — 규칙 문서 작성
2. `.claude/rules/<type>.md` — 트리거 파일 생성 (`paths` 프론트매터 + `@` 참조)
3. `documents/index.md` — 구조 테이블에 추가
4. `scripts/doc-links.py` 실행 — 링크 상태 갱신
