# 가이드 시스템 재설계 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Skills(베이스라인) + 내부 문서(delta) 통합 가이드 시스템을 구축한다. 12개 내부 문서 정비, 3개 신규 추가, 1개 분할, 1개 슬림화, frontend-design Skill 삭제, playwright-best-practices Skill 추가.

**Architecture:** 각 내부 문서는 "관련 Skill 참조 → 프로젝트 고유 결정" 구조로 정렬. rules(`*.md`)와 patterns(`*-patterns.md`) 이원 구조 유지. Skill은 베이스라인, 내부 문서는 delta만 기술.

**Tech Stack:** Markdown, Claude Skills, shadcn/ui, Next.js 16, React 19, Prisma, TanStack Query/Form, Zustand, Vitest, Playwright

**참조 스펙:** `docs/superpowers/specs/2026-06-14-guide-system-redesign-design.md` (커밋 5f32349)

---

## 작업 순서

8개 Phase를 16개 태스크로 분해. 각 태스크는 2-5분 단위, 실행 후 커밋.

- **Phase 0** (1 태스크): Skill 정리
- **Phase 1** (5 태스크): 기존 5개 파일 Skill 참조 추가
- **Phase 3** (3 태스크): 신규 3개 파일 생성
- **Phase 2** (2 태스크): typescript.md, prisma.md 확장
- **Phase 4** (1 태스크): theme-patterns.md 슬림화
- **Phase 5** (1 태스크): form-patterns.md 분할
- **Phase 6** (1 태스크): index.md 갱신
- **Phase 7** (2 태스크): 검증

---

## Task 1: Phase 0 — frontend-design Skill 삭제

**Files:**
- Delete: `.claude/skills/frontend-design/`

- [ ] **Step 1: frontend-design 참조 여부 확인**

Run:
```bash
grep -rn "frontend-design" /Users/jerry/dev/scc --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git 2>/dev/null
```

Expected: 출력 없음 (다른 곳에서 참조 안 함). 만약 참조가 있으면 어떤 컨텍스트인지 보고 사용자에게 확인.

- [ ] **Step 2: Skill 디렉터리 삭제**

Run:
```bash
rm -rf /Users/jerry/dev/scc/.claude/skills/frontend-design
ls /Users/jerry/dev/scc/.claude/skills/
```

Expected: `frontend-design`이 목록에 없음. 남은 Skills: `find-skills`, `grill-me`, `next-best-practices`, `shadcn`, `vercel-composition-patterns`, `vercel-react-best-practices`, `web-design-guidelines`.

- [ ] **Step 3: 커밋**

Run:
```bash
cd /Users/jerry/dev/scc
git add -A .claude/skills/
git diff --cached --stat
```

Expected: `frontend-design/` 디렉터리가 삭제된 것만 staged되어야 함. 다른 변경이 staged되지 않도록 확인.

```bash
git commit -m "chore(skills): frontend-design Skill 제거

shadcn과 시각 디자인 충돌 해결. Skills을 5개로 정리.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Phase 0 — playwright-best-practices Skill 설치

**Files:**
- Add: `.claude/skills/playwright-best-practices/` (npx skills로 자동 설치)

- [ ] **Step 1: Playwright Skill 설치**

Run:
```bash
cd /Users/jerry/dev/scc
npx skills add currents-dev/playwright-best-practices-skill -g -y 2>&1 | tail -20
```

Expected: 설치 진행 메시지. 에러 없이 완료. 프로젝트 레벨 설치가 기본이지만, 글로벌로 설치되어도 동일하게 작동.

- [ ] **Step 2: 설치 확인**

Run:
```bash
ls /Users/jerry/dev/scc/.claude/skills/ | grep -i playwright
```

Expected: `playwright-best-practices` 디렉터리 존재. 만약 글로벌 설치만 됐다면 프로젝트에 심볼릭 링크 또는 별도 처리 필요할 수 있음 — 사용자에게 확인.

- [ ] **Step 3: 커밋 (해당 시)**

만약 프로젝트 레벨에 설치됐다면:
```bash
cd /Users/jerry/dev/scc
git add -A .claude/skills/
git status --short
```

Expected: `playwright-best-practices/` 디렉터리가 staged.

```bash
git commit -m "chore(skills): playwright-best-practices 추가

E2E 테스트 패턴 보강. testing.md 작성 시 참조.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

글로벌 설치만 됐다면 커밋 불필요. Step 4로 진행.

- [ ] **Step 4: Playwright 의존성 확인 (참고)**

Run:
```bash
cat /Users/jerry/dev/scc/package.json | grep -A1 -B1 "playwright"
```

Expected: `playwright` 가 이미 `^1.60.0` 정도로 설치돼 있음 (audit에서 확인됨). 별도 설치 불필요.

---

## Task 3: Phase 1 — `react.md` Skill 참조 추가

**Files:**
- Modify: `/Users/jerry/dev/scc/docs/common/development/react.md:1-2`

- [ ] **Step 1: 현재 상태 확인**

Run:
```bash
head -5 /Users/jerry/dev/scc/docs/common/development/react.md
```

Expected: `# React 규칙` 으로 시작.

- [ ] **Step 2: Skill 참조 주석 삽입**

`react.md` 1행(`# React 규칙`) 바로 아래에 다음 내용 삽입:

```markdown
<!-- 관련 Skills: vercel-react-best-practices (React 19 hooks, 성능),
                  next-best-practices (RSC, error.tsx, metadata)
     이 문서는 프로젝트 고유 결정만 기술합니다. -->
```

Edit 도구 사용:
- old_string: `# React 규칙\n\n## 컴포넌트 정의 (필수)`
- new_string: `# React 규칙\n\n<!-- 관련 Skills: vercel-react-best-practices (React 19 hooks, 성능),\n                  next-best-practices (RSC, error.tsx, metadata)\n     이 문서는 프로젝트 고유 결정만 기술합니다. -->\n\n## 컴포넌트 정의 (필수)`

- [ ] **Step 3: 변경 확인**

Run:
```bash
head -10 /Users/jerry/dev/scc/docs/common/development/react.md
```

Expected: 제목 + HTML 주석 + 기존 첫 섹션(`## 컴포넌트 정의 (필수)`) 순서.

- [ ] **Step 4: 커밋**

```bash
cd /Users/jerry/dev/scc
git add docs/common/development/react.md
git commit -m "docs(react): Skill 참조 주석 추가

vercel-react-best-practices, next-best-practices 참조 명시.
이 문서는 프로젝트 고유 결정(delta)만 다룸을 AI에 알림.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Phase 1 — `styling.md` Skill 참조 추가

**Files:**
- Modify: `/Users/jerry/dev/scc/docs/common/development/styling.md:1-2`

- [ ] **Step 1: Skill 참조 주석 삽입**

`styling.md` 1행(`# 스타일링 규칙`) 바로 아래에 삽입:

```markdown
<!-- 관련 Skills: shadcn (UI 컴포넌트, semantic colors)
     이 문서는 프로젝트 고유 규칙만 기술합니다 (정적 색상 금지 등). -->
```

Edit 도구 사용:
- old_string: `# 스타일링 규칙\n\n## className 병합 (필수)`
- new_string: `# 스타일링 규칙\n\n<!-- 관련 Skills: shadcn (UI 컴포넌트, semantic colors)\n     이 문서는 프로젝트 고유 규칙만 기술합니다 (정적 색상 금지 등). -->\n\n## className 병합 (필수)`

- [ ] **Step 2: 변경 확인 + 커밋**

```bash
head -10 /Users/jerry/dev/scc/docs/common/development/styling.md
```

```bash
cd /Users/jerry/dev/scc
git add docs/common/development/styling.md
git commit -m "docs(styling): Skill 참조 주석 추가

shadcn Skill 참조. 정적 색상 금지 등 프로젝트 고유 규칙 명시.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Phase 1 — `component-patterns.md` Skill 참조 추가

**Files:**
- Modify: `/Users/jerry/dev/scc/docs/common/development/component-patterns.md:1-2`

- [ ] **Step 1: Skill 참조 주석 삽입**

`component-patterns.md` 1행(`# 컴포넌트 패턴`) 바로 아래에 삽입:

```markdown
<!-- 관련 Skills: vercel-composition-patterns (합성 패턴),
                  shadcn (UI 컴포넌트)
     이 문서는 프로젝트 고유 분류/배치(Type A/B/C)만 기술합니다. -->
```

Edit 도구 사용:
- old_string: `# 컴포넌트 패턴\n\n`
- new_string: `# 컴포넌트 패턴\n\n<!-- 관련 Skills: vercel-composition-patterns (합성 패턴),\n                  shadcn (UI 컴포넌트)\n     이 문서는 프로젝트 고유 분류/배치(Type A/B/C)만 기술합니다. -->\n\n`

- [ ] **Step 2: 변경 확인 + 커밋**

```bash
head -5 /Users/jerry/dev/scc/docs/common/development/component-patterns.md
```

```bash
cd /Users/jerry/dev/scc
git add docs/common/development/component-patterns.md
git commit -m "docs(component-patterns): Skill 참조 주석 추가

vercel-composition-patterns, shadcn 참조. Type A/B/C 분류 등
프로젝트 고유 결정 명시.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Phase 1 — `data-layer.md` Skill 참조 추가 + Server Actions 규칙 확장

**Files:**
- Modify: `/Users/jerry/dev/scc/docs/common/development/data-layer.md`

- [ ] **Step 1: Skill 참조 주석 삽입**

`data-layer.md` 1행(`# 데이터 계층 규칙`) 바로 아래에 삽입:

```markdown
<!-- 관련 Skills: next-best-practices/data-patterns.md (RSC),
                  vercel-react-best-practices/server-*.md (서버 캐싱/액션)
     이 문서는 프로젝트 계층 구조(types → service → queries → hooks)와 규칙만 기술합니다. -->
```

- [ ] **Step 2: Server Actions 섹션 추가**

기존 `## 데이터 페칭 전략 (필수)` 섹션 뒤에 다음 섹션 추가:

```markdown
## Server Actions (필수)

- Server Actions은 `service.ts`에 동거 또는 `api/actions.ts`에 별도 파일로 분리
- 호출 지점:
  - Server Component: 직접 호출 (await)
  - Client Component: `useActionState` (React 19) 또는 `mutationOptions` 경유
- 유효성 검사: Zod 스키마 + Server Action 내부 `schema.parse()` (예외는 표준 에러 객체로 변환)
- 재검증: 변경 mutation 성공 시 `revalidatePath` 또는 `revalidateTag` 호출
- 보안: Skills `vercel-react-best-practices/rules/server-auth-actions.md` (CRITICAL) 참조 — 인증/인가를 Action 내부에서 검증
```

Edit 도구 사용:
- old_string: `- 서버 컴포넌트 prefetch: \`void queryClient.prefetchQuery(...)\` -- await 금지, 렌더링 차단 금지`
- new_string: `- 서버 컴포넌트 prefetch: \`void queryClient.prefetchQuery(...)\` -- await 금지, 렌더링 차단 금지\n\n## Server Actions (필수)\n\n- Server Actions은 \`service.ts\`에 동거 또는 \`api/actions.ts\`에 별도 파일로 분리\n- 호출 지점:\n  - Server Component: 직접 호출 (await)\n  - Client Component: \`useActionState\` (React 19) 또는 \`mutationOptions\` 경유\n- 유효성 검사: Zod 스키마 + Server Action 내부 \`schema.parse()\` (예외는 표준 에러 객체로 변환)\n- 재검증: 변경 mutation 성공 시 \`revalidatePath\` 또는 \`revalidateTag\` 호출\n- 보안: Skills \`vercel-react-best-practices/rules/server-auth-actions.md\` (CRITICAL) 참조 — 인증/인가를 Action 내부에서 검증`

- [ ] **Step 3: 변경 확인 + 커밋**

```bash
cat /Users/jerry/dev/scc/docs/common/development/data-layer.md
```

```bash
cd /Users/jerry/dev/scc
git add docs/common/development/data-layer.md
git commit -m "docs(data-layer): Skill 참조 + Server Actions 규칙 추가

Skills 참조 명시. Server Actions 정의/호출/유효성/재검증/보안 규칙 추가.
Skills server-auth-actions.md(CRITICAL) 참조.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Phase 1 — `forms.md` Skill 참조 추가

**Files:**
- Modify: `/Users/jerry/dev/scc/docs/common/development/forms.md:1-2`

- [ ] **Step 1: Skill 참조 주석 삽입**

`forms.md` 1행(`# 폼 규칙`) 바로 아래에 삽입:

```markdown
<!-- 관련 Skills: 해당 없음 (프로젝트 고유 추상화)
     이 문서는 프로젝트 폼 추상화(useAppForm, useFormFields<T>()) 규칙만 기술합니다.
     일반 폼 패턴은 form-patterns.md 참조. -->
```

Edit 도구 사용:
- old_string: `# 폼 규칙\n\n## 필수 도구 (필수)`
- new_string: `# 폼 규칙\n\n<!-- 관련 Skills: 해당 없음 (프로젝트 고유 추상화)\n     이 문서는 프로젝트 폼 추상화(useAppForm, useFormFields<T>()) 규칙만 기술합니다.\n     일반 폼 패턴은 form-patterns.md 참조. -->\n\n## 필수 도구 (필수)`

- [ ] **Step 2: 변경 확인 + 커밋**

```bash
head -10 /Users/jerry/dev/scc/docs/common/development/forms.md
```

