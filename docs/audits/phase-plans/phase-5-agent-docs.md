# Phase 5: AGENT 지침 강화 (CLAUDE.md + conventions.md)

> **이전 Phase:** Phase 4 (hooks/ + mutation 패턴) 완료 후 진행.
> **원본 감사 보고서:** `docs/audits/2026-05-27-src-convention-audit.md` 전체 참조.
> **목적:** Phase 1~4에서 수정한 위반 사항들이 재발하지 않도록 AGENT.md 계열 문서에 방어 지침 추가.

---

## 1. 문제 설명

Phase 1~4 감사에서 발견된 위반들은 대부분 **컨벤션 문서에 명시되어 있으나** (예: Metadata, any 금지, cn() 사용, 정적 색상 금지) 실제 코드에서는 지켜지지 않았음.

이유:
1. CLAUDE.md에 컨벤션 위반 시 **체크리스트**나 **구체적 안티패턴 예시**가 부족
2. 신규 기능 추가 워크플로에 **검증 단계**가 명시되지 않음
3. `conventions.md`에 일부 규칙은 명시되어 있으나 구체적 사례/패턴이 부족한 항목 존재

---

## 2. 대상 파일

- `CLAUDE.md` (루트)
- `docs/core/conventions.md`

---

## 3. 해결 방향

### 3.1 CLAUDE.md 수정

신규 기능 추가 워크플로(7단계) 이후 **필수 검증 체크리스트** 추가:

```markdown
## 신규 기능 추가 후 검증 체크리스트

모든 page.tsx / 작업 완료 시 반드시 확인:

- [ ] `page.tsx`에 `export const metadata: Metadata` 존재하는가
- [ ] `cn()`으로 className 병합, 템플릿 리터럴/문자열 연결 금지
- [ ] Tailwind 정적 색상(`text-red-500`, `bg-blue-500` 등) 대신 CSS 변수 토큰(`text-primary`, `bg-muted/50`) 사용
- [ ] `any` 타입 사용 금지 (`// @reason` 주석 필수)
- [ ] 데이터 계층: `api/types.ts` → `api/service.ts` → `api/queries.ts` 분리
- [ ] `hooks/` 계층 존재: 컴포넌트는 hook을 통해서만 데이터 접근
- [ ] `useMutation` 인라인 금지 → `api/mutations.ts`에 전용 hook(`useXxxMutations()`) 정의
- [ ] Query Key Factory(`entityKeys.all/list/detail`) 사용, 문자열 하드코딩 금지
- [ ] API route: Zod 스키마 검증 사용, 수동 타입 체크 금지
- [ ] `bun tsc --noEmit` 통과
- [ ] `bun run build` 성공
```

### 3.2 conventions.md 보강

기존 컨벤션에 아래 항목들을 구체화:

#### a) "any 금지" → 안티패턴 예시 추가

```markdown
- [필수] **`any` 금지** — 필요 시 `unknown` + 타입 가드 사용.
  ❌ `function parse(raw: any) { ... }`
  ❌ `apiClient<any[]>('/path')`
  ✅ `function parse(raw: NetBoxResponse) { ... }`
  ✅ `apiClient<{ results: Device[] }>('/path')`
  서드파티 제네릭 제약 시 `// @reason:` 주석과 함께 예외 허용.
```

#### b) "테마 색상만 사용" → 매핑 테이블 추가

```markdown
- [필수] **CSS 변수 토큰만 사용** — 정적 Tailwind 색상 금지.
  ❌ `bg-green-500`, `text-red-500`, `bg-blue-100`
  ✅ `bg-success`, `text-destructive`, `bg-muted/30`

  매핑 가이드:
  | 정적 색상 | 대체 토큰 |
  |----------|----------|
  | green | success |
  | red | destructive |
  | blue | primary |
  | gray/zinc | muted / muted-foreground |
  | amber/yellow | warning |
```

#### c) "data-layer" → 누락 시 감지 강화

```markdown
- [필수] **데이터 계층 완전성** — 모든 API 모듈은 다음 파일을 반드시 포함:
  - `api/types.ts` — 타입만 정의, 다른 계층 import 금지 (`z.infer` 제외)
  - `api/service.ts` — 백엔드 호출, `apiClient` 이외의 데이터 접근 금지
  - `api/queries.ts` — Query Key Factory + `queryOptions()`
  - `api/mutations.ts` — `useXxxMutations()` hook export (읽기 전용이면 생략 가능)
  - `hooks/use-<name>s.ts` — 데이터 조회 hook
  - `hooks/use-<name>-mutations.ts` — mutation hook re-export
  위 파일 중 하나라도 누락 시 컴포넌트에서 직접 api 호출로 이어짐.
```

#### d) "useMutation 패턴" → 안티패턴 명시

```markdown
- [필수] **Mutation hook 패턴** — `mutationOptions` export 후 컴포넌트 inline 사용 금지.
  ❌ `export const createMutation = mutationOptions({...})` → 컴포넌트 `useMutation({...createMutation})`
  ✅ `export function useXxxMutations() { const m = useMutation({...}); return { m }; }` → 컴포넌트 `const { m } = useXxxMutations()`
```

#### e) "Metadata" → 안티패턴 명시

```markdown
- [필수] **Metadata export** — page.tsx마다 `export const metadata: Metadata` 필수.
  ❌ metadata 없이 page.tsx 생성
  ✅ `import type { Metadata } from 'next'; export const metadata: Metadata = { title: '...' };`
```

---

## 4. 검증 방법

```bash
# 변경된 문서 리뷰 (수동)
git diff CLAUDE.md
git diff docs/core/conventions.md

# 최종 빌드 (전체 Phase 완료 후)
bun tsc --noEmit
bun run build
```

### 완료 조건

- CLAUDE.md에 **신규 기능 추가 후 검증 체크리스트** 섹션이 추가됨
- conventions.md의 각 위반 패턴에 구체적인 ❌ / ✅ 예시 코드가 추가됨
- documents 리뷰 완료 (사람 리뷰)
- 기존 기능 회귀 없음 (`bun tsc --noEmit` + `bun run build` 통과)

---

## 5. 참고 자료

- 원본 감사: `docs/audits/2026-05-27-src-convention-audit.md`
- 현행 컨벤션: `docs/core/conventions.md`
- 현행 CLAUDE.md: `CLAUDE.md`
