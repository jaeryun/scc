# src/ 프로젝트 구조 컨벤션 감사 보고서

**감사일:** 2026-05-27
**감사 범위:** `src/` 전체 (280개 파일, 23개 모듈)
**감사단:** 아키텍처 감사자 / 코드 품질 감사자 / 데이터 & 상태 관리 감사자 (3인)

---

## 총평

전반적으로 `src/components/` ↔ `src/lib/` ↔ `src/modules/` 간 의존성 방향과 `apiClient` 격리는 잘 지켜지고 있음.
주요 위반은 **일관성 부족**(모듈별 계층 구조 불균일), **컨벤션 누락**(Metadata, any, 색상), **패턴 불일치**(mutation hook vs options) 3축으로 집약됨.

---

## 🔴 CRITICAL (51건)

### C1. Metadata export 누락 — 30개 페이지

전체 48개 page.tsx 중 62%인 30개에서 `export const metadata: Metadata` 누락.

**Root/Redirect (1)**
- `src/app/page.tsx`

**Settings (5)**
- `src/app/(main)/settings/page.tsx`
- `src/app/(main)/settings/appearance/page.tsx`
- `src/app/(main)/settings/general/page.tsx`
- `src/app/(main)/settings/notifications/page.tsx`
- `src/app/(main)/settings/views/page.tsx`

**DCIM (5)**
- `src/app/(main)/dcim/page.tsx`
- `src/app/(main)/dcim/devices/page.tsx`
- `src/app/(main)/dcim/devices/[id]/page.tsx`
- `src/app/(main)/dcim/ipam/page.tsx`
- `src/app/(main)/dcim/ipam/prefixes/[id]/page.tsx`

**Library (19)**
- `src/app/(main)/library/components/chat/page.tsx`
- `src/app/(main)/library/components/forms/page.tsx`
- `src/app/(main)/library/components/forms/basic/page.tsx`
- `src/app/(main)/library/components/forms/advanced/page.tsx`
- `src/app/(main)/library/components/forms/multi-step/page.tsx`
- `src/app/(main)/library/components/forms/sheet-form/page.tsx`
- `src/app/(main)/library/components/icons/page.tsx`
- `src/app/(main)/library/components/kanban/page.tsx`
- `src/app/(main)/library/components/notifications/page.tsx`
- `src/app/(main)/library/components/profile/[[...profile]]/page.tsx`
- `src/app/(main)/library/modules/billing/page.tsx`
- `src/app/(main)/library/modules/exclusive/page.tsx`
- `src/app/(main)/library/modules/products/page.tsx`
- `src/app/(main)/library/modules/products/[productId]/page.tsx`
- `src/app/(main)/library/modules/users/page.tsx`
- `src/app/(main)/library/modules/workspaces/page.tsx`
- `src/app/(main)/library/modules/workspaces/team/[[...rest]]/page.tsx`
- `src/app/(main)/library/modules/react-query/page.tsx`
- `src/app/(main)/library/modules/dashboard/page.tsx`

### C2. `any` 타입 사용 — 9건 (5개 파일, `// @reason` 주석 없음)

| 파일 | 라인 | 내용 |
|------|------|------|
| `src/modules/devices/api/service.ts` | 4 | `raw: any` |
| `src/modules/devices/api/service.ts` | 21,26,31,39 | `apiClient<any[]>` / `apiClient<any>` |
| `src/modules/ipam/api/service.ts` | 4,15 | `raw: any` |
| `src/modules/ipam/api/service.ts` | 31,38,43,55 | `apiClient<any[]>` / `apiClient<any>` |
| `src/modules/interfaces/api/service.ts` | 4,14 | `raw: any`, `p: any` |
| `src/modules/interfaces/api/service.ts` | 24 | `apiClient<any[]>` |
| `src/modules/switch-mapping/api/service.ts` | 11,12 | `apiClient<any>` / `apiClient<any[]>` |
| `src/modules/switch-mapping/api/service.ts` | 16,22,27 | `iface: any`, `p: any` |
| `src/modules/cables/api/service.ts` | 4,22,27,32 | `raw: any`, `apiClient<any>` |

### C3. Tailwind 정적 색상 사용 — 29건 (10개 파일)

컨벤션: `bg-primary`, `text-muted-foreground` 등 CSS 변수 토큰만 사용해야 함.

