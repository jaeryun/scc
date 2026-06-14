# 가이드 시스템 감사 및 재설계

> 2026-06-14 · Skills(6개) + `docs/common/development/`(12개 파일) 전수 분석 기반

## 문제 정의

SCC 프로젝트는 두 개의 가이드 시스템이 공존한다:

1. **설치된 Skills** — Vercel/커뮤니티 전문가가 작성한 고품질 가이드. Next.js App Router, React 19 성능, shadcn/ui, 컴포넌트 조합을 강력하게 커버.
2. **`docs/common/development/`** — AI가 생성한 내부 문서. 전체 등급 **C-**. Next.js 16 서버 우선 패러다임 미반영, TypeScript/Prisma 가이드 빈약, 내용 중복 다수.

Skills은 표준 패턴을 잘 다루지만 파편화되어 있고, 내부 문서는 프로젝트 특화 규칙을 담고 있으나 품질이 낮고 표준 패턴과 괴리가 있다. AI 기반으로 작업하는 사용자가 일관성 있는 코드를 생산하기 어려운 구조.

**목표**: Skills과 내부 문서를 통합된 가이드 시스템으로 재편하여, 누구나(AI 포함) 이 스택의 표준 패턴으로 일관된 코드를 작성할 수 있게 한다.

---

## Skills 현황 (6개)

| Skill | 범위 | 품질 | 관련성 |
|-------|------|------|--------|
| `next-best-practices` | Next.js 16 App Router 전반 (23개 참조 파일) | 매우 높음 | 매우 높음 |
| `vercel-react-best-practices` | React 19 성능 최적화 64규칙 (8개 카테고리) | 매우 높음 | 매우 높음 |
| `vercel-composition-patterns` | React 컴포넌트 설계 7패턴 | 높음 | 매우 높음 |
| `shadcn` | shadcn/ui 사용법, semantic colors, cn() | 매우 높음 | 매우 높음 |
| `frontend-design` | 시각적 디자인 원칙 | 높음 | 중간 |
| `web-design-guidelines` | 외부 URL 기반 감사 도구 | 외부 의존 | 낮음 |

### 중복 및 충돌

- `next-best-practices`와 `vercel-react-best-practices` — 데이터 페칭, Waterfall 방지 중복
- `frontend-design`(창의적/비대칭) ↔ `shadcn`(규칙적/정형화) — 미학적 충돌
- `web-design-guidelines` — 외부 URL 의존, 오프라인 사용 불가

### Skills 공백

테스팅, 상태관리(Zustand), 인증/인가, i18n, CI/CD, Prisma/ORM — 어떤 Skill도 커버하지 않음.

---

## 내부 문서 현황 (15개 파일)

### 강점 (신뢰도 4/5)

| 파일 | 내용 |
|------|------|
| `component-patterns.md` | 결정 트리, Type A/B/C 분류, 실제 마이그레이션 사례 |
| `form-patterns.md` | TanStack Form + shadcn 9가지 레시피 |
| `naming.md` | 실제 코드베이스 기반 포괄적 네이밍 |
| `styling.md` | shadcn 토큰 매핑, 구체적 규칙 |
| `behavior.md` | AI 에이전트 행동 원칙 |

### 약점 (신뢰도 2-3/5)

| 파일 | 문제 |
|------|------|
| `typescript.md` | 규칙 4개뿐. `satisfies`, branded types, discriminated unions 없음 |
| `prisma.md` | `db push` 금지만. 스키마 작성, 쿼리 최적화, 트랜잭션 없음 |
| `architecture.md` | 26줄. 인증/API/상태관리 아키텍처 결정 없음 |
| `data-layer.md` + `data-patterns.md` | 내용 중복, Server Actions 완전 누락 |
| `react.md` | React 19 hooks(`use()`, `useActionState`, `useOptimistic`) 누락 |
| `theme-patterns.md` | AI 생성 느낌의 반복/팽창, 중복 섹션 다수 |

### 치명적 갭

- **Server Actions** — Next.js 16의 핵심 mutation 방식. 가이드 전무.
- **PPR, 캐싱 전략** — `revalidatePath`, `revalidateTag`, `cache()`, `connection()`
- **React 19 hooks** — `use()`, `useActionState`, `useFormStatus`, `useOptimistic`
- **테스트 전략** — 단위/통합/E2E 테스트 완전 부재
- **보안** — XSS, CSRF, 입력 검증 패턴 없음

### 등급 산정 근거

