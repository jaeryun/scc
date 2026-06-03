# 데모 페이지 3 카테고리 재편 설계 문서 (v3)

> 기존 `demo-components` 뷰를 3개 독립 뷰로 분리하고 URL도 함께 이전

**작성일**: 2026-05-24
**수정일**: 2026-05-24 (v3 — Senior Dev + Project Manager 리뷰 반영)
**상태**: 최종 검토

---

## 1. 개요

기존 단일 `(데모)컴포넌트 모음` 뷰에 11개 페이지가 flat하게 나열된 구조를,
3개 카테고리로 분리하여 각각 독립 뷰로 승격시킨다.

**경계 기준**: "API 호출/서버 상태 관리가 있는가"
- 순수 UI: 없음 (로컬 상태만)
- UI + Logic: React Query / mock API / Prisma 연동

---

## 2. 뷰 구조

| 뷰 ID | 레이블 | URL prefix | 성격 |
|-------|--------|------------|------|
| `demo-ui` | `[데모] 순수 UI` | `/demo-ui/` | 데이터 연결 없는 순수 UI 데모 |
| `demo-logic` | `[데모] UI + Logic` | `/demo-logic/` | mock API/React Query 연동 데모 |
| `api-reference` | `API Reference` | `/api-reference/` | OpenAPI 문서 + 테스트 |

---

## 3. 페이지 분류 및 경로

### 3.1 `demo-ui` (순수 UI)

| 기존 경로 | 신규 경로 |
|-----------|-----------|
| `/demo-components/kanban` | `/demo-ui/kanban` |
| `/demo-components/chat` | `/demo-ui/chat` |
| `/demo-components/forms/basic` | `/demo-ui/forms/basic` |
| `/demo-components/forms/multi-step` | `/demo-ui/forms/multi-step` |
| `/demo-components/forms/sheet-form` | `/demo-ui/forms/sheet-form` |
| `/demo-components/forms/advanced` | `/demo-ui/forms/advanced` |
| `/demo-components/elements/icons` | `/demo-ui/icons` |
| `/demo-components/notifications` | `/demo-ui/notifications` |
| `/demo-components/profile/[[...profile]]` | `/demo-ui/profile/[[...profile]]` |

### 3.2 `demo-logic` (UI + Logic)

| 기존 경로 | 신규 경로 |
|-----------|-----------|
| `/demo-components/overview` | `/demo-logic/overview` |
| `/demo-components/products` | `/demo-logic/products` |
| `/demo-components/products/[productId]` | `/demo-logic/products/[productId]` |
| `/demo-components/users` | `/demo-logic/users` |
| `/demo-components/grid-dashboard` | `/demo-logic/grid-dashboard` |
| `/demo-components/grid-dashboard/[dashboardId]` | `/demo-logic/grid-dashboard/[dashboardId]` |
| `/demo-components/switch-mapping` | `/demo-logic/switch-mapping` |
| `/demo-components/react-query` | `/demo-logic/react-query` |
| `/demo-components/billing` | `/demo-logic/billing` |
| `/demo-components/exclusive` | `/demo-logic/exclusive` |
| `/demo-components/workspaces` | `/demo-logic/workspaces` |
| `/demo-components/workspaces/team/[[...rest]]` | `/demo-logic/workspaces/team/[[...rest]]` |

### 3.3 `api-reference` (완료, 변경 없음)

---

## 4. 뷰 설정

### 4.1 `src/config/views.ts`

`demo-components` 뷰를 제거하고 다음 3개 뷰로 대체:

```typescript
{
  id: 'demo-ui',
  label: '[데모] 순수 UI',
  icon: 'palette',
  navItems: [
    { title: '칸반 보드', href: '/demo-ui/kanban', icon: 'kanban' },
    { title: '채팅', href: '/demo-ui/chat', icon: 'chat' },
    { title: '폼', href: '/demo-ui/forms/basic', icon: 'forms' },
    { title: '아이콘', href: '/demo-ui/icons', icon: 'palette' },
    { title: '알림', href: '/demo-ui/notifications', icon: 'notification' },
    { title: '프로필', href: '/demo-ui/profile', icon: 'teams' }
  ]
},
{
  id: 'demo-logic',
  label: '[데모] UI + Logic',
  icon: 'code',
  navItems: [
    { title: '대시보드', href: '/demo-logic/overview', icon: 'dashboard' },
    { title: '상품 관리', href: '/demo-logic/products', icon: 'product' },
    { title: '사용자 관리', href: '/demo-logic/users', icon: 'teams' },
    { title: '그리드 대시보드', href: '/demo-logic/grid-dashboard', icon: 'dashboard' },
    { title: '스위치 매핑', href: '/demo-logic/switch-mapping', icon: 'network' },
    { title: 'React Query', href: '/demo-logic/react-query', icon: 'code' },
    { title: 'Billing', href: '/demo-logic/billing', icon: 'payment' },
    { title: 'Exclusive', href: '/demo-logic/exclusive', icon: 'shapes' },
    { title: 'Workspaces', href: '/demo-logic/workspaces', icon: 'building' }
  ]
},
{
  id: 'api-reference',
  label: 'API Reference',
  icon: 'api',
  navItems: [
    { title: 'All APIs', href: '/api-reference', icon: 'listTree' },
    { title: 'SemaphoreUI', href: '/api-reference/semaphore', icon: 'serverBolt' }
  ]
}
```

