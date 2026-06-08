---
name: doc-sync
description: Push 전 unpushed 변경사항을 분석해 docs/ 문서를 자동 현행화한다. 수동 /doc-sync 로도 실행 가능.
---

# doc-sync — Push 시점 자동 문서화

Push 전에 밀릴 커밋들(`git push`로 원격에 올라갈 모든 커밋)을 분석하여
`@docs/common/development/docs.md` 규칙에 따라 `docs/` 문서를 생성/갱신/삭제한다.

## 절차

### 0. 사전 점검

작업 트리의 docs/ 외 경로가 깨끗한지 확인:

```bash
git status --porcelain
```

출력된 모든 라인이 `docs/`로 시작하면 계속. 그 외 경로가 있으면 진행 중단하고 차단.

### 1. 밀릴 커밋 확인

```bash
# 원격 브랜치가 없으면 모든 커밋이 대상
git rev-parse --abbrev-ref @{push} 2>/dev/null && \
  git diff --name-status @{push}..HEAD || \
  git diff --name-status origin/main..HEAD 2>/dev/null || \
  git log --oneline --name-status HEAD
```

`docs/` 디렉토리만 변경된 커밋뿐이면 스킵. 밀릴 커밋이 없으면 스킵.

### 2. 문서 규칙 로딩

`@docs/common/development/docs.md`를 Read로 읽는다. 이 파일이 문서 배치, 형식, 규칙의 유일한 출처다.
스킬 본문에 규칙을 하드코딩하지 않고, 매 실행 시점에 읽어 최신 상태를 따른다.

### 3. 변경 분석 및 문서 작업

변경된 파일 목록과 docs.md 규칙을 대조하여 필요한 문서 작업을 판단하고 실행한다.
스킬은 판단과 실행만 담당하며, 배치 규칙은 docs.md에 위임한다.

**문서화가 필요 없다고 판단되면** 바로 승인한다.

### 4. 문서 변경 커밋

변경한 파일 목록을 변수로 기록해둔다. 문서 변경이 있을 때만:

```bash
git add <변경한 파일들> && git commit -m "docs: sync documentation"
```

변경이 없으면 `DOC_COMMITTED=false` 플래그만 기록하고 커밋 생략.

### 5. 검증 및 수정

서브에이전트를 호출하여 검증과 수정을 한 번에 수행한다:

```
prompt: "@docs/common/development/docs.md를 읽고 그 지침을 숙지한 후,
다음 파일들이 규칙을 위반한 부분이 있는지 검증하고, 위반이 있으면 직접 수정하라:

<변경한 문서 파일 목록>

규칙을 모두 지켰으면 응답 마지막 줄에 VERIFICATION: PASS 라고만 출력하라."
```

서브에이전트가 수정한 파일이 있으면:

```bash
git add <수정한 파일들>
```

그리고:
- Step 4에서 커밋을 생성했으면 `git commit --amend --no-edit`
- Step 4에서 커밋을 생성하지 않았으면 `git commit -m "docs: sync documentation"`

### 6. 결과 보고 및 push 승인/차단

Agent hook(prompt hook 포함)의 결정 형식에 맞춰 최종 응답을 반드시 JSON으로 출력한다.

**승인 시:**
```json
{"ok": true}
```

**차단 시:**
```json
{"ok": false, "reason": "docs/views/dcim/ 신규 모듈 문서 누락 — CLAUDE.md 생성 필요"}
```
