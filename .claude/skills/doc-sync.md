---
name: doc-sync
description: >
  코드 변경 후 문서를 자동 현행화한다. AI는 기능 구현, 리팩터링, 설정 변경 등
  코드를 수정한 직후 반드시 이 스킬을 사용해야 한다. "문서 정리해줘", "docs 동기화해줘",
  "update docs", "sync documentation", "문서가 outdated 됐어" 등 문서 관련 요청 전반에서
  트리거된다. 커밋 전, PR 전, 작업 마무리 시점에도 항상 실행한다. 수동 /doc-sync 로도 호출 가능.
---

# doc-sync — 코드 변경 시 문서 자동 현행화

## 절차

### 1. 변경 파악

```bash
git diff --name-status origin/main..HEAD 2>/dev/null || git log --oneline --name-status -10
git status --porcelain
```

변경된 파일과 디렉토리 목록을 확보한다.
`docs/` 만 변경된 커밋뿐이면 스킵.

### 2. 규칙 로딩

`@docs/common/documents/general.md` 를 Read로 읽는다.
문서 배치, 형식, 언어, CLAUDE.md/index.md 역할 분리, views/common 경계 등
모든 판단 기준은 이 파일에 있다. 스킬 본문은 규칙을 중복 기술하지 않는다.

### 3. 문서 작업

변경과 docs.md 규칙을 대조해 필요한 작업 — 생성, 갱신, 삭제,
`src/` 하위 CLAUDE.md `@docs/...` 참조 수정 등 — 을 실행한다.

**문서화가 필요 없다고 판단되면** 굳이 만들지 않는다.

### 4. 검증

서브에이전트에게 검증을 위임한다. 서브에이전트는 general.md를 읽고 규칙을 숙지한 후
변경된 문서를 검증하고, 위반 사항을 보고만 한다 (직접 수정하지 않는다):

```
@docs/common/documents/general.md 를 읽고 그 규칙을 숙지한 후,
다음 파일들이 규칙을 위반한 부분이 있는지 검증하라:

<변경한 문서 파일 목록>

위반이 있으면 구체적인 위반 내용과 수정 방법을 보고하라.
모든 규칙을 지켰으면 응답 마지막 줄에 VERIFICATION: PASS 라고만 출력하라.
```

### 5. 피드백 반영

서브에이전트가 보고한 위반 사항을 하나씩 수정한다.
수정 후 변경 파일을 `git add` 하고, step 3에서 커밋을 만들었으면 `--amend`,
없었으면 새로 커밋한다.

### 6. 결과 보고

```
문서 현행화 완료
- 생성: docs/views/dcim/CLAUDE.md
- 갱신: docs/views/dcim/index.md
- 불필요: 코드 변경이 docs 규칙 대상 아님
```