### 4.2 `src/config/nav-config.ts`

기존 Components/Elements 그룹을 분해하여 새 그룹으로 재편:

```typescript
{
  label: '순수 UI',
  items: [
    { title: 'Kanban', url: '/demo-ui/kanban', icon: 'kanban', items: [] },
    { title: 'Chat', url: '/demo-ui/chat', icon: 'chat', items: [] },
    {
      title: 'Forms', url: '/demo-ui/forms/basic', icon: 'forms',
      items: [
        { title: 'Basic Form', url: '/demo-ui/forms/basic', icon: 'forms' },
        { title: 'Multi-Step Form', url: '/demo-ui/forms/multi-step', icon: 'forms' },
        { title: 'Sheet & Dialog', url: '/demo-ui/forms/sheet-form', icon: 'forms' },
        { title: 'Advanced Patterns', url: '/demo-ui/forms/advanced', icon: 'forms' }
      ]
    },
    { title: 'Icons', url: '/demo-ui/icons', icon: 'palette', items: [] },
    { title: 'Notifications', url: '/demo-ui/notifications', icon: 'notification', items: [] },
    { title: 'Profile', url: '/demo-ui/profile', icon: 'teams', items: [] }
  ]
},
{
  label: 'UI + Logic',
  items: [
    { title: 'Overview', url: '/demo-logic/overview', icon: 'dashboard', items: [] },
    { title: 'Products', url: '/demo-logic/products', icon: 'product', items: [] },
    { title: 'Users', url: '/demo-logic/users', icon: 'teams', items: [] },
    { title: 'Grid Dashboard', url: '/demo-logic/grid-dashboard', icon: 'dashboard', items: [] },
    { title: 'Switch Mapping', url: '/demo-logic/switch-mapping', icon: 'network', items: [] },
    { title: 'React Query', url: '/demo-logic/react-query', icon: 'code', items: [] },
    { title: 'Billing', url: '/demo-logic/billing', icon: 'payment', items: [] },
    { title: 'Exclusive', url: '/demo-logic/exclusive', icon: 'shapes', items: [] },
    { title: 'Workspaces', url: '/demo-logic/workspaces', icon: 'building', items: [] }
  ]
}
```

---

## 5. 리디렉션 전략

### 5.1 `next.config.ts` redirects

**주의**: Next.js의 `path-to-regexp`는 negative lookahead `(?!...)`를 지원하지 않으므로,
개별 규칙을 먼저 배치하고 catch-all을 마지막에 두는 순서 의존 방식으로 구현한다.

```typescript
async redirects() {
  return [
    // --- 기존 redirect 업데이트 ---
    {
      source: '/switch-mapping',
      destination: '/demo-logic/switch-mapping',
      permanent: true,
    },

    // --- demo-ui 단독 경로 (catch-all보다 먼저) ---
    { source: '/demo-components/kanban', destination: '/demo-ui/kanban', permanent: true },
    { source: '/demo-components/chat', destination: '/demo-ui/chat', permanent: true },
    { source: '/demo-components/forms/:path*', destination: '/demo-ui/forms/:path*', permanent: true },
    { source: '/demo-components/elements/:path*', destination: '/demo-ui/:path*', permanent: true },
    { source: '/demo-components/notifications', destination: '/demo-ui/notifications', permanent: true },
    { source: '/demo-components/profile/:path*', destination: '/demo-ui/profile/:path*', permanent: true },

    // --- demo-logic catch-all (나머지 모든 경로) ---
    { source: '/demo-components/:path*', destination: '/demo-logic/:path*', permanent: true },
  ];
}
```

