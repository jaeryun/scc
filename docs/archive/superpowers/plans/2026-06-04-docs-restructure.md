# docs/ 문서 체계 재정비 구현 계획

> **실행:** Subagent-Driven Development

**목표:** `docs/` 디렉토리를 core/rules/patterns/domain/archive 5레이어로 재정비. outdated 제거, 1규칙 1파일 분리, 아카이브 분리.

**설계 문서:** `docs/superpowers/specs/2026-06-04-docs-restructure-design.md`

---

### Task 1: Create new directory structure and CLAUDE.md files

**생성:**
- `docs/CLAUDE.md`
- `docs/core/CLAUDE.md`
- `docs/rules/CLAUDE.md`
- `docs/patterns/CLAUDE.md`
- `docs/domain/CLAUDE.md`
- `docs/domain/dcim/CLAUDE.md`
- `docs/domain/settings/CLAUDE.md`
- `docs/domain/shared/CLAUDE.md`
- `docs/archive/CLAUDE.md`

- [ ] **Step 1: Create directories**

```bash
mkdir -p docs/patterns docs/domain/dcim docs/domain/settings docs/domain/shared docs/archive
```

- [ ] **Step 2: Create `docs/CLAUDE.md`**

```markdown
# docs/ — SCC 프로젝트 문서

이 디렉토리는 SCC 프로젝트의 모든 문서를 담습니다.

## 구조

| 디렉토리 | 목적 | 로딩 |
|----------|------|------|
| `core/` | 프로젝트 헌법 — 정체성, 제약, 핵심 결정 | 항상 |
| `rules/` | 코딩 규칙 — 반드시 지켜야 할 SCC 고유 결정 | 위반 시 참조 |
| `patterns/` | 구현 패턴 — 코드 예제, "이렇게 하면 된다" | 구현 시 참조 |
| `domain/` | 비즈니스 도메인 지식 — 뷰별/공유 개념 | 도메인 작업 시 |
| `archive/` | 과거 기록 — 감사, 리뷰, 과거 브랜치 산출물 | 읽지 않음 |

## 핵심 경로

- 프로젝트 개요 → `core/project.md`
- 코딩 규칙 → `core/conventions.md` → `rules/`
- 구현 패턴 → `patterns/`
```

- [ ] **Step 3: Create `docs/core/CLAUDE.md`**

```markdown
# core/ — 프로젝트 헌법

SCC 프로젝트의 정체성, 제약, 핵심 결정을 담습니다. 항상 로딩됩니다.

- `project.md`       — 기술 스택, 프로젝트 구조, Phase 1 제약
- `architecture.md`  — 뷰 시스템, 모듈 구조, Demo/Product 경계
- `conventions.md`   — 프로젝트 고유 결정 요약 → 세부 규칙은 `rules/`
- `behavior.md`      — AI 행동 원칙
- `build-deploy.md`  — 빌드 & 배포
```

- [ ] **Step 4: Create `docs/rules/CLAUDE.md`**

```markdown
# rules/ — SCC 고유 코딩 규칙

업계 표준 규칙은 `vercel-react-best-practices`, `next-best-practices` 스킬이 커버합니다.
이 디렉토리는 SCC 프로젝트가 내린 **고유한 결정**만 담습니다. 각 규칙은 `[필수]`/`[권장]` 태그로 구분.

- `react.md`        — 컴포넌트 함수 선언문, Props 인터페이스, 'use client', HydrationBoundary+Suspense
- `typescript.md`   — any 금지(+@reason 예외), interface 우선, 환경변수
- `styling.md`      — cn() 필수, 정적 색상 금지, CSS 변수 토큰 매핑
- `naming.md`       — kebab-case 파일, PascalCase 컴포넌트, use 접두사 훅
- `data-layer.md`   — types→service→queries→hooks 계층, mutationOptions 패턴, 쿼리 키 팩토리
- `forms.md`        — useAppForm + useFormFields<T>(), AppField render props
- `prisma.md`       — migrate dev만, db push 금지
```

- [ ] **Step 5: Create `docs/patterns/CLAUDE.md`**

```markdown
# patterns/ — 구현 패턴

실제 구현할 때 참고하는 코드 예제와 레시피를 담습니다.

- `data-patterns.md`      — React Query (prefetchQuery, useSuspenseQuery), apiClient, service 패턴
- `form-patterns.md`      — TanStack Form + Zod 전체 레시피 (기본, Sheet, Multi-step, 배열)
- `theme-patterns.md`     — 새 테마 추가 방법 (OKLCH, CSS 변수)
- `component-patterns.md` — 컴포넌트 배치 결정 트리 (components/ vs modules/)
- `first-feature.md`      — IPAM 따라하며 배우는 신규 기능 7단계 워크플로
```

