# SCC 프로젝트 종합 감사 보고서

**기준:** SKILL.md (원본 템플릿), conventions.md (현행 규칙), Next.js 16 표준  
**일자:** 2026-06-03  
**검증:** `bun tsc --noEmit` 통과 ✅

---

## 총평

스타일/UI/접근성 규칙은 **탁월하게** 지켜지고 있습니다. CSS 변수 토큰 사용, 아이콘 중앙 관리, `any` 타입 최소화, Prisma 격리 모두 훌륭합니다. 그러나 **데이터 페칭 아키텍처 전체**가 템플릿 의도와 크게 괴리되어 있으며, 특히 mutation 패턴과 hooks 계층 우회는 전면적인 수정이 필요합니다.

---

## 📊 전체 점수 카드

| 영역 | 평가 | 심각도 |
|------|------|--------|
| TypeScript (`bun tsc --noEmit`) | ✅ 통과 | - |
| CSS 변수 토큰 (시맨틱 색상) | ✅ 우수 | - |
| 아이콘 중앙 관리 | ✅ 완벽 | - |
| 메타데이터 (48개 페이지) | ✅ 전체 존재 | - |
| `'use client'` 최소화 | ✅ page.tsx 0건 | - |
| Prisma 격리 | ✅ 컴포넌트 0건 | - |
| 환경 변수 보안 | ✅ 비밀키 노출 없음 | - |
| 파일 네이밍 (kebab-case) | ✅ 전체 준수 | - |
| 상태 관리 구분 | ✅ UI=Zustand, 서버=React Query, URL=nuqs | - |
| Public 디렉토리 | ✅ 정적 자산만 | - |
| Mutation 패턴 | ❌ 9개 모듈 전면 위반 | 🔴 심각 |
| 데이터 계층 우회 | ❌ 13건 (hooks 우회 + service 직접 import) | 🔴 심각 |
| API Zod 검증 | ❌ 5개 라우트 누락 | 🔴 심각 |
| 에러 바운더리 | ❌ 48개 라우트에 `error.tsx` 0개 | 🔴 심각 |
| Suspense 누락 | ❌ useSuspenseQuery 미래핑 2건 | 🔴 심각 |
| 데이터 계층 미구축 | ⚠️ 9개 모듈 | 🟡 중간 |
| HydrationBoundary | ⚠️ 7개 페이지 미적용 | 🟡 중간 |
| PageContainer | ⚠️ 7개 페이지 누락 | 🟡 중간 |
| 접근성 (aria-label) | ⚠️ 7개 버튼 누락 | 🟢 경미 |
| cn() 우회 | ⚠️ 7건 | 🟢 경미 |
| any 타입 | ⚠️ 6건 (대부분 @reason 있음) | 🟢 경미 |
| 정적 Tailwind 색상 | ⚠️ 4건 | 🟢 경미 |
| Import 순서 | ⚠️ 13개 파일 혼합 | 🟢 경미 |
| `!important` Tailwind | ⚠️ 2건 | 🟢 경미 |
| 하드코딩 쿼리 키 | ⚠️ 1건 | 🟢 경미 |

---

## 🔴 심각 — 즉시 수정 필요

### 1. Mutation 패턴 (9개 모듈, 23건)

```typescript
// ❌ 현재 (모든 mutations.ts)
export function useCableMutations() {
  const queryClient = useQueryClient(); // ← React 의존성
  const createMutation = useMutation({
    mutationFn: createCable,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cableKeys.all })
  });
  return { createMutation, deleteMutation };
}

// ✅ 규칙
export const createCableMutation = mutationOptions({
  mutationFn: createCable,
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: cableKeys.all })
});
```

**영향:** `ipam/`, `products/`, `users/`, `workspaces/`, `dashboard/`, `cables/`, `devices/`, `view-settings/`의 `api/mutations.ts`

### 2. 데이터 계층 우회 (13건)

#### service 직접 import (1건)

`src/app/(main)/library/modules/dashboard/[dashboardId]/page.tsx:4` — `getDashboardById` 직접 import

#### hooks 우회 — queryOptions 직접 import (12건)

`products/components/product-view-page.tsx`, `product-listing.tsx`, `product-tables/index.tsx`, `workspaces/components/team-view.tsx`, `workspace-view.tsx`, `dashboard/components/dashboard-canvas.tsx`, `dashboard-list.tsx`, `users/components/user-listing.tsx`, `users-table/index.tsx`, `react-query-demo/components/pokemon-info.tsx`, `devices/components/device-table/index.tsx`, `app/(main)/library/modules/products/[productId]/page.tsx`

### 3. API 라우트 Zod 검증 누락 (5건)

`app/api/dcim/cables/route.ts`, `dcim/devices/route.ts`, `dcim/devices/[id]/route.ts`, `ipam/prefixes/route.ts`, `ipam/ip-addresses/assign/route.ts` — 모두 POST/PUT에서 `req.json()`을 Zod 검증 없이 NetBox로 전달.

---

## 🟡 중간 — 개선 권장

### 4. 에러 바운더리 + loading.tsx 완전 부재

- `error.tsx`: 48개 라우트 디렉토리 중 0개
- `loading.tsx`: 0개
- `global-error.tsx`만 존재

### 5. Suspense 누락 (useSuspenseQuery 사용 컴포넌트)

- `product-listing.tsx:27` — `<HydrationBoundary>` 내 `<Suspense>` 없음
- `product/[productId]/page.tsx:24` — 동일