| 파일 | 위반 클래스 |
|------|-----------|
| `src/modules/devices/components/device-table/columns.tsx` | `bg-green-500`, `bg-red-500`, `bg-cyan-500`, `bg-blue-500`, `bg-gray-400` |
| `src/modules/ipam/components/ip-address-list.tsx` | `bg-green-100`, `text-green-700`, `bg-yellow-100`, `text-yellow-700`, `bg-gray-100`, `text-gray-600` |
| `src/modules/devices/components/device-detail.tsx` | `bg-green-500`, `bg-gray-400` |
| `src/components/ui/file-preview.tsx` | `text-emerald-500`, `text-red-500`, `text-blue-500`, `text-green-500`, `text-yellow-500`, `text-purple-500`, `text-pink-500`, `text-amber-500`, `text-zinc-500` |
| `src/modules/chat/components/conversation-list.tsx` | `bg-green-500`, `bg-red-500` |
| `src/modules/chat/components/chat-header.tsx` | `bg-green-500`, `bg-red-500` |
| `src/modules/dashboard/components/dashboard-list.tsx` | 조건부 색상 템플릿 리터럴 (3건) |
| `src/components/ui/notification-card.tsx` | `bg-sky-500` |
| `src/components/ui/kanban.tsx` | `bg-zinc-100`, `dark:bg-zinc-900` |
| `src/app/(main)/library/components/static-pages/error/page.tsx` | `text-amber-500`, `bg-amber-500/10` |

### C4. `cn()` 대신 템플릿 리터럴 사용 — 9건 (6개 파일)

| 파일 | 라인 | 코드 |
|------|------|------|
| `src/modules/devices/components/device-table/columns.tsx` | 104 | `` className={`mr-1 inline-block w-1.5 h-1.5 rounded-full ${...}`} `` |
| `src/modules/ipam/components/ip-address-list.tsx` | 40 | `` className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs font-medium ${...}`} `` |
| `src/modules/devices/components/device-detail.tsx` | 22 | `` className={`w-2 h-2 rounded-full ${...}`} `` |
| `src/modules/dashboard/components/dashboard-list.tsx` | 285,303,366 | 3건 템플릿 리터럴 |
| `src/modules/exclusive/components/exclusive-view.tsx` | 17,24 | 2건 템플릿 리터럴 |
| `src/components/kbar/result-item.tsx` | 26 | `` className={`relative z-10 flex cursor-pointer...`} `` |

---

## 🟡 MAJOR (57건)

### M1. hooks/ 계층 누락 — 7개 모듈

해당 모듈들은 `api/` 계층은 있으나 `hooks/` 가 없어 컴포넌트가 `api/service.ts`나 `api/queries.ts`를 직접 import 중.

| 모듈 | 비고 |
|------|------|
| `billing` | `components/billing-view.tsx`가 api 직접 호출 |
| `dashboard` | `dashboard-canvas.tsx`, `dashboard-list.tsx`가 api 직접 호출 |
| `exclusive` | `components/exclusive-view.tsx`가 api 직접 호출 |
| `products` | `components/product-form.tsx`가 api 직접 호출 |
| `users` | `components/user-form-sheet.tsx`가 api 직접 호출 |
| `view-settings` | `components/view-settings-form.tsx:7-8` → `queries.ts` + `service.ts` 직접 import |
| `workspaces` | `components/workspace-view.tsx`가 api 직접 호출 |

### M2. useMutation 인라인 확장 패턴 — 6개 모듈, 10개 파일

ipam/devices/cables는 전용 mutation hook을 export 하지만, dashboard/products/users/workspaces는 `mutationOptions`만 export 후 컴포넌트에서 `useMutation({...options})` 인라인 호출.

| 모듈 | 파일 | 라인 |
|------|------|------|
| dashboard | `dashboard-canvas.tsx` | 37, 41 |
| dashboard | `dashboard-list.tsx` | 544,552,560,569,577,585,593 |
| workspaces | `workspace-view.tsx` | 41 |
| workspaces | `team-view.tsx` | 62 |
| products | `product-form.tsx` | 25, 36 |
| products | `product-tables/cell-action.tsx` | 27 |
| users | `user-form-sheet.tsx` | 37, 47 |
| users | `users-table/cell-action.tsx` | 27 |
| view-settings | `view-settings-form.tsx` | 16-22 |

### M3. Query Key Factory 누락 — 2개 모듈

| 모듈 | 현재 상태 |
|------|----------|
| `src/modules/interfaces/api/queries.ts:6` | `queryKey: ['netbox', 'interfaces', deviceId]` |
| `src/modules/sites/api/queries.ts:5,12,18,24` | `['netbox', 'sites']`, `['netbox', 'racks', siteId]`, `['netbox', 'roles']`, `['netbox', 'platforms']` |

### M4. interface 대신 type 사용 — 41건 (12개 파일)

객체 정의에 `interface` 우선 원칙 위반. 주요 위치:
- `src/modules/dashboard/api/types.ts` (4건)
- `src/modules/workspaces/api/types.ts` (4건)
- `src/modules/products/api/types.ts` (4건)
- `src/modules/chat/utils/types.ts` (3건)
- `src/modules/billing/api/types.ts` (3건)
- `src/modules/exclusive/api/types.ts` (2건)
- `src/components/ui/infobar.tsx` (3건)
- `src/components/ui/pagination.tsx` (Props 타입)
- `src/components/ui/sidebar.tsx` (Context Props)
- `src/components/ui/chart.tsx` (Context Props)

### M5. Import 순서 위반 — 4개 파일

- `src/modules/chat/components/conversation-list.tsx` — `motion/react`(외부)가 `@/`(내부) 뒤
- `src/modules/chat/components/chat-area.tsx` — 상대 경로가 `@/`보다 앞
- `src/modules/ipam/components/prefix-list.tsx` — 상대 경로 혼재
- `src/modules/exclusive/components/exclusive-view.tsx` — 순서 혼재

### M6. view-settings 모듈 구조 위반 — 1개 모듈

```
현재: view-settings/api/
├── queries.ts    (✓)
└── service.ts    (△ — 타입 인라인 정의)