**동작 설명**:
1. `/demo-components/kanban` → `/demo-ui/kanban` (개별 규칙 매칭)
2. `/demo-components/forms/basic` → `/demo-ui/forms/basic` (forms 규칙 매칭)
3. `/demo-components/elements/icons` → `/demo-ui/icons` (elements 규칙 매칭)
4. `/demo-components/notifications` → `/demo-ui/notifications` (개별 규칙 매칭)
5. `/demo-components/overview` → `/demo-logic/overview` (catch-all 매칭)
6. `/demo-components/products` → `/demo-logic/products` (catch-all 매칭)

### 5.2 뷰 루트 리디렉션

`/demo-ui`와 `/demo-logic` 루트 URL 접근 시 첫 페이지로 안내:

```typescript
// demo-ui/page.tsx
import { redirect } from 'next/navigation'
export default function DemoUiIndex() {
  redirect('/demo-ui/kanban')
}

// demo-logic/page.tsx
import { redirect } from 'next/navigation'
export default function DemoLogicIndex() {
  redirect('/demo-logic/overview')
}
```

---

## 6. 하드코딩 URL 수정 목록

### 6.1 모듈 레이어 (16곳)

| 파일 | 개수 | 변경 내용 |
|------|:----:|-----------|
| `src/modules/notifications/components/notifications-page.tsx` | 5 | `actionRoutes` 매핑: workspaces, products, billing, kanban, chat |
| `src/modules/notifications/components/notification-center.tsx` | 6 | `actionRoutes` 매핑 + `/demo-components/notifications` 자체 링크 |
| `src/modules/demo-dashboard/components/dashboard-list.tsx` | 5 | `router.push('/demo-components/grid-dashboard/...')` |
| `src/modules/demo-dashboard/components/dashboard-canvas.tsx` | 1 | `router.push('/demo-components/grid-dashboard')` |
| `src/modules/products/components/product-form.tsx` | 2 | `router.push('/demo-components/products')` |
| `src/modules/products/components/product-tables/cell-action.tsx` | 1 | `/demo-components/products/${id}` |

### 6.2 기타 레이어 (6곳)

| 파일 | 개수 | 변경 내용 |
|------|:----:|-----------|
| `src/app/(main)/home/page.tsx` | 1 | "컴포넌트 데모 보기" 링크 → `/demo-logic/overview` |
| `src/app/(main)/demo-components/forms/page.tsx` | 1 | `redirect('/demo-components/forms/basic')` → `/demo-ui/forms/basic` |
| `src/hooks/use-breadcrumbs.tsx` | 2 | `/demo-components`, `/demo-components/products` |
| `src/components/layout/user-nav.tsx` | 1 | `/demo-components/profile` → `/demo-ui/profile` |
| `src/app/(main)/demo-components/products/page.tsx` | 1 | `/demo-components/products/new` — **현재도 404 링크이므로 `/demo-logic/products/new`로 수정하거나 제거** (new는 다이얼로그로 처리 중일 가능성 높음) |

### 6.3 삭제 예정 파일 (수정 불필요)

- `src/app/(main)/demo-components/page.tsx` (데모 소개 인덱스 — 전체 삭제)

### 6.4 리팩토링: notifications 상수화

`notifications-page.tsx`와 `notification-center.tsx`에 중복된 `actionRoutes` 맵.
이 기회에 `src/modules/notifications/constants.ts`로 추출:

```typescript
export const notificationActionRoutes: Record<string, string> = {
  workspaces: '/demo-logic/workspaces',
  products: '/demo-logic/products',
  billing: '/demo-logic/billing',
  kanban: '/demo-ui/kanban',
  chat: '/demo-ui/chat',
}
```

---

## 7. 파일 작업 목록

### 7.1 신규 생성

```
src/app/(main)/demo-ui/layout.tsx       # 단순 패스스루
src/app/(main)/demo-ui/page.tsx         # redirect('/demo-ui/kanban')
src/app/(main)/demo-logic/layout.tsx    # 단순 패스스루
src/app/(main)/demo-logic/page.tsx      # redirect('/demo-logic/overview')
src/modules/notifications/constants.ts  # actionRoutes 상수 (Section 6.4)
```

### 7.2 이동 (`git mv`)

**주의**: bash에서 괄호가 있는 경로는 `\`로 escape 필요.

```bash
# demo-ui (순수 UI)
git mv src/app/\(main\)/demo-components/kanban src/app/\(main\)/demo-ui/kanban
git mv src/app/\(main\)/demo-components/chat src/app/\(main\)/demo-ui/chat
git mv src/app/\(main\)/demo-components/forms src/app/\(main\)/demo-ui/forms
git mv src/app/\(main\)/demo-components/elements/icons src/app/\(main\)/demo-ui/icons
git mv src/app/\(main\)/demo-components/notifications src/app/\(main\)/demo-ui/notifications
git mv src/app/\(main\)/demo-components/profile src/app/\(main\)/demo-ui/profile