**C-**: "초안은 작성되었으나 Next.js 16/React 19 스택의 핵심 기능들을 다수 누락. AI 생성 흔적으로 인한 신뢰도 문제와 내용 중복 존재. 일부 문서(form-patterns, component-patterns)는 우수하나 전체 시스템으로는 불완전. 현재 상태로는 신규 개발자가 이 가이드만 따라가면 Next.js 16 모범 사례를 따르지 못할 위험 높음."

---

## Skills ↔ 내부 문서 담당 영역

| 영역 | Skills | 내부 문서 | 판단 |
|------|--------|----------|------|
| Next.js App Router | 강력 | 약함 | Skills에 위임 |
| React 19 성능 | 강력 | 약함 | Skills에 위임 |
| React 컴포넌트 설계 | 강력 | 중간 | Skills에 위임 |
| shadcn/ui 스타일링 | 강력 | 중간 | Skills에 위임 |
| 폼 (TanStack Form) | 없음 | 강력 | 내부 문서 유지 |
| 데이터 레이어 (TanStack Query) | 없음 | 중간 | 내부 문서 개선 |
| 프로젝트 구조/네이밍 | 없음 | 강력 | 내부 문서 유지 |
| Prisma/DB | 없음 | 약함 | 내부 문서 보강 |
| AI 행동 원칙 | 없음 | 강력 | 내부 문서 유지 |

---

## 재설계 방안: 3-Tier 시스템

### Tier 1 — Skills (표준 패턴, 수정하지 않음)

Skills이 고품질로 커버하는 영역은 내부 문서에서 중복 기술하지 않는다:

- `next-best-practices`: 파일 컨벤션, RSC 경계, async API, 에러 처리, 이미지/폰트
- `vercel-react-best-practices`: 성능 최적화 (Waterfall 제거, 번들, 리렌더링)
- `vercel-composition-patterns`: 컴포넌트 설계 (compound components, children over render props)
- `shadcn`: UI 컴포넌트 사용법, semantic colors, cn(), 아이콘 규칙

### Tier 2 — 내부 문서 (프로젝트 특화 결정)

Skills이 커버하지 않는 프로젝트 고유 결정에 집중한다. 각 파일은 Skills 위에 추가되는 규칙만 기술.

**유지 + 소폭 개선:**
- `naming.md` — 그대로
- `styling.md` — Skills(shadcn) 참조 추가, Tailwind v4 CSS-first 설정
- `component-patterns.md` — Skills(vercel-composition-patterns) 참조 추가
- `form-patterns.md` — Server Actions + TanStack Form 통합 패턴 추가

**대폭 개선:**
- `typescript.md` — `satisfies`, branded types, discriminated unions, `as const`, generic constraints
- `prisma.md` — 스키마 작성, 쿼리 최적화, n+1 방지, `$transaction`
- `data-layer.md` — Server Actions 패턴, 캐싱 전략, RSC 데이터 페칭. `data-patterns.md` 내용 흡수
- `react.md` — React 19 hooks 추가, Server Component 패턴 명확화

**병합/제거:**
- `data-patterns.md` → `data-layer.md`에 흡수 후 삭제
- `theme-patterns.md` → 핵심만 `styling.md`에 통합 후 삭제

**신규:**
- `server-actions.md` — 정의, 호출, 유효성 검사, revalidation, 에러 처리

### Tier 3 — CLAUDE.md 로딩 정책

```
1. @docs/common/foundation/    → 항상 로딩 (프로젝트 정체성)
2. Skills 자동 활성화           → next-best-practices, shadcn 등
3. @docs/common/development/   → 구현 시 필요 (Skills 미커버 영역만)
```

---

## 실행 항목

### Phase 1: 내부 문서 개선

1. `typescript.md` 재작성 — 4규칙 → 포괄적 가이드
2. `react.md` 보강 — React 19 hooks, Server Component 패턴
3. `prisma.md` 확장 — 스키마 규칙, 쿼리 최적화
4. `data-layer.md` 재작성 — Server Actions 통합, `data-patterns.md` 흡수
5. `server-actions.md` 신규
6. `data-patterns.md` 삭제
7. `theme-patterns.md` → `styling.md` 통합 후 삭제

### Phase 2: 로딩 정책

8. `docs/CLAUDE.md` 업데이트 — Skills 우선, 내부 문서 보조
9. Skills 충돌 해결 — `frontend-design` 비활성화 또는 shadcn 우선 규칙 명시

### Phase 3: 검증

10. 대표 시나리오 테스트 — AI 에이전트가 새 CRUD 모듈 생성 시 일관성 확인
11. `bun tsc --noEmit` + `bun run build` 통과 확인
