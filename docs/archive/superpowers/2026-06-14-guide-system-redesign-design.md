# 가이드 시스템 재설계 — 디자인

> 2026-06-14 · `docs/common/development/guide-system-audit.md` 분석 후속

## 목표

AI 에이전트(및 사람)가 SCC 프로젝트의 표준 패턴으로 일관된 코드를 작성할 수 있도록, **Skills(베이스라인)** + **내부 문서(delta)** 통합 가이드 시스템을 구축한다.

## 핵심 원칙

1. **Skills = 베이스라인, 내부 문서 = delta**
   - Skills이 커버하는 영역은 내부 문서에서 중복 기술 금지
   - 내부 문서는 프로젝트 고유 결정만 기술
2. **rules/patterns 이원 구조 유지**
   - `*.md` (접미사 없음) = 규칙 — 필수, 위반 시 리뷰 거절
   - `*-patterns.md` = 패턴 — 권장, 복사용 예제
   - 두 파일을 병합하지 않음
3. **각 내부 문서 첫 줄에 관련 Skill 명시**
   - AI가 "이 문서는 Skill 위에 추가되는 delta"임을 인식

## 현재 상태

### Skills (6개 → 5개 + 신규 1개)

| Skill | 출처 | 영역 | 비고 |
|-------|------|------|------|
| `next-best-practices` | nextjs.org | Next.js 16 App Router | 유지 |
| `vercel-react-best-practices` | vercel-labs/agent-skills | React 19 성능 (60+ 규칙, 8 카테고리) | 유지 |
| `vercel-composition-patterns` | vercel-labs/agent-skills | React 합성 패턴 | 유지 |
| `shadcn` | shadcn-ui | shadcn/ui 사용법, cn(), semantic colors | 유지 |
| `web-design-guidelines` | vercel-labs/agent-skills | UI 접근성/포커스/애니메이션/타이포 | 유지 |
| `frontend-design` | — | 시각 디자인 | **삭제** (shadcn과 충돌) |
| `playwright-best-practices` | currents-dev | Playwright E2E 패턴 | **신규 설치** |

### 내부 문서 (12개)

| 파일 | 라인 | 액션 |
|------|----|------|
| `naming.md` | 40 | 유지 |
| `forms.md` | 25 | Skill 참조 추가 |
| `react.md` | 38 | Skill 참조 추가 + 보강 |
| `styling.md` | 24 | Skill 참조 추가 + 슬림 |
| `component-patterns.md` | 157 | Skill 참조 추가 |
| `data-layer.md` | 27 | Server Actions 규칙 + Skill 참조 |
| `data-patterns.md` | 240 | Server Actions 패턴 + 슬림 |
| `form-patterns.md` | 1043 | **분할** (인덱스 + 4개) |
| `theme-patterns.md` | 604 | **슬림화** |
| `typescript.md` | 20 | **확장** |
| `prisma.md` | 24 | **확장** |
| `index.md` | 64 | 갱신 (신규/분할 반영) |

### 신규 내부 문서 (3개)

| 파일 | 내용 |
|------|------|
| `server-actions.md` | 정의, 호출, 유효성 검사, revalidation, 에러 처리. Skills 위에 delta만 |
| `state-management.md` | Zustand 규칙 (demo 모듈에서 사용 중) |
| `testing.md` | Vitest + Playwright. TDD 기대, 커버리지, 파일 컨벤션 |

## 변경 계획

### Phase 0: Skill 정리

- `frontend-design` Skill 삭제 (`rm -rf .claude/skills/frontend-design`)

### Phase 1: 기존 파일 Skill 참조 추가

각 파일 첫 줄에 마크다운 주석으로 관련 Skill 명시.

`react.md`:
```markdown
<!-- 관련 Skills: vercel-react-best-practices (React 19 hooks, 성능),
                  next-best-practices (RSC, error.tsx, metadata)
     이 문서는 프로젝트 고유 결정만 기술합니다. -->
```