# demo-logic (UI + Logic)
git mv src/app/\(main\)/demo-components/overview src/app/\(main\)/demo-logic/overview
git mv src/app/\(main\)/demo-components/products src/app/\(main\)/demo-logic/products
git mv src/app/\(main\)/demo-components/users src/app/\(main\)/demo-logic/users
git mv src/app/\(main\)/demo-components/grid-dashboard src/app/\(main\)/demo-logic/grid-dashboard
git mv src/app/\(main\)/demo-components/switch-mapping src/app/\(main\)/demo-logic/switch-mapping
git mv src/app/\(main\)/demo-components/react-query src/app/\(main\)/demo-logic/react-query
git mv src/app/\(main\)/demo-components/billing src/app/\(main\)/demo-logic/billing
git mv src/app/\(main\)/demo-components/exclusive src/app/\(main\)/demo-logic/exclusive
git mv src/app/\(main\)/demo-components/workspaces src/app/\(main\)/demo-logic/workspaces
```

### 7.3 수정

```
src/config/views.ts                      # demo-components 제거, 3개 새 뷰 추가
src/config/nav-config.ts                 # Components/Elements → 순수 UI / UI + Logic
next.config.ts                           # redirects 추가 + /switch-mapping 업데이트
src/app/(main)/home/page.tsx            # 링크 수정
src/hooks/use-breadcrumbs.tsx           # breadcrumb 매핑 수정
src/components/layout/user-nav.tsx      # 프로필 링크 수정
Section 6의 모든 파일                    # 하드코딩 URL 수정
```

### 7.4 삭제

```
src/app/(main)/demo-components/ (layout.tsx, page.tsx 잔여)
src/app/(main)/demo-components/forms/page.tsx (리디렉트 페이지)
src/app/(main)/demo-components/elements/ (빈 디렉토리 — icons 이동 후)
```

### 7.5 변경하지 않음

```
src/app/api/demo-dashboards/ → 유지
  - API 라우트와 페이지 라우트는 독립적
  - 모듈명(demo-dashboard)과 API명(demo-dashboards) 일관성 유지
  - 변경 시 queries.ts 5곳, mutations.ts 6곳 추가 수정 → 리스크 대비 이득 없음
