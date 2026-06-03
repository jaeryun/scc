# docs/ 문서 체계 전면 재정비 설계

**작성일**: 2026-06-04
**상태**: 승인됨

---

## 1. 배경

### 1.1 문제

- `docs/core/conventions.md` 하나가 아키텍처/React/TypeScript/UI/API/데이터/네이밍 200줄 — 너무 길고 업계 표준과 SCC 고유 규칙이 뒤섞임
- `docs/superpowers/specs/`, `docs/review/`, `docs/audits/`, `docs/research/` 등 과거 작업 산출물이 살아있는 문서와 섞여 AI가 outdated 문서를 참조할 위험
- 문서 간 outdated 경로 (`(views)` → `(main)`, 모듈 경로)가 누적
- code → docs 순서로 작업해와서 문서가 코드를 따라가지 못함
- `.claude/rules/`와 `docs/rules/` 중복

### 1.2 목표

- AI 에이전트가 표준적인 코드를 생성할 수 있는 문서 체계
- 살아있는 문서만 AI에게 노출, 과거 기록은 완전히 분리
- 1규칙 1파일 — 필요한 규칙만 골라 읽을 수 있게
- 코드 변경 시 문서화를 강제하지 않고, 할 수 있는 환경 조성

---

## 2. 새 디렉토리 구조

```
docs/
├── README.md
├── CLAUDE.md                        ← docs/ 전체 개요 + 인덱스
├── core/                            ← 프로젝트 헌법 (항상 로딩)
│   ├── CLAUDE.md
│   ├── project.md
│   ├── architecture.md              ← 신규: 뷰 시스템, 모듈 구조, Demo/Product 경계
│   ├── conventions.md               ← 축소: 프로젝트 고유 결정만
│   ├── behavior.md
│   └── build-deploy.md              ← architecture/ 에서 이동
├── rules/                           ← 1규칙 1파일, 20-30줄
│   ├── CLAUDE.md
│   ├── react.md
│   ├── typescript.md
│   ├── styling.md
│   ├── naming.md
│   ├── data-layer.md                ← 신규
│   ├── forms.md                     ← 신규
│   └── prisma.md
├── patterns/                        ← 구현 시 참고하는 코드 예제
│   ├── CLAUDE.md
│   ├── data-patterns.md             ← docs/data/patterns.md 기반
│   ├── form-patterns.md             ← docs/forms/guide.md
│   ├── theme-patterns.md            ← docs/themes/guide.md
│   ├── component-patterns.md        ← docs/architecture/component-guide.md
│   └── first-feature.md             ← docs/onboarding/first-feature.md
├── domain/                          ← 비즈니스 도메인 지식 (미래 확장)
│   ├── CLAUDE.md
│   ├── dcim/
│   │   └── CLAUDE.md
│   ├── settings/
│   │   └── CLAUDE.md
│   └── shared/
│       └── CLAUDE.md
└── archive/                         ← 과거 기록 (AI 로딩 금지)
    ├── CLAUDE.md
    ├── audits/
    ├── reviews/
    ├── research/
    ├── decisions/
    └── superpowers/
```

### 2.1 각 레이어 역할

| 레이어 | AI가 언제 읽나 | 성격 |
|--------|---------------|------|
| `core/` | 항상 (CLAUDE.md에서 @import) | 프로젝트 정체성, 제약, 핵심 결정 |
| `rules/` | 규칙 위반 시 | 반드시 지켜야 할 것. 업계표준과 중복 없이 SCC 고유 결정만 |
| `patterns/` | 구현할 때 | 코드 예제 포함. "이렇게 하면 된다" |
| `domain/` | 도메인 로직 다룰 때 | 비즈니스 개념, 외부 시스템 연동 |
| `archive/` | 읽지 않음 | 과거 브랜치 작업 산출물, 감사, 조사 |

### 2.2 각 디렉토리 CLAUDE.md

모든 하위 디렉토리는 CLAUDE.md를 가지며, 다음을 기술:
- 디렉토리 목적 (한 문장)
- 언제 읽어야 하는지
- 하위 파일 인덱스 (파일명 + 한 줄 설명)

---

## 3. conventions.md 축소 + rules/ 분리

### 3.1 `core/conventions.md` — 30줄 이내