```bash
cd /Users/jerry/dev/scc
git add docs/common/development/forms.md
git commit -m "docs(forms): Skill 참조 주석 추가

관련 Skill 없음 명시. 폼 패턴은 form-patterns.md로 위임.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Phase 3 — `server-actions.md` 신규 생성

**Files:**
- Create: `/Users/jerry/dev/scc/docs/common/development/server-actions.md`

- [ ] **Step 1: 파일 작성**

새 파일 `docs/common/development/server-actions.md` 생성. 내용:

```markdown
# Server Actions 규칙

<!-- 관련 Skills: vercel-react-best-practices/rules/server-auth-actions.md (CRITICAL),
                  next-best-practices/data-patterns.md (RSC 패턴)
     이 문서는 프로젝트 계층 구조 내 Server Actions 규칙만 기술합니다.
     일반 Server Actions 패턴은 Skills 참조. -->

> Server Actions의 일반 사용법(정의, useActionState, useFormStatus, useOptimistic)은
> Skills에 위임한다. 이 문서는 **우리 코드베이스에서** Server Actions을 어디에
> 두고 어떻게 호출하는지만 다룬다.

## 정의 위치 (필수)

Server Actions은 두 가지 위치에 둘 수 있다:

| 위치 | 사용 시점 |
|------|---------|
| `service.ts`에 동거 | 기존 service 함수와 1:1 매핑되는 mutation |
| `api/actions.ts` 별도 파일 | 여러 service 함수를 묶는 복합 mutation |

**금지:**
- 컴포넌트 파일(`page.tsx`, `*-dialog.tsx` 등)에 인라인 Server Action 정의 금지
- `app/api/*/route.ts`에서 mutation 처리 시 Server Action과 중복 정의 금지 (한 곳에 모음)

## 호출 패턴 (필수)

### Server Component

```typescript
// app/(main)/subnets/page.tsx
import { createSubnet } from '@/modules/ipam/service';

export default async function Page() {
  // Server Component는 직접 await 호출
  const result = await createSubnet(formData);
  // ...
}
```

### Client Component

```typescript
// components/create-subnet-dialog.tsx
'use client';
import { useActionState } from 'react';
import { createSubnetAction } from '@/modules/ipam/api/actions';

const [state, formAction, isPending] = useActionState(
  createSubnetAction,
  initialState
);
```

또는 mutation 경유:

```typescript
// api/mutations.ts
export const createSubnetMutation = mutationOptions({
  mutationFn: (data) => createSubnet(data),
  // ...
});
```

## 유효성 검사 (필수)

- Server Action **내부**에서 Zod 스키마로 `parse()`
- `parse()` 실패 시 표준 에러 객체로 변환하여 throw
- 클라이언트 폼 레벨 검증(Zod 스키마 재사용)과 독립적 — 두 번 검증

```typescript
'use server';
import { z } from 'zod';

const schema = z.object({ name: z.string().min(1) });

export async function createSubnet(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new ActionError('VALIDATION', parsed.error.flatten());
  }
  return db.subnet.create({ data: parsed.data });
}
```

## 재검증 (필수)

mutation 성공 후 데이터 갱신이 필요한 경우:

| 전략 | 사용 시점 |
|------|---------|
| `revalidatePath('/path')` | 특정 라우트의 데이터 갱신 |
| `revalidateTag('subnets')` | 태그 기반 캐시 무효화 (queries.ts의 queryKey와 일치) |

- `revalidatePath`/`revalidateTag`는 Server Action 내부에서 호출
- 클라이언트 mutationOptions의 `onSuccess`에서는 `invalidateQueries`만 사용 (TanStack Query 캐시)

## 에러 처리 (필수)

표준 에러 객체:

```typescript
// lib/errors.ts
export class ActionError extends Error {
  constructor(public code: string, public details?: unknown) {
    super(code);
  }
}
```

- Server Action은 `ActionError`를 throw
- 클라이언트에서 catch하여 토스트/UI 피드백 표시

## 보안 (CRITICAL)

Skills `vercel-react-best-practices/rules/server-auth-actions.md` (CRITICAL) 참조:

- **모든 Server Action은 내부에서 인증/인가 검증** (middleware, layout 가드만 의존 금지)
- 세션 확인 → 권한 확인 → 입력 검증 → 실행 순서
- IDOR(타인 리소스 접근) 방지: 모든 mutation은 소유권/권한 재확인

## 금지 패턴

- ❌ Server Action에서 `redirect()` 호출 후 mutation 실패 시 silent failure
- ❌ 컴포넌트에서 fetch로 Server Action 우회 호출
- ❌ Server Action 내부에서 클라이언트 전용 API(localStorage 등) 접근
```

- [ ] **Step 2: 파일 확인**

Run:
```bash
wc -l /Users/jerry/dev/scc/docs/common/development/server-actions.md
ls -la /Users/jerry/dev/scc/docs/common/development/server-actions.md
```

Expected: 100-130 라인, 파일 존재.

- [ ] **Step 3: 커밋**

```bash
cd /Users/jerry/dev/scc
git add docs/common/development/server-actions.md
git commit -m "docs(server-actions): 신규 규칙 문서 추가

Server Actions 정의/호출/유효성/재검증/에러/보안 규칙.
Skills 위에 delta만 기술. server-auth-actions.md(CRITICAL) 참조.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Phase 3 — `state-management.md` 신규 생성

**Files:**
- Create: `/Users/jerry/dev/scc/docs/common/development/state-management.md`

- [ ] **Step 1: 파일 작성**

새 파일 `docs/common/development/state-management.md` 생성. 내용:

```markdown
# 상태 관리 규칙

<!-- 관련 Skills: vercel-react-best-practices (rerender-*, transitions),
                  shadcn (UI 컴포넌트 내부 상태)
     이 문서는 client global state 규칙만 기술합니다.
     React 기본 hooks(useState, useReducer, useTransition)는 Skill 참조.
     Server state는 TanStack Query (data-layer.md 참조). -->

> **원칙:** client global state(Zustand)는 UI 전용. 서버 데이터는 TanStack Query.

## Zustand만 사용 (필수)

client global state 라이브러리는 **Zustand만** 허용한다. Redux, Jotai, Recoil, MobX 등 신규 도입 금지.

기존 사용처: `src/modules/demo/{chat,kanban,notifications}/utils/store.ts`

## Store 파일 위치 (필수)

- 위치: `<module>/utils/store.ts`
- 모듈별 디렉터리에 `utils/` 하위 폴더 사용
- 제품 모듈(`src/modules/<name>/`)과 데모 모듈(`src/modules/demo/<name>/`) 동일 규칙

## 슬라이스 패턴 (권장)

- 단일 모듈에서 여러 도메인 상태를 다룰 때: 단일 store + 슬라이스 selector 패턴
- 도메인이 명확히 다르고 모듈 크기가 작은 경우: 다중 store 허용
- 결정 기준: 두 store의 selector를 한 컴포넌트에서 같이 호출해야 하면 단일 store

```typescript
// store.ts
import { create } from 'zustand';