```

---

## 8. import 경로

페이지 내부에서 `@/modules/...`, `@/components/...` 등 절대 경로 import는
`tsconfig.json`의 path alias로 해석되므로 `git mv` 후에도 그대로 유효.
페이지 간 상대 경로 참조는 `grep`으로 확인 후 수정.

---

## 9. Next.js 특수 라우트 처리

| 패턴 | 위치 | 처리 |
|------|------|------|
| 병렬 라우트 (`@sales`, `@pie_stats` 등) | `overview/@*/` | `git mv`로 디렉토리째 이동 — `layout.tsx`가 슬롯을 prop으로 받음 |
| 동적 라우트 (`[productId]`, `[dashboardId]`) | products/, grid-dashboard/ | 디렉토리명 기반 — 이동 무방 |
| Catch-all (`[[...profile]]`, `[[...rest]]`) | profile/, workspaces/team/ | 디렉토리명 기반 — 이동 무방 |
| `error.tsx`, `loading.tsx`, `default.tsx` | overview/ 및 @*/ 내 | 세그먼트 단위 동작 — 이동 무방. **`default.tsx`는 병렬 라우트 네비게이션에 필수** |

---

## 10. 구현 순서 (Phase 분할 + 롤백 포인트)

### Phase A — 인프라 설정 (config + redirect + layout 선행)

| 단계 | 작업 | 검증 |
|------|------|------|
| A1 | `demo-ui/layout.tsx`, `demo-logic/layout.tsx`, `demo-ui/page.tsx`, `demo-logic/page.tsx` 생성 | — |
| A2 | `next.config.ts` redirects 추가 (+ `/switch-mapping` 업데이트) | — |
| A3 | `views.ts` 재작성 | — |
| A4 | `nav-config.ts` 재작성 | 사이드바에 새 뷰 표시 (클릭 시 404 또는 redirect) |
| **커밋** | `git commit -m "Phase A: add demo-ui/demo-logic views with config and redirects"` | ← 롤백 포인트 |

### Phase B — 파일 이동

| 단계 | 작업 | 검증 |
|------|------|------|
| B1 | `git mv`로 demo-ui 페이지 이동 (6개) | `ls src/app/\(main\)/demo-ui/` — 6개+ |
| B2 | `git mv`로 demo-logic 페이지 이동 (9개) | `ls src/app/\(main\)/demo-logic/overview/@*/` — `default.tsx` 4개 확인 |
| B3 | `elements/` 빈 디렉토리 정리 | — |
| **커밋** | `git commit -m "Phase B: git mv pages to new directory structure"` | ← 롤백 포인트 |

### Phase C — URL 참조 일괄 수정

| 단계 | 작업 | 검증 |
|------|------|------|
| C1 | notifications `actionRoutes` → `constants.ts` 추출 + URL 수정 | — |
| C2 | demo-dashboard 모듈 URL 수정 (2파일, 6곳) | — |
| C3 | products 모듈 URL 수정 (2파일, 3곳) | — |
| C4 | home/page.tsx, user-nav.tsx, forms/page.tsx, breadcrumbs URL 수정 | — |
| C5 | `products/page.tsx`의 `/new` 링크 확인 및 수정/제거 | — |
| **커밋** | `git commit -m "Phase C: update all hardcoded URLs and extract actionRoutes"` | ← 롤백 포인트 |

### Phase D — 정리 + 검증

| 단계 | 작업 | 검증 |
|------|------|------|
| D1 | `demo-components/` 잔여 디렉토리 삭제 | — |
| D2 | `grep -r "demo-components" src/ --include="*.tsx" --include="*.ts"` | 결과 0건 (또는 사유 명시된 파일만) |
| D3 | `bun run build` | 성공, 경고 0, 에러 0 |
| D4 | `bun dev`로 전체 페이지 smoke test | smoke 체크리스트 통과 |
| **커밋** | `git commit -m "Phase D: cleanup old demo-components and verify build"` | 최종 |

### Smoke Test 체크리스트 (D4)

- [ ] `/demo-ui/kanban` — 칸반 보드 정상
- [ ] `/demo-ui/forms/basic` — 기본 폼 정상
- [ ] `/demo-ui/notifications` — 알림 센터 정상
- [ ] `/demo-logic/overview` — 병렬 라우트 4개 슬롯 모두 렌더링
- [ ] `/demo-logic/products` — 제품 테이블 + CRUD 정상
- [ ] `/demo-logic/grid-dashboard` — 그리드 대시보드 정상
- [ ] `/demo-logic/workspaces` — 워크스페이스 정상
- [ ] `/demo-components/overview` → `/demo-logic/overview`로 redirect
- [ ] `/demo-components/kanban` → `/demo-ui/kanban`로 redirect
- [ ] `/demo-components/elements/icons` → `/demo-ui/icons`로 redirect
- [ ] `/demo-ui` → `/demo-ui/kanban`으로 redirect

### 롤백 전략

| 상황 | 명령어 | 소요 |
|------|--------|:--:|
| Phase A 실패 | `git reset --hard HEAD~1` | 1분 |
| Phase B 충돌 | `git reset --hard HEAD~1` | 1분 |
| Phase C URL 누락 발견 | 개별 파일 `git checkout HEAD~1 -- path` | 1분 |
| Phase D 빌드 실패 | `git stash` + 진단 or `git reset --hard HEAD~1` | 2-5분 |

---

## 11. MVP 최소 검증 (Phase A+B, 45분)

본격 이전 전에 대표 경로 2개로 검증:

```
1. layout.tsx 4개 + page.tsx 2개 생성                    (5분)
2. views.ts, nav-config.ts 재작성                         (10분)
3. next.config.ts redirects 추가 (대표 경로만 3-4개)      (5분)
4. git mv: kanban → demo-ui, overview → demo-logic       (5분)
5. notifications + home 링크만 수정                       (10분)
6. bun dev → kanban + overview 접근 확인                  (10분)
```

MVP 통과 기준:
- 사이드바에 새 뷰 표시
- `/demo-ui/kanban` + `/demo-logic/overview` 정상 렌더링 (병렬 라우트 포함)
- 구 URL redirect 확인

---

## 12. 변경 이력

| 버전 | 변경 |
|------|------|
| v1 | 초안 |
| v2 | Frontend + Architect 리뷰: billing/exclusive/workspaces 추가, API 경로 불변, redirects 추가, URL 목록 구체화 |
| v3 | Senior Dev + Project Manager 리뷰: redirect 버그 수정(negative lookahead 제거, destination 분기), 구현 순서 재배치(config → mv), Phase 분할 + 롤백 전략, MVP 검증, 뷰 루트 redirect 페이지, bash escape 표기 |