프로젝트의 "결정"만:
- 모듈 기반 구조
- 뷰 시스템
- `cn()` 필수
- 아이콘 중앙 관리 `@/components/icons`
- 검증: `bun tsc --noEmit` + `bun run build`
- 개별 규칙은 `@docs/rules/` 참조

### 3.2 `rules/` 1규칙 1파일

업계 표준 스킬(vercel-react-best-practices, next-best-practices)과 중복되는 일반론은 배제. SCC 고유 규칙만 `[필수]`/`[권장]` 태그 유지.

---

## 4. 마이그레이션

### 4.1 삭제

| 대상 | 이유 |
|------|------|
| `docs/data/` | rules + patterns로 흡수 |
| `docs/forms/` | rules + patterns로 흡수 |
| `docs/themes/cheat-sheet.md` | theme-patterns.md로 충분 |
| `docs/architecture/` | component-patterns.md + core/build-deploy.md |
| `docs/onboarding/` | first-feature.md → patterns/ |
| `docs/core/loading-policy.md` | CLAUDE.md 계층에 통합되어 불필요 |
| `.claude/rules/{docs,prisma,react,typescript}.md` | docs/rules/로 통합 |

### 4.2 이동

| 현재 | 대상 |
|------|------|
| `docs/superpowers/` | `docs/archive/superpowers/` |
| `docs/review/` | `docs/archive/reviews/` |
| `docs/audits/` | `docs/archive/audits/` |
| `docs/research/` | `docs/archive/research/` |
| `docs/decisions/` | `docs/archive/decisions/` |
| `docs/themes/guide.md` | `docs/patterns/theme-patterns.md` |
| `docs/architecture/build-deploy.md` | `docs/core/build-deploy.md` |

### 4.3 신규 생성

| 파일 | 내용 |
|------|------|
| `docs/CLAUDE.md` | 전체 인덱스 |
| `docs/core/CLAUDE.md` | core/ 인덱스 |
| `docs/core/architecture.md` | 뷰 시스템, 모듈 구조, Demo/Product 경계 |
| `docs/rules/CLAUDE.md` | 규칙 인덱스 |
| `docs/rules/data-layer.md` | 데이터 계층 규칙 |
| `docs/rules/forms.md` | 폼 규칙 |
| `docs/patterns/CLAUDE.md` | 패턴 인덱스 |
| `docs/domain/CLAUDE.md` + dcim/CLAUDE.md + settings/CLAUDE.md + shared/CLAUDE.md |
| `docs/archive/CLAUDE.md` | "읽지 마세요" |
| `scripts/check-docs-freshness.sh` | 코드-only 변경 시 경고 |

### 4.4 수정

| 파일 | 변경 |
|------|------|
| `src/CLAUDE.md` | `@docs/` 경로 업데이트 |
| `src/modules/CLAUDE.md` | Demo 모듈 경로 `demo/` prefix |
| `docs/core/project.md` | `@docs/` 경로 업데이트 |
| `docs/core/conventions.md` | 200줄→30줄 축소 |
| `docs/rules/{react,typescript,styling,naming,prisma}.md` | 내용 정제 + `.claude/rules/` 통합 |

### 4.5 governance

`scripts/check-docs-freshness.sh`:
```bash
#!/usr/bin/env bash
# 마지막 커밋이 코드만 변경하고 docs/ 변경이 없으면 경고
changed=$(git diff --name-only HEAD~1 HEAD)
has_code=$(echo "$changed" | grep -E '\.(ts|tsx)$' | grep -v docs/ || true)
has_docs=$(echo "$changed" | grep -E '^docs/' || true)

if [ -n "$has_code" ] && [ -z "$has_docs" ]; then
  echo "WARNING: Code files modified without docs/ changes."
  echo "  Modified code files:"
  echo "$has_code"
  echo "  Consider: did any pattern or convention change?"
fi
```

강제가 아닌 알림.

---

## 5. 검증

1. `find docs/` — 디렉토리 구조 확인
2. `bun tsc --noEmit` — 타입 에러 없음 (문서 변경만이라 무관)
3. 각 CLAUDE.md 인덱스가 실제 파일과 일치하는지 확인
4. 아카이브 파일에 `docs/archive/` prefix 확인
5. outdated 경로 잔존 `grep -r "(views)" docs/` → 없음