interface ChatState {
  selectedId: string | null;
  isOpen: boolean;
  setSelectedId: (id: string | null) => void;
  toggleOpen: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  selectedId: null,
  isOpen: false,
  setSelectedId: (id) => set({ selectedId: id }),
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
}));

// 컴포넌트: selector만 호출 (불필요 리렌더 방지)
const selectedId = useChatStore((s) => s.selectedId);
```

## Persist (선택)

- `persist` 미들웨어는 localStorage 동기화가 필요한 경우만 (예: 다크모드, 사이드바 collapsed)
- 서버에서 hydrate되는 데이터는 절대 persist 금지 (TanStack Query 영역)
- persist key는 `${moduleName}:${storeName}` 네임스페이스

## 금지 패턴

- ❌ Zustand store에서 서버 fetch 함수 호출 — TanStack Query 영역
- ❌ 컴포넌트 내부에 `useState`로 관리 가능한 UI 상태를 store에 두기
- ❌ store 간 직접 import — 컴포넌트에서 두 store를 호출
- ❌ `useChatStore()` (selector 없이 전체 구독) — 불필요 리렌더

## 새 라이브러리 도입 절차

신규 client state 라이브러리 도입이 필요하면:
1. PR에 `왜 Zustand로 불가능한지` 명시
2. 이 문서(`state-management.md`)에 새 라이브러리 섹션 추가
3. 팀 리뷰 필수
```

- [ ] **Step 2: 파일 확인**

Run:
```bash
wc -l /Users/jerry/dev/scc/docs/common/development/state-management.md
```

Expected: 80-100 라인.

- [ ] **Step 3: 커밋**

```bash
cd /Users/jerry/dev/scc
git add docs/common/development/state-management.md
git commit -m "docs(state-management): Zustand 규칙 신규 문서

client global state는 Zustand만. server state는 TanStack Query.
store 위치, 슬라이스, persist, 금지 패턴 명시.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Phase 3 — `testing.md` 신규 생성

**Files:**
- Create: `/Users/jerry/dev/scc/docs/common/development/testing.md`

- [ ] **Step 1: 파일 작성**

새 파일 `docs/common/development/testing.md` 생성. 내용:

```markdown
# 테스팅 규칙

<!-- 관련 Skills: playwright-best-practices (E2E 패턴, selectors, fixtures)
     이 문서는 프로젝트 테스트 규칙(프레임워크 선택, 컨벤션, TDD 기대)만 기술합니다.
     일반 TDD 방법론은 유저 레벨 자유. -->

> **현 상태 (2026-06-14):** Playwright는 설치되어 있으나 실제 테스트 코드는 작성되지 않음.
> 이 문서는 앞으로의 테스트 작성 규칙을 정의한다.

## 프레임워크 (필수)

| 계층 | 도구 | 용도 |
|------|------|------|
| 단위 | Vitest | 순수 함수, hook, 유틸 |
| 통합 | Vitest + Testing Library | 컴포넌트, 모듈 통합 |
| E2E | Playwright | 사용자 플로우, 크로스 브라우저 |

- Jest, Mocha, Cypress 신규 도입 금지
- React Testing Library는 컴포넌트 테스트 시 Vitest와 함께 사용

## 파일 컨벤션 (필수)

- 단위/통합: `*.test.ts(x)` 또는 `*.spec.ts(x)` — 모듈별로 통일
- E2E: `e2e/*.spec.ts` (Playwright 기본)
- 디렉터리: 모듈 내 co-location 권장 (`<module>/__tests__/`) 또는 src 최상위 `__tests__/`

```
src/modules/ipam/
├── service.ts
├── service.test.ts        # 같은 디렉터리
└── components/
    └── subnet-form.tsx
    └── subnet-form.test.tsx
```

## TDD 기대 (soft enforcement)

- 새 기능/버그 수정 시 테스트 선행 권장
- PR에서 미준수 시 **코드 리뷰 단계에서 코멘트** (도구 강제 없음)
- 핵심 비즈니스 로직(`api/`, `lib/`)은 PR 머지를 위해 테스트 필수
- UI 컴포넌트는 권장 (선택)

## 커버리지 기준

| 영역 | 의무 여부 | 기준 |
|------|----------|------|
| `src/lib/` (유틸) | 필수 | 라인 80% 이상 |
| `src/modules/<name>/api/` (service, queries) | 필수 | 라인 70% 이상 |
| `src/modules/<name>/hooks/` | 권장 | 정성적 검토 |
| `src/components/ui/` (shadcn) | 면제 | shadcn이 보장 |
| `src/components/`, `src/modules/<name>/components/` (도메인) | 권장 | 정성적 검토 |

- `bun run test:coverage`로 측정
- PR에 커버리지 리포트 첨부 권장

## Mocking 규칙

- 네트워크 mocking: MSW (Mock Service Worker) — `src/mocks/` 디렉터리
- 모듈 mocking: `vi.mock()` (Vitest)
- Prisma mocking: `vi.mock('@/lib/prisma')` 또는 통합 테스트 시 test DB
- 실 DB/외부 API 호출은 통합/E2E 테스트에서만

## E2E 작성 패턴

Skills `playwright-best-practices` 참조. 프로젝트 규칙:

- 페이지 객체 패턴 (POM) 사용: `e2e/pages/<view>.ts`
- 픽스처: `e2e/fixtures/` (인증된 사용자, 시드 데이터 등)
- 직렬화(`workers: 1`) 기본 — 병렬은 분리 후 단계적 적용
- CI 환경 변수: `BASE_URL` (Playwright 설정에서 사용)

## 새 프레임워크 도입

신규 테스트 도구 도입 시 PR에 `왜 Vitest/Playwright로 부족한지` 명시 + 이 문서 갱신.

## 참고

- 일반 TDD 워크플로우(red-green-refactor)는 superpowers `test-driven-development` Skill 참조 (유저 레벨)
- 검증 습관: superpowers `verification-before-completion` Skill 참조 (유저 레벨)
```

- [ ] **Step 2: 파일 확인**

Run:
```bash
wc -l /Users/jerry/dev/scc/docs/common/development/testing.md
```

Expected: 90-110 라인.

- [ ] **Step 3: 커밋**

```bash
cd /Users/jerry/dev/scc
git add docs/common/development/testing.md
git commit -m "docs(testing): 테스트 규칙 신규 문서

Vitest(단위/통합) + Playwright(E2E) 규칙.
TDD는 soft enforcement(리뷰 코멘트), 커버리지 기준 명시.
playwright-best-practices Skill 참조.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Phase 2 — `typescript.md` 확장

**Files:**
- Modify: `/Users/jerry/dev/scc/docs/common/development/typescript.md`

- [ ] **Step 1: 현재 파일 전체 읽기**

