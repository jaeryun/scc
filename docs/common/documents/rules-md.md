# rules.md 작성 규칙

`.claude/rules/` 디렉터리의 프록시 파일 작성 규칙. rules 파일은 트리거 조건만 처리하고, 실제 규칙 본문은 `docs/`에 위임한다.

## 규칙

- [필수] `paths` 프론트매터 — 이 규칙이 적용될 파일 패턴 (glob). 하나 이상의 glob 패턴을 YAML 배열로 지정
- [필수] `@` 참조로 실제 규칙 문서를 로딩 — `docs/common/` 아래의 규칙 본문 파일을 가리킨다
- [금지] rules/ 파일에 규칙 본문을 직접 작성하지 않는다 — `docs/common/`에 위임
- [권장] rules/ 파일명은 참조하는 문서와 동일한 이름 사용 (예: `react.md` → `../../docs/common/development/react.md`)

## 템플릿

```markdown
---
paths:
  - "<glob pattern>"
---
@../../docs/common/documents/<target>.md
```

여러 glob 패턴이 필요한 경우:

```markdown
---
paths:
  - "**/queries.ts"
  - "**/mutations.ts"
  - "**/service.ts"
---
@../../docs/common/development/data-layer.md
```