`styling.md`:
```markdown
<!-- 관련 Skills: shadcn (UI 컴포넌트, semantic colors)
     이 문서는 프로젝트 고유 규칙만 기술합니다 (정적 색상 금지 등). -->
```

`component-patterns.md`:
```markdown
<!-- 관련 Skills: vercel-composition-patterns (합성 패턴),
                  shadcn (UI 컴포넌트)
     이 문서는 프로젝트 고유 분류/배치(Type A/B/C)만 기술합니다. -->
```

`data-layer.md`:
```markdown
<!-- 관련 Skills: next-best-practices/data-patterns.md (RSC),
                  vercel-react-best-practices/server-*.md (서버 캐싱/액션)
     이 문서는 프로젝트 계층 구조(types → service → queries → hooks)와 규칙만 기술합니다. -->
```

`forms.md`:
```markdown
<!-- 관련 Skills: 해당 없음
     이 문서는 프로젝트 폼 추상화(useAppForm, useFormFields<T>()) 규칙만 기술합니다. -->
```

### Phase 2: 슬림 파일 확장

**`typescript.md`** (20 → 60+ 라인):
- `satisfies` 사용 패턴
- branded types (도메인 ID, IP 등)
- discriminated unions
- `as const` 활용
- generic constraints
- 유틸리티 타입 (`Pick`, `Omit`, `Partial`, `Record` 조합 패턴)
- `// @reason` 주석 규칙 (any 예외 시)

**`prisma.md`** (24 → 80+ 라인):
- 스키마 네이밍 규칙 (model, field, index)
- 인덱스/유니크/복합키 작성 규칙
- relation 규칙 (onDelete, referential actions)
- 쿼리 최적화: n+1 방지 (`include`/`select` 명시)
- `$transaction` 사용 기준
- 마이그레이션 네이밍 (현존 `YYMMDD_description` 유지)
- shadow DB 정책

### Phase 3: 신규 파일

**`server-actions.md`** (60-80 라인, rules):
- 정의: `'use server'` 함수, project layer 구조 내 위치 (`api/actions.ts` 또는 `service.ts` 동거)
- 호출: Server Component에서 직접 호출, Client에서는 `useActionState` 또는 mutationOptions 경유
- 유효성 검사: Zod 스키마 + Server Action 내부 파싱
- revalidation: `revalidatePath`, `revalidateTag` 사용 기준
- 에러 처리: try/catch + 표준 에러 객체
- 보안: Skills `server-auth-actions.md` 참조 (CRITICAL)

**`state-management.md`** (40-60 라인, rules):
- Zustand만 다룸 (현재 사용 중인 유일한 client state 라이브러리)
- store 파일 위치: `<module>/utils/store.ts` (현존 demo 패턴 유지)
- 슬라이스 패턴: 단일 store vs 다중 store 기준
- persist 미들웨어 사용 기준
- Server state는 TanStack Query 사용 (Zustand는 UI state만)

**`testing.md`** (50-70 라인, rules):
- Vitest (단위/통합) + Playwright (E2E)
- 파일 컨벤션: `*.test.ts(x)`, `*.spec.ts(x)` 구분
- 디렉터리: 모듈 내 `__tests__/` 또는 co-location
- TDD 기대: 새 기능/버그 수정 시 테스트 선행. PR에서 미준수 시 코드 리뷰 단계에서 코멘트 (soft enforcement, 도구 강제 없음)
- 커버리지: 핵심 비즈니스 로직 (api/, lib/) 의무, UI는 권장
- Mocking: MSW (네트워크), vi.mock (모듈)
- Skills `playwright-best-practices` 참조

### Phase 4: 슬림화

**`theme-patterns.md`** (604 → ~100 라인):
- 핵심 패턴만 보존 (테마 토큰 사용, dark/light 모드 전환)
- 디자인 토큰 참조는 `docs/common/reference/design-tokens.md`로 이동 검토
- OKLCH 정의/사례는 가볍게 — 이미 토큰화된 값 사용이 우선