Run:
```bash
cat /Users/jerry/dev/scc/docs/common/development/typescript.md
```

Expected: 20라인의 짧은 파일. 현재 4개 규칙.

- [ ] **Step 2: Skill 참조 주석 추가 + 본문 확장**

기존 내용 끝에 다음 섹션들 추가. `# TypeScript 규칙` 다음 줄에 주석 삽입 후 기존 본문 유지, 마지막에 새 섹션들 추가.

`typescript.md` 전체를 다음 내용으로 교체:

```markdown
# TypeScript 규칙

<!-- 관련 Skills: vercel-react-best-practices (React 타입 패턴),
                  shadcn (컴포넌트 props 타입)
     이 문서는 프로젝트 TypeScript 규칙만 기술합니다.
     React 19 타입은 Skill 참조. -->

## `any` 금지 (필수)

- 대신 `unknown` + 타입 가드 사용
- 서드파티 제네릭 제약, TanStack Form + Zod 불일치: `// @reason` 주석과 함께 예외 허용

## 객체 타입 (권장)

- 객체 정의는 `interface` 우선 (병합/확장 용이)
- 유니온, 매핑 타입은 `type` 사용

## 환경 변수 (필수)

- 클라이언트 접근 변수만 `NEXT_PUBLIC_` 접두사 사용
- 시크릿 키는 절대 `NEXT_PUBLIC_`로 노출 금지

## 폼 타입 (필수)

- 폼 값 타입은 항상 `z.infer<typeof schema>` 사용 -- 수동 타입 정의 금지

## `satisfies` 사용 (권장)

- 객체 리터럴이 특정 타입을 만족하는지 검증하되, 추론된 리터럴 타입을 유지
- `as`보다 우선 사용

```typescript
// Good: satisfies는 추론 유지
const routes = {
  home: '/',
  settings: '/settings',
} satisfies Record<string, string>;
// routes.home은 '' (리터럴), satisfies가 Record<string, string> 검증

// Bad: as는 추론 손실
const routes = {
  home: '/',
  settings: '/settings',
} as Record<string, string>;
// routes.home은 string (넓어짐)
```

## Branded Types (권장)

- 도메인 ID, IP, MAC 등 의미적으로 다른 string/number를 구분

```typescript
type SubnetId = string & { __brand: 'SubnetId' };
type DeviceId = string & { __brand: 'DeviceId' };

function getSubnet(id: SubnetId) { /* ... */ }
const id: string = '...';
getSubnet(id); // ❌ 컴파일 에러
const subnetId = id as SubnetId; // 명시적 캐스팅 필요
```

## Discriminated Unions (권장)

- 상태/액션 표현 시 `kind` 또는 `type` 필드로 판별

```typescript
type AsyncState<T> =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; data: T }
  | { kind: 'error'; error: Error };

// 사용: switch로 exhaustiveness 보장
switch (state.kind) {
  case 'idle': /* ... */ break;
  case 'loading': /* ... */ break;
  case 'success': /* ... */ break;
  case 'error': /* ... */ break;
}
```

## `as const` 활용 (권장)

- 리터럴 타입 보존, readonly 배열/객체

```typescript
// Good
const STATUSES = ['active', 'inactive', 'pending'] as const;
type Status = (typeof STATUSES)[number]; // 'active' | 'inactive' | 'pending'

// Bad
const STATUSES: string[] = ['active', 'inactive', 'pending'];
type Status = string; // 너무 넓음
```

## Generic Constraints (권장)

- 제네릭 타입 매개변수에 `extends`로 제약 추가

```typescript
// Good
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  // ...
}

// Bad: any 사용
function pick(obj: any, keys: any[]): any { /* ... */ }
```

## 유틸리티 타입 조합 (권장)

- `Pick`, `Omit`, `Partial`, `Required`, `Record` 조합으로 derived 타입 생성
- 중복 타입 정의 금지

```typescript
type SubnetSummary = Pick<Subnet, 'id' | 'network' | 'cidr'>;
type SubnetUpdate = Partial<Pick<Subnet, 'name' | 'description'>>;
type SubnetBySite = Record<SiteId, Subnet[]>;
```

## `// @reason` 주석 (필수, any 예외 시)

`any` 사용 시 반드시 이유 명시:

```typescript
// @reason: TanStack Form onChange 시그니처가 unknown을 허용하지 않음
const value: any = event.target.value;
```

## `// @ts-expect-error` / `// @ts-ignore` (권장 금지)

- 타입 에러 회피용 주석은 사용 금지
- 진짜로 타입 정의가 잘못된 경우만 사용, 사유 명시
```

- [ ] **Step 3: 라인 수 확인**

Run:
```bash
wc -l /Users/jerry/dev/scc/docs/common/development/typescript.md
```

Expected: 130-160 라인.

- [ ] **Step 4: 커밋**

```bash
cd /Users/jerry/dev/scc
git add docs/common/development/typescript.md
git commit -m "docs(typescript): 규칙 확장 (satisifies, branded, discriminated unions 등)

20 → 130+ 라인. satisfies/as const/branded types/discriminated unions/
generic constraints/유틸리티 타입 패턴 추가.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Phase 2 — `prisma.md` 확장

**Files:**
- Modify: `/Users/jerry/dev/scc/docs/common/development/prisma.md`

- [ ] **Step 1: 현재 파일 전체 읽기**

Run:
```bash
cat /Users/jerry/dev/scc/docs/common/development/prisma.md
```

Expected: 24라인, db push 금지 + 마이그레이션 명령어.

- [ ] **Step 2: Skill 참조 주석 + 본문 확장**

`prisma.md` 전체를 다음 내용으로 교체:

```markdown
# Prisma 규칙

<!-- 관련 Skills: 해당 없음
     이 문서는 프로젝트 Prisma 규칙(db push 금지, 마이그레이션, 스키마/쿼리 패턴)만 기술합니다. -->

## `prisma db push` 절대 금지

- `prisma db push`는 기존 데이터를 전량 삭제하고 마이그레이션 이력을 파괴함
- `--accept-data-loss` 플래그는 데이터 손실을 의미 -- 어디서도 사용 금지 (개발/스테이징/프로덕션)
- 항상 `prisma migrate dev` 또는 `prisma migrate deploy` 사용

## 허용된 명령어

| 명령어 | 용도 |
| ------- | ------- |
| `prisma migrate dev --name YYMMDD_description` | 스키마 변경 시 마이그레이션 생성 및 적용 |
| `prisma migrate deploy` | 대기 중인 모든 마이그레이션 적용 (새 환경/DB 이관) |
| `prisma generate` | Prisma Client 재생성 |
| `prisma migrate status` | 마이그레이션 적용 상태 확인 |
| `prisma migrate diff` | 스키마와 마이그레이션 간 차이 감지 |

## 마이그레이션 네이밍

- 형식: `YYMMDD_작업-내용`
- 예시: `270524_add_batch_move_api`, `270523_add_folder_and_remove_tags`

> 실무 워크플로우 및 Shadow DB 설정은 `prisma/CLAUDE.md` 참조.

## 스키마 네이밍 (필수)

- Model: `PascalCase`, 단수형 (`Subnet`, `IpAddress`)
- Field: `camelCase` (`networkCidr`, `createdAt`)
- Relation 필드: 명시적 이름 (`author User @relation(...)`)
- Index/Unique 이름: `${Model}_${field}_idx` / `${Model}_${field}_key` (예: `Subnet_networkCidr_idx`)
- Enum: `PascalCase` 멤버, `SCREAMING_SNAKE_CASE` 값

## 인덱스/제약조건 (필수)

- 단일 필드 인덱스가 필요한 컬럼은 `@@index` 명시
- 복합 인덱스: 자주 함께 조회되는 필드 조합
- Unique 제약: 비즈니스 유니크 키 (예: `Subnet.networkCidr` 는 사이트 내 유니크)
- 복합 유니크: `@@unique([siteId, networkCidr])` (사이트 스코프)

```prisma
model Subnet {
  id          Int      @id @default(autoincrement())
  siteId      Int
  networkCidr String
  createdAt   DateTime @default(now())

  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@unique([siteId, networkCidr])
  @@index([siteId])
  @@index([createdAt])
}
```

## Relation 규칙 (필수)

- `onDelete` / `onUpdate` 명시 (기본값 의존 금지)
- `Cascade`: 부모 삭제 시 자식도 삭제 (예: 사이트 삭제 → 서브넷 삭제)
- `Restrict`: 부모가 자식 참조 중이면 삭제 거부 (예: 디바이스가 참조 중인 사이트)
- `SetNull`: 참조만 끊고 보존 (예: 디바이스 owner)

## 쿼리 최적화 (필수)

### N+1 방지

- `include`/`select`로 한 번에 가져오기
- ❌ `for (const s of subnets) { await db.device.findMany({ where: { subnetId: s.id } }); }`
- ✅ `db.subnet.findMany({ include: { devices: true } })`

### 필요한 필드만 select

```typescript
// Good: 필요한 필드만
const subnets = await db.subnet.findMany({
  select: { id: true, networkCidr: true, site: { select: { name: true } } },
});

// Bad: 전체 필드
const subnets = await db.subnet.findMany({ include: { site: true } });
```

### 페이지네이션

- `skip`/`take` 또는 cursor 기반 (`cursor` + `take`)
- 무한 스크롤: cursor 권장

## 트랜잭션 (필수)

- 여러 모델 변경이 한 단위인 경우 `$transaction` 사용
- 트랜잭션 내 부분 실패 시 자동 롤백

```typescript
// Good
await db.$transaction(async (tx) => {
  const subnet = await tx.subnet.create({ data: { ... } });
  await tx.ipAddress.createMany({ data: ips.map((ip) => ({ ...ip, subnetId: subnet.id })) });
  return subnet;
});

// Bad: 부분 실패 시 데이터 불일치
const subnet = await db.subnet.create({ data: { ... } });
await db.ipAddress.createMany({ data: ips.map((ip) => ({ ...ip, subnetId: subnet.id })) });
```

- 인터랙티브 트랜잭션(`$transaction(async (tx) => ...)`) 권장
- 단순 변경은 `db.$transaction([op1, op2, op3])` 배열 형태 가능

## Shadow DB (개발)

- `prisma migrate dev`는 shadow DB로 변경 검증
- shadow DB는 `prisma migrate dev` 실행 시 자동 생성/삭제
- Docker compose로 띄운 Postgres 사용 권장 (`.env`의 `DATABASE_URL_SHADOW`)
- shadow DB는 `prisma migrate reset`으로 정리 가능

## 금지 패턴

- ❌ `db push` 사용
- ❌ 마이그레이션 파일 직접 수정 (재실행 시 충돌)
- ❌ `prisma.schema`에서 모델 간 순환 의존 (의미적으로 분리)
- ❌ 모델 간 cross-schema query (모듈 경계 무시)
```

- [ ] **Step 3: 라인 수 확인**

Run:
```bash
wc -l /Users/jerry/dev/scc/docs/common/development/prisma.md
```

Expected: 150-180 라인.

- [ ] **Step 4: 커밋**

```bash
cd /Users/jerry/dev/scc
git add docs/common/development/prisma.md
git commit -m "docs(prisma): 규칙 확장 (스키마/쿼리/트랜잭션)

24 → 150+ 라인. 스키마 네이밍, 인덱스/제약조건, relation 규칙,
쿼리 최적화(n+1 방지, select), \$transaction, shadow DB 정책 추가.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: Phase 4 — `theme-patterns.md` 슬림화

**Files:**
- Modify: `/Users/jerry/dev/scc/docs/common/development/theme-patterns.md`

- [ ] **Step 1: 현재 파일 구조 파악**

Run:
```bash
grep -E "^##" /Users/jerry/dev/scc/docs/common/development/theme-patterns.md
```

Expected: 604라인, 여러 `##` 섹션. 어떤 섹션이 있고 무엇을 보존할지 결정.

- [ ] **Step 2: 보존할 섹션 결정**

원칙: **반복/팽창된 사례·OKLCH 정의 등 reference 성격은 제거**. 핵심 사용 패턴(테마 토큰 사용, dark/light 전환)만 보존.

다음 섹션만 보존:
- 도입/개요 (있는 경우 짧게)
- 테마 토큰 사용 규칙
- dark/light 모드 전환 패턴 (있다면)

이외 섹션(OKLCH 이론, 색상 표, 장황한 사례)은 **삭제**.

만약 보존할 섹션이 불명확하면:
- 사용자에게 `theme-patterns.md`의 어느 섹션을 보존할지 확인
- 그 때까지 Task 13 보류

- [ ] **Step 3: 새 파일 내용 작성**

새 `theme-patterns.md` 내용 (예시 — Step 2에서 결정된 섹션에 따라 조정):

```markdown
# 테마 패턴

<!-- 관련 Skills: shadcn (semantic colors), web-design-guidelines (theming)
     이 문서는 프로젝트 테마 토큰 사용 패턴만 기술합니다.
     OKLCH 이론, 색상 정의는 shadcn 공식 문서 참조. -->

> **현 상태 (2026-06-14):** OKLCH 기반 디자인 토큰은 이미 토큰화되어 `src/styles/`에 정의됨.
> 이 문서는 토큰을 **어떻게 사용하는지**만 다룬다.

## 테마 토큰 사용 (필수)

[Step 2에서 결정된 보존 섹션 — 예:]

```typescript
// Good
<div className="bg-primary text-primary-foreground">