- [ ] **Step 6: Create `docs/domain/CLAUDE.md`**

```markdown
# domain/ — 비즈니스 도메인 지식

프로젝트가 다루는 비즈니스 개념, 외부 시스템, 데이터 모델을 설명합니다.

현재는 구조만 준비된 상태입니다. 도메인 지식은 프로젝트 성숙에 따라 채워집니다.

- `dcim/`   — DCIM 뷰 (IPAM, Devices, Cables, Sites 등)
- `settings/` — 설정 뷰
- `shared/` — 여러 뷰에서 공유되는 개념 (NetBox 연동 등)
```

- [ ] **Step 7: Create `docs/domain/{dcim,settings,shared}/CLAUDE.md`** — each with placeholder "이 디렉토리는 [영역] 관련 도메인 지식을 담습니다."

- [ ] **Step 8: Create `docs/archive/CLAUDE.md`**

```markdown
# archive/ — 과거 기록

이 디렉토리는 **과거 브랜치 작업 산출물, 감사, 조사 결과**를 보관합니다.
**AI 에이전트는 이 디렉토리를 읽지 마세요.** 현재 유효한 문서가 아닙니다.

- `audits/`       — 컨벤션 감사 보고서
- `reviews/`      — 코드 리뷰 기록
- `research/`     — 기술 조사 결과
- `decisions/`    — ADR (Architecture Decision Records)
- `superpowers/`  — 과거 기능 브랜치의 설계 문서 및 구현 계획
```

- [ ] **Step 9: Commit**

```bash
git add docs/CLAUDE.md docs/core/CLAUDE.md docs/rules/CLAUDE.md \
        docs/patterns/CLAUDE.md docs/domain/CLAUDE.md \
        docs/domain/dcim/CLAUDE.md docs/domain/settings/CLAUDE.md \
        docs/domain/shared/CLAUDE.md docs/archive/CLAUDE.md
git commit -m "docs: create new directory structure with CLAUDE.md indexes"
```

---

### Task 2: Move archive files

- [ ] **Step 1: Move superpowers, reviews, audits, research, decisions to archive**

```bash
git mv docs/superpowers docs/archive/superpowers
git mv docs/review docs/archive/reviews
git mv docs/audits docs/archive/audits
git mv docs/research docs/archive/research
git mv docs/decisions docs/archive/decisions
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "docs: move archive files to archive/"
```

---

### Task 3: Move and rename guides → patterns

- [ ] **Step 1: Move files**

```bash
git mv docs/data/patterns.md docs/patterns/data-patterns.md
git mv docs/forms/guide.md docs/patterns/form-patterns.md
git mv docs/themes/guide.md docs/patterns/theme-patterns.md
git mv docs/architecture/component-guide.md docs/patterns/component-patterns.md
git mv docs/onboarding/first-feature.md docs/patterns/first-feature.md
git mv docs/architecture/build-deploy.md docs/core/build-deploy.md
```

- [ ] **Step 2: Delete empty directories and absorbed files**

```bash
rm -rf docs/architecture docs/onboarding
rm -f docs/data/cheat-sheet.md docs/forms/cheat-sheet.md docs/themes/cheat-sheet.md
rm -rf docs/data docs/forms docs/themes
```

- [ ] **Step 3: Update all @docs/ references in patterns files**

```bash
# Update references in moved files
cd docs/patterns
sed -i '' 's|../data/cheat-sheet.md|data-patterns.md|g' *.md
sed -i '' 's|../core/conventions.md|../core/conventions.md|g' *.md
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: move guides to patterns/, delete absorbed dirs"
```

---

### Task 4: Shrink conventions.md and create new core/architecture.md

- [ ] **Step 1: Read current conventions.md, extract architecture decisions**

Read `docs/core/conventions.md` and create `docs/core/architecture.md`:

```markdown
# 아키텍처

## 모듈 기반 구조

- 공통 UI → `src/components/`
- 도메인 데이터+UI → `src/modules/<name>/`
- → component-guide.md

## 뷰 시스템

- `src/config/views.ts`에 뷰 등록 (id, label, icon, navItems)
- 라우트 그룹: `src/app/(main)/<view-id>/page.tsx`
- 현재 뷰: `home`, `dcim` (product), `demo` (데모), `settings`, `api-reference`

## Demo vs Product 경계

- Product: `src/modules/<name>/` + Prisma + apiClient + API routes
- Demo: `src/modules/demo/<name>/` + in-memory mock 데이터
- Product 코드에서 `@/modules/demo/*` import 금지
- 경계 검사: `bash scripts/check-demo-imports.sh`

## 컴포넌트 배치

- `src/components/` → 순수 UI, 도메인 무관
- `src/modules/<name>/components/` → 도메인 타입 의존
- 자세한 기준: `docs/patterns/component-patterns.md`
```

- [ ] **Step 2: Rewrite conventions.md to ~30 lines**

```markdown
# 핵심 규칙

> 세부 규칙은 `rules/` 디렉토리를 참조하세요. 이 파일은 프로젝트 수준의 결정만 담습니다.

## 반드시 지킬 것

- `cn()`으로 className 병합 — 문자열 연결, 템플릿 리터럴 금지
- 아이콘은 `@/components/icons`에서만 import — `Icons.name` 사용
- `bun tsc --noEmit` + `bun run build` 통과 필수

## 규칙 참조

| 규칙 | 파일 |
|------|------|
| React 컴포넌트 | `rules/react.md` |
| TypeScript | `rules/typescript.md` |
| 스타일 | `rules/styling.md` |
| 네이밍 | `rules/naming.md` |
| 데이터 계층 | `rules/data-layer.md` |
| 폼 | `rules/forms.md` |
| Prisma | `rules/prisma.md` |
| 아키텍처 | `architecture.md` |
| AI 행동 원칙 | `behavior.md` |
```

- [ ] **Step 3: Commit**

---

### Task 5: Create new rules/data-layer.md and rules/forms.md

- [ ] **Step 1: Create `docs/rules/data-layer.md`** — types→service→queries→hooks 계층, mutationOptions 패턴, 쿼리 키 팩토리. (cheat-sheet.md에서 규칙 부분 추출, 예제는 patterns/로)

- [ ] **Step 2: Create `docs/rules/forms.md`** — useAppForm, useFormFields<T>(), AppField render props 필수 규칙만. (cheat-sheet.md에서 규칙 부분 추출)

- [ ] **Step 3: Commit**

---

### Task 6: Update existing rules/ and integrate .claude/rules/

- [ ] **Step 1: Update `docs/rules/react.md`, `typescript.md`, `styling.md`, `naming.md`, `prisma.md`** — conventions.md에서 추출한 내용으로 정제 + `.claude/rules/` 내용 통합

- [ ] **Step 2: Update `.claude/rules/` files** — 각 파일을 `@docs/rules/<name>.md` 참조로 대체

- [ ] **Step 3: Commit**

---

### Task 7: Update CLAUDE.md references

- [ ] **Step 1: Update `src/CLAUDE.md`** — @docs 경로를 새 구조로 (`docs/core/conventions.md`, `docs/patterns/` 등)

- [ ] **Step 2: Update `src/modules/CLAUDE.md`** — 데모 모듈 경로 `demo/` prefix 반영

- [ ] **Step 3: Update `docs/core/project.md`** — @docs 경로 + 프로젝트 구조 트리

- [ ] **Step 4: Commit**

---

### Task 8: Create docs freshness check script

- [ ] **Step 1: Create `scripts/check-docs-freshness.sh`**

```bash
#!/usr/bin/env bash
changed=$(git diff --name-only HEAD~1 HEAD 2>/dev/null || true)
has_code=$(echo "$changed" | grep -E '\.(ts|tsx)$' | grep -v 'docs/' || true)
has_docs=$(echo "$changed" | grep -E '^docs/(core|rules|patterns)/' || true)

if [ -n "$has_code" ] && [ -z "$has_docs" ]; then
  echo "WARNING: Code files modified without docs/ changes."
  echo "  Modified code files:"
  echo "$has_code"
  echo "  Consider: did any pattern or convention change? Update docs/ if so."
fi
```

- [ ] **Step 2: `chmod +x scripts/check-docs-freshness.sh`**

- [ ] **Step 3: Commit**

---

### Task 9: Final verification

- [ ] **Step 1: Verify no outdated paths**

```bash
grep -r "(views)" docs/ --include="*.md" || echo "No outdated (views) found"
grep -r "modules/products\|modules/users\|modules/dashboard\|modules/kanban\|modules/chat" docs/core/ docs/rules/ docs/patterns/ --include="*.md" | grep -v "demo/" || echo "No outdated module paths found"
```

- [ ] **Step 2: Verify directory structure**

```bash
find docs/core docs/rules docs/patterns docs/domain docs/archive -maxdepth 1 -type f -name "*.md" | sort
```

- [ ] **Step 3: `bun tsc --noEmit`** — should pass (docs changes only)
- [ ] **Step 4: `bun run build`** — should pass

- [ ] **Step 5: Final commit**