누락: api/types.ts, api/mutations.ts, hooks/
```

- `service.ts`에 `ViewSettingItem`, `UpdateViewSettingPayload` 타입 인라인
- `view-settings-form.tsx:16-22`에서 `useMutation` 인라인 정의
- API route `[viewId]/route.ts`에서 Zod 대신 수동 `typeof` 검증 사용

### M7. API route의 netboxClient() 4곳 중복

- `src/app/api/dcim/devices/route.ts`
- `src/app/api/dcim/cables/route.ts`
- `src/app/api/ipam/prefixes/route.ts`
- `src/app/api/ipam/ip-addresses/assign/route.ts`

---

## 💭 MINOR (10건)

| # | 내용 |
|---|------|
| N1 | `switch-mapping` — `types.ts`(루트) + `api/types.ts` 중복 존재 |
| N2 | `react-query-demo/api/` — `type Pokemon`이 `queries.ts`에 인라인, `service.ts`/`types.ts` 누락 |
| N3 | `react-query-demo/info-content.ts` — 모듈 루트에 비규격 위치 |
| N4 | Chat, Kanban, Notifications — 서버 데이터를 Zustand에 보관 (향후 React Query 전환 필요) |
| N5 | `dashboard-list.tsx:397` — `useSearchParams` → Nuqs `useQueryState` 전환 권장 |
| N6 | `exclusive/page.tsx` — 서버 `prefetchQuery` + `HydrationBoundary` 누락 |
| N7 | API route prefix `dcim/`와 모듈명 불일치 |
| N8 | `cables`, `interfaces`, `switch-mapping` — `api/` + `hooks/` 있으나 `components/` 없음 |
| N9 | `home/page.tsx` — metadata에 타입 어노테이션 없음 (`Metadata` 타입 import 권장) |
| N10 | `'use client'` — 라이브러리 데모 페이지에서 불필요하게 사용 가능성 |

---

## ✅ 준수 확인

- `src/components/`에서 `@/modules/` import **없음**
- `src/lib/`에서 `@/modules/` import **없음**
- `apiClient` 호출 **전부 service.ts 내부로 격리**
- 파일명 kebab-case **완벽 준수**
- 아이콘 `Icons.*` 패턴 **완벽 준수** (`@tabler/icons-react` 직접 import 전무)
- ipam, devices, cables — 완전한 계층 구조 + 전용 mutation hook
- `prefetchQuery` 모두 `void` 사용

---

## 우선순위 요약

| 순위 | 항목 | 건수 | Phase |
|:----:|------|:---:|:-----:|
| 1 | Metadata 누락 | 30 | Phase 1 |
| 2 | `any` 타입 + `cn()` 위반 + 정적 색상 | 47 | Phase 2 |
| 3 | view-settings 모듈 구조 정비 | 5 | Phase 3 |
| 4 | hooks/ 계층 + mutation hook 패턴 통일 | 17 | Phase 4 |
| 5 | AGENT 지침 강화 | 2 | Phase 5 |