// Bad
<div className="bg-blue-500 text-white">
```

## 다크/라이트 모드 전환 (필수)

- `next-themes` 사용 (`src/components/themes/`)
- 시스템 설정 따름: `defaultTheme="system"`
- 전환은 `useTheme()` 훅 경유, 직접 DOM 조작 금지

## 새 토큰 추가 절차

1. `src/styles/globals.css`에 OKLCH 값 정의
2. `tailwind.config.ts`의 theme.extend.colors에 매핑
3. 이 문서에 사용 예시 추가

## 금지 패턴

- ❌ 정적 색상 클래스 (`text-red-500`, `bg-blue-600` 등) — [styling.md](styling.md) 참조
- ❌ 인라인 `style={{ color: '#...' }}` — 토큰 우선
- ❌ 다크 모드 분기를 JSX에서 (`theme === 'dark' ? ... : ...`) — CSS 변수로 처리
```

- [ ] **Step 4: 라인 수 확인**

Run:
```bash
wc -l /Users/jerry/dev/scc/docs/common/development/theme-patterns.md
```

Expected: 80-120 라인.

- [ ] **Step 5: 커밋**

```bash
cd /Users/jerry/dev/scc
git add docs/common/development/theme-patterns.md
git commit -m "docs(theme-patterns): 슬림화 (604 → 100 라인 내외)

핵심 토큰 사용 + 다크/라이트 전환만 보존. OKLCH 이론/색상 표/장황한
사례는 shadcn 공식 문서로 위임.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: Phase 5 — `form-patterns.md` 분할

**Files:**
- Modify: `/Users/jerry/dev/scc/docs/common/development/form-patterns.md`
- Create: `/Users/jerry/dev/scc/docs/common/development/form-setup-patterns.md`
- Create: `/Users/jerry/dev/scc/docs/common/development/form-validation-patterns.md`
- Create: `/Users/jerry/dev/scc/docs/common/development/form-submission-patterns.md`
- Create: `/Users/jerry/dev/scc/docs/common/development/form-sheet-dialog-patterns.md`

- [ ] **Step 1: 현재 form-patterns.md 구조 파악**

Run:
```bash
grep -E "^#" /Users/jerry/dev/scc/docs/common/development/form-patterns.md
```

Expected: 1043라인, 여러 `#`/`##`/`###` 헤딩. 어떤 내용이 어떤 카테고리에 속하는지 파악.

- [ ] **Step 2: 카테고리별 내용 매핑**

다음 4개 카테고리로 분할:
- `form-setup-patterns.md`: `useAppForm` 설정, 필드 어댑터, 컨텍스트 프로바이더
- `form-validation-patterns.md`: Zod 스키마, `onBlur`/`onChange`/`onSubmit` 전략, 서버 중복 검사
- `form-submission-patterns.md`: mutation 연동, 토스트, 리다이렉트, 에러
- `form-sheet-dialog-patterns.md`: Sheet/Dialog 내 폼, 외부 제출 버튼

`form-patterns.md` 자체는 인덱스 역할로 축소.

- [ ] **Step 3: `form-setup-patterns.md` 생성**

기존 `form-patterns.md`에서 "useAppForm 설정", "필드 어댑터", "컨텍스트 프로바이더" 관련 섹션을 추출하여 새 파일에 작성.

(내용은 Step 1에서 파악한 실제 섹션에 따라 결정. 추출 시 코드 블록/예제 그대로 이동.)

- [ ] **Step 4: `form-validation-patterns.md` 생성**

Zod 스키마, 검증 전략 관련 섹션 추출.

- [ ] **Step 5: `form-submission-patterns.md` 생성**

mutation 연동, 토스트, 리다이렉트, 에러 관련 섹션 추출.

- [ ] **Step 6: `form-sheet-dialog-patterns.md` 생성**

Sheet/Dialog 내 폼, 외부 제출 버튼 관련 섹션 추출.

- [ ] **Step 7: `form-patterns.md`를 인덱스로 축소**

다음 내용으로 교체:

```markdown
# 폼 패턴 (인덱스)

<!-- 관련 Skills: 해당 없음 (프로젝트 폼 추상화는 forms.md 참조)
     이 문서는 폼 패턴 파일들의 인덱스입니다.
     각 패턴 파일은 복사용 예제 + 권장 접근법. -->

> 폼 **규칙**(필수, 위반 시 리뷰 거절)은 [forms.md](forms.md) 참조.
> 이 디렉터리의 `*-patterns.md` 파일들은 **권장 패턴 + 복사용 예제**.

## 패턴 파일

| 파일 | 주제 |
|------|------|
| [form-setup-patterns.md](form-setup-patterns.md) | useAppForm 설정, 필드 어댑터, 컨텍스트 프로바이더 |
| [form-validation-patterns.md](form-validation-patterns.md) | Zod 스키마, onBlur/onChange/onSubmit 전략, 서버 중복 검사 |
| [form-submission-patterns.md](form-submission-patterns.md) | mutation 연동, 토스트, 리다이렉트, 에러 처리 |
| [form-sheet-dialog-patterns.md](form-sheet-dialog-patterns.md) | Sheet/Dialog 내 폼, 외부 제출 버튼 |

## 새 폼 작성 흐름

1. [forms.md](forms.md) 의 규칙 확인 (필수 도구, 필드 타입, 검증 단계)
2. 이 인덱스에서 해당 주제의 패턴 파일 열기
3. 예제 코드를 프로젝트 상황에 맞게 복사·수정

## 패턴 추가 절차

- 새 폼 패턴 발견 시 적절한 `*-patterns.md` 파일에 추가
- 새로운 큰 주제 발생 시 새 `form-<topic>-patterns.md` 생성 + 이 인덱스에 등록
```

- [ ] **Step 8: 라인 수 확인**

Run:
```bash
wc -l /Users/jerry/dev/scc/docs/common/development/form-*.md
```

Expected:
- `form-patterns.md`: 50-70 라인 (인덱스)
- `form-setup-patterns.md`, `form-validation-patterns.md`, `form-submission-patterns.md`, `form-sheet-dialog-patterns.md`: 각 150-300 라인

- [ ] **Step 9: 커밋**

```bash
cd /Users/jerry/dev/scc
git add docs/common/development/form-patterns.md \
        docs/common/development/form-setup-patterns.md \
        docs/common/development/form-validation-patterns.md \
        docs/common/development/form-submission-patterns.md \
        docs/common/development/form-sheet-dialog-patterns.md
git commit -m "docs(form-patterns): 1043 → 5개 파일로 분할

form-patterns.md(인덱스) + 4개 주제별 파일. 사용 흐름 명확화.
기존 내용 4개 카테고리로 매핑 (setup/validation/submission/sheet-dialog).

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 15: Phase 6 — `docs/common/development/index.md` 갱신

**Files:**
- Modify: `/Users/jerry/dev/scc/docs/common/development/index.md`

- [ ] **Step 1: 현재 index.md 확인**

Run:
```bash
cat /Users/jerry/dev/scc/docs/common/development/index.md
```

Expected: 64라인, 파일 목록 + 디렉터리 구조 표 + 링크 상태.

- [ ] **Step 2: 파일 목록 표 갱신**

`## 디렉터리 구조` 섹션의 표에 다음 행 추가/수정:

**추가할 행:**
```
| `server-actions.md` | Server Actions 규칙 | Server Actions, mutation |
| `state-management.md` | 상태 관리 규칙 (Zustand) | Zustand, store |
| `testing.md` | 테스팅 규칙 | Vitest, Playwright, TDD |
| `form-setup-patterns.md` | 폼 설정 패턴 | useAppForm, 필드 어댑터 |
| `form-validation-patterns.md` | 폼 유효성 검사 패턴 | Zod, onBlur/onChange |
| `form-submission-patterns.md` | 폼 제출 패턴 | mutation, 토스트 |
| `form-sheet-dialog-patterns.md` | Sheet/Dialog 폼 패턴 | Sheet, Dialog, 외부 제출 |
```

**수정할 행:**
- `form-patterns.md`: 설명을 "폼 패턴 인덱스 (4개 파일로 분할됨)" 로 변경
- `theme-patterns.md`: 설명을 "테마 패턴 (슬림화됨)" 로 변경
- `typescript.md`, `prisma.md`: 설명에 "(확장됨)" 추가

- [ ] **Step 3: LINK STATUS 영역 보존**

`<!-- LINK STATUS START -->` / `<!-- LINK STATUS END -->` 사이의 표는 **수정하지 않는다** (자동 생성 영역).

- [ ] **Step 4: 변경 확인**

Run:
```bash
cat /Users/jerry/dev/scc/docs/common/development/index.md
```

Expected: 파일 목록 표에 신규/분할 파일 반영. LINK STATUS 영역 보존.

- [ ] **Step 5: 커밋**

```bash
cd /Users/jerry/dev/scc
git add docs/common/development/index.md
git commit -m "docs(development/index): 신규/분할/슬림 파일 반영

신규: server-actions, state-management, testing, form-*-patterns 4개
수정: form-patterns(인덱스), theme-patterns(슬림), typescript(확장), prisma(확장)
LINK STATUS 영역은 자동 생성 영역으로 보존.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 16: Phase 7 — 검증

**Files:** (없음, 검증만)

- [ ] **Step 1: TypeScript 타입 체크**

Run:
```bash
cd /Users/jerry/dev/scc
bun tsc --noEmit 2>&1 | tail -20
```

Expected: 0 에러. (이 작업은 문서 변경만 — 코드 변경 없음 — 이므로 기존 상태 그대로 통과해야 함.)

만약 에러가 있다면 → 문서 작업이 코드를 건드린 것은 아니므로 원인 조사. (있을 수 없음, 이 태스크는 문서만 다룸.)

- [ ] **Step 2: 프로덕션 빌드**

Run:
```bash
cd /Users/jerry/dev/scc
bun run build 2>&1 | tail -30
```

Expected: 빌드 성공. (문서 변경만 — 빌드는 영향 없음.)

- [ ] **Step 3: 문서 링크 검증**

Run:
```bash
cd /Users/jerry/dev/scc
python3 scripts/doc-links.py 2>&1 | tail -20
```

Expected: 모든 링크 유효. LINK STATUS 자동 갱신된 diff 발생 시 stage (별도 커밋은 아님, 이 태스크에서 함께).

```bash
git add docs/common/development/index.md
```

- [ ] **Step 4: 신규 파일 존재 확인**

Run:
```bash
ls /Users/jerry/dev/scc/docs/common/development/{server-actions,state-management,testing,form-setup-patterns,form-validation-patterns,form-submission-patterns,form-sheet-dialog-patterns}.md
```

Expected: 7개 파일 모두 존재.

- [ ] **Step 5: Skill 상태 확인**

Run:
```bash
ls /Users/jerry/dev/scc/.claude/skills/
```

Expected: `frontend-design` 없음, `playwright-best-practices` 존재.

- [ ] **Step 6: 검증 결과 커밋 (해당 시)**

Step 3에서 LINK STATUS 자동 갱신이 있었다면:
```bash
cd /Users/jerry/dev/scc
git status --short
git diff --cached --stat
```

갱신된 내용만 있는지 확인:
```bash
git commit -m "docs(development): link-status 자동 갱신

신규/분할/슬림 파일 반영으로 인한 링크 상태 갱신.

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

자동 갱신이 없었다면 (이미 최신) 커밋 스킵.

- [ ] **Step 7: 최종 상태 요약 (텍스트)**

사용자에게 보고:

```
✅ 가이드 시스템 재설계 완료
- Skill: frontend-design 삭제, playwright-best-practices 추가
- 신규 문서: server-actions.md, state-management.md, testing.md
- 분할: form-patterns.md → 5개 파일
- 슬림: theme-patterns.md (604 → ~100 라인)
- 확장: typescript.md (20 → 130+), prisma.md (24 → 150+)
- 검증: tsc/build/doc-links 통과
```

---

## Self-Review

스펙 vs 계획 커버리지:

| 스펙 요구사항 | 태스크 |
|------------|--------|
| Phase 0: frontend-design 삭제 | Task 1 |
| Phase 0: playwright-best-practices 설치 | Task 2 |
| Phase 1: react.md Skill 참조 | Task 3 |
| Phase 1: styling.md Skill 참조 | Task 4 |
| Phase 1: component-patterns.md Skill 참조 | Task 5 |
| Phase 1: data-layer.md Skill 참조 + Server Actions | Task 6 |
| Phase 1: forms.md Skill 참조 | Task 7 |
| Phase 3: server-actions.md 신규 | Task 8 |
| Phase 3: state-management.md 신규 | Task 9 |
| Phase 3: testing.md 신규 | Task 10 |
| Phase 2: typescript.md 확장 | Task 11 |
| Phase 2: prisma.md 확장 | Task 12 |
| Phase 4: theme-patterns.md 슬림 | Task 13 |
| Phase 5: form-patterns.md 분할 | Task 14 |
| Phase 6: index.md 갱신 | Task 15 |
| Phase 7: 검증 | Task 16 |

모든 스펙 항목이 태스크로 매핑됨.

**Placeholder scan:** 없음. 모든 코드/명령어 실제 내용 포함.

**타입 일관성:** 모든 신규 파일의 헤딩/구조가 일관됨 (`# 제목` + `<!-- 관련 Skills -->` 주석).

---

## 실행 옵션

이 계획 실행 방법은 두 가지:

1. **Subagent-Driven (권장)**: 태스크마다 새로운 서브에이전트를 디스패치하고 리뷰. 빠른 반복.
2. **Inline Execution**: 이 세션에서 태스크들을 직접 실행, 체크포인트마다 리뷰.

어느 방식으로 진행할까요?