### Phase 5: 분할

**`form-patterns.md`** (1043 라인 → 인덱스 + 4개):

| 파일 | 추정 라인 | 내용 |
|------|---------|------|
| `form-patterns.md` (인덱스) | 30-50 | 분할된 파일 인덱스 |
| `form-setup-patterns.md` | 150-200 | useAppForm 설정, 필드 어댑터 |
| `form-validation-patterns.md` | 200-250 | Zod 스키마, onBlur/onChange/onSubmit 전략 |
| `form-submission-patterns.md` | 200-250 | mutation 연동, 토스트, 리다이렉트, 에러 |
| `form-sheet-dialog-patterns.md` | 150-200 | Sheet/Dialog 내 폼, 외부 제출 버튼 |

분할 후 인덱스는 "어떤 패턴을 어디서 찾는지" 가이드 역할만.

### Phase 6: 메타 문서

- `docs/common/development/index.md` — 신규 파일 3개 + form-patterns 분할 + theme-patterns 슬림 반영
- `docs/CLAUDE.md` — 변경 없음
- `docs/common/foundation/conventions.md` — 변경 없음

### Phase 7: 검증

1. `bun tsc --noEmit` 통과
2. `bun run build` 통과
3. `scripts/doc-links.py` 통과 (link-status 무결성)
4. 대표 시나리오: 사람이 한 번 검토 — "AI가 새 CRUD 모듈을 만들 때 가이드만 보고 일관된 코드를 만들 수 있는가"

## Scope 밖 (Defer)

다음은 이번 redesign에서 다루지 않음:

- **i18n** — 한국어만 사용. 필요 시 별도 작업
- **Auth/인가** — SSO 도입 시 별도 작업
- **CI/CD** — 빌드/배포 파이프라인 정착 후 별도 작업
- **테스트 코드 자체** — testing.md는 규칙 문서. 실제 테스트 작성은 별도
- **superpowers Skills** — `test-driven-development`, `verification-before-completion` 등은 유저 레벨 자유 사용
- **anthropics/skills** (`webapp-testing` 등) — 워크플로우성이라 프로젝트 레벨 제외

## 위험 / 주의

- **Phase 2, 3, 5는 content 작업** — 작성 중 다른 진행 중인 코드와 충돌 가능. PR 단위로 분리 권장
- **Phase 5 분할** — 기존 `form-patterns.md`를 참조하는 곳이 있다면 링크 깨질 수 있음. `index.md`를 먼저 갱신하고 분할
- **Phase 0 Skill 삭제** — 다른 곳에서 `frontend-design`을 참조하지 않는지 확인 후 삭제. `grep -r "frontend-design" .` 실행

## 작업 순서 요약

1. Phase 0 — `frontend-design` 삭제
2. Phase 1 — 5개 파일 Skill 참조 추가 (가장 안전, 먼저)
3. Phase 3 — 신규 3개 파일 생성 (`server-actions.md`, `state-management.md`, `testing.md`)
4. Phase 2 — `typescript.md`, `prisma.md` 확장
5. Phase 4 — `theme-patterns.md` 슬림화
6. Phase 5 — `form-patterns.md` 분할
7. Phase 6 — `index.md`에 신규/분할/슬림 반영
8. Phase 7 — 검증

## 성공 기준

- 모든 12+3 파일이 `관련 Skill → 프로젝트 고유 결정` 구조로 정렬됨
- 신규 3개 파일 존재
- `form-patterns.md` 5개 파일로 분할됨
- `theme-patterns.md` 100 라인 내외
- `typescript.md` 60+ 라인, `prisma.md` 80+ 라인
- `bun tsc --noEmit` + `bun run build` + `scripts/doc-links.py` 통과
- Skills 5개 (frontend-design 제외) + playwright-best-practices 추가