클라이언트 네비게이션 시 `useSuspenseQuery`가 throw → 런타임 오류 가능.

### 6. HydrationBoundary 미적용 (7개 페이지)

DCIM 계열, workspaces, exclusive 등에서 서버 prefetch 없이 클라이언트 온리 페칭 → 초기 로딩 스피너 노출.

### 7. 데이터 계층 미구축 모듈 (9개)

auth, chat, elements, forms, kanban, notifications, overview, profile, react-query-demo

> chat, kanban, notifications는 Zustand 기반이라 `api/` 계층 불필요 가능. 나머지는 데모 페이지도 `api/` 구축 권장.

### 8. PageContainer 누락 (7개 페이지)

home, chat, icons, kanban, notifications, profile, ipam prefixes/[id] 페이지에서 raw 마크업 사용.

---

## 🟢 경미 — 점진적 개선

| 항목 | 건수 | 비고 |
|------|------|------|
| 접근성 aria-label 누락 | 7 | 아이콘 전용 버튼 |
| cn() 우회 (삼항 연산자) | 7 | `table-demos.tsx`, `billing-view.tsx` |
| any 타입 | 6 | 대부분 `@reason` 주석 있음 |
| 정적 Tailwind 색상 | 4 | 브랜드/차트 색상, 일부 정당화 가능 |
| `!important` Tailwind | 2 | `kbar/index.tsx` |
| 하드코딩 쿼리 키 | 1 | `react-query-demo` |
| Import 순서 혼합 | 13 | 포매터 미교정 영역 |

---

## 🎯 수정 우선순위

| 순위 | 작업 | 범위 | 예상 시간 |
|------|------|------|-----------|
| **1** | Mutation → `mutationOptions()` 전환 | 9개 파일 | 2-3h |
| **2** | 컴포넌트 → hooks 경유 수정 | 13건 | 3-4h |
| **3** | API 라우트 Zod 검증 추가 | 5개 라우트 | 2h |
| **4** | Suspense 누락 수정 | 2건 | 30m |
| **5** | `error.tsx` 추가 (주요 라우트 그룹) | 5-6개 라우트 | 1h |
| **6** | HydrationBoundary 도입 | 7개 페이지 | 2-3h |
| **7** | PageContainer 적용 | 7개 페이지 | 1h |
| **8** | 접근성 aria-label 추가 | 7건 | 30m |
| **9** | cn() 우회 수정 | 7건 | 30m |
| **10** | react-query-demo 데이터 계층 보강 | 2개 파일 | 1h |

---

## ✅ 강점 (잘 지켜지고 있는 부분)

- **CSS 변수 토큰** — 정적 Tailwind 색상 거의 없음. `text-primary`, `bg-muted` 등 시맨틱 토큰 보편화
- **아이콘 중앙 관리** — `@tabler/icons-react` 직접 import 0건. `Icons.keyName` 패턴 일관
- **메타데이터** — 모든 48개 `page.tsx`에 `Metadata` export 존재
- **서버 컴포넌트 기본** — page.tsx에서 `'use client'` 0건
- **Prisma 격리** — 클라이언트 컴포넌트에서 Prisma 직접 사용 0건
- **상태 관리 구분** — UI(Zustand), 서버(React Query), URL(nuqs) 명확히 분리
- **컴포넌트 선언문** — 모든 컴포넌트 `function` 선언문 사용
- **Query Key Factory** — 1건 제외 모두 사용
- **queryOptions() 패턴** — 모든 queries.ts가 올바르게 사용
- **환경 변수 보안** — 비밀키 `NEXT_PUBLIC_` 노출 없음
- **파일 네이밍** — 전체 kebab-case 준수

---

## 📂 감사 원본 파일

- [Audit #1: 데이터 계층 & 아키텍처](./audit-01-data-layer.md)
- [Audit #2: React 패턴 & 컴포넌트](./audit-02-react-patterns.md)
- [Audit #3: 스타일 & UI 규칙](./audit-03-styling-ui.md)
- [Audit #4: 임포트, 네이밍, 구조](./audit-04-imports-naming.md)

---

## 🔗 원본 템플릿 대비 변경 사항

| 원본 (SKILL.md) | 현재 (SCC) | 괴리 정도 |
|-----------------|------------|-----------|
| `src/features/<name>/` | `src/modules/<name>/` | 🔄 의도적 변경 |
| `src/app/dashboard/` | `src/app/(main)/` + 뷰 시스템 | 🔄 의도적 변경 |
| `src/types/index.ts` | `modules/<name>/api/types.ts` (분산) | 🔄 의도적 변경 |
| `src/constants/mock-api.ts` | `mock-store.ts` + Prisma/NetBox | 🔄 Phase 진행에 따른 변경 |
| `useMutation({mutationFn})` 인라인 | `useMutation` in `api/mutations.ts` (훅) | ❌ `mutationOptions` 미사용 |
| `queryKey: ['key']` 하드코딩 | 키 팩토리 (`entityKeys.all`) | ✅ 개선됨 |
| `searchParamsCache` + `nuqs/server` | 동일 | ✅ 유지 |
| Clerk/Sentry | 제거 (Phase 1) | 🔄 의도적 변경 |
| `cn()` className 병합 | 동일 | ✅ 유지 |
| 서버 컴포넌트 기본 | 동일 | ✅ 유지 |

---

> 🤖 Generated with Claude Code — 2026-06-03
