# Audit #2: React 패턴 & 컴포넌트

**감사 항목:** 'use client' 사용, HydrationBoundary, 메타데이터, PageContainer, 에러 바운더리, Suspense, 화살표 함수 컴포넌트

---

## 1. page.tsx의 'use client' 사용

### 규칙

page.tsx는 서버 컴포넌트 기본. `'use client'`는 브라우저 API/이벤트/React 훅 필요 시에만.

### 결과: 양호

**48개 모든 page.tsx에서 `'use client'` 0건.** 모든 페이지가 올바르게 서버 컴포넌트로 작성됨.

---

## 2. HydrationBoundary 패턴

### 규칙

서버 prefetch → `<HydrationBoundary state={dehydrate(queryClient)}>` → `<Suspense fallback>` → 클라이언트 컴포넌트(useSuspenseQuery)

### 올바른 구현 (2곳)

| 파일 | 비고 |
|------|------|
| `src/app/(main)/library/modules/products/[productId]/page.tsx:24` | HydrationBoundary 있음, Suspense 없음 ⚠️ |
| `src/modules/users/components/user-listing.tsx:29-33` | HydrationBoundary + Suspense 모두 있음 ✅ |

### 서버 prefetch 미사용 페이지 (6개)

| 파일 | 현재 상태 |
|------|-----------|
| `src/app/(main)/dcim/devices/page.tsx` | 클라이언트 온리, 서버 prefetch 없음 |
| `src/app/(main)/dcim/devices/[id]/page.tsx` | 클라이언트 온리 |
| `src/app/(main)/dcim/ipam/page.tsx` | 클라이언트 온리 |
| `src/app/(main)/dcim/ipam/prefixes/[id]/page.tsx` | 클라이언트 온리 |
| `src/app/(main)/library/modules/workspaces/page.tsx` | 클라이언트 온리 |
| `src/app/(main)/library/modules/exclusive/page.tsx` | 클라이언트 온리 |

### service 직접 호출 (HydrationBoundary 미사용)

| 파일 | 라인 | 코드 |
|------|------|------|
| `src/app/(main)/library/modules/dashboard/[dashboardId]/page.tsx` | 20 | `await getDashboardById(dashboardId)` — TanStack Query 우회 |

---

## 3. 메타데이터

### 규칙

모든 `page.tsx`에 `export const metadata: Metadata` 또는 `generateMetadata` 사용.

### 결과: 양호

**48개 모든 페이지에 메타데이터 존재.** 다만 18개 페이지가 `: Metadata` 타입 명시 없음 (경미).

---

## 4. PageContainer 사용

### 규칙

`PageContainer` props (`pageTitle`, `pageDescription`, `pageHeaderAction`) 사용. `<Heading>` 직접 임포트 금지.

### PageContainer 미사용 (7개)

| 파일 | 현재 |
|------|------|
| `src/app/(main)/home/page.tsx` | raw `<h1>`, `<h2>` |
| `src/app/(main)/library/components/chat/page.tsx` | `<ChatViewPage />` 직접 |
| `src/app/(main)/library/components/icons/page.tsx` | `<IconsViewPage />` 직접 |
| `src/app/(main)/library/components/kanban/page.tsx` | `<KanbanViewPage />` 직접 |
| `src/app/(main)/library/components/notifications/page.tsx` | `<NotificationsPage />` 직접 |
| `src/app/(main)/library/components/profile/[[...profile]]/page.tsx` | `<ProfileViewPage />` 직접 |
| `src/app/(main)/dcim/ipam/prefixes/[id]/page.tsx` | raw `<div className='p-6 space-y-4'>` |

### pageTitle/pageDescription 없는 PageContainer (1개)

| 파일 | 라인 |
|------|------|
| `src/app/(main)/library/modules/products/[productId]/page.tsx` | 22 |

---

## 5. 에러 바운더리

### 규칙

- 루트: `app/global-error.tsx`
- 페이지 단위: 각 `page.tsx`와 동일 디렉토리에 `error.tsx`

### 결과: 심각한 누락

- ✅ `src/app/global-error.tsx` — 존재
- ❌ **`error.tsx`: 0개** — 48개 라우트 디렉토리 중 어디에도 없음
- ❌ **`loading.tsx`: 0개** — Next.js 스트리밍 SSR 미활용

---

## 6. Suspense 경계

### 규칙

`useSuspenseQuery`를 사용하는 모든 컴포넌트는 `<Suspense fallback>`으로 감싸야 함. 없으면 클라이언트 네비게이션 시 Promise throw → 런타임 오류.

### Suspense 누락 (2건)

| 파일 | 라인 | 문제 |
|------|------|------|
| `src/modules/products/components/product-listing.tsx` | 27 | `HydrationBoundary` 내부에 `<Suspense>` 없음, `ProductTable`이 `useSuspenseQuery` 사용 |
| `src/app/(main)/library/modules/products/[productId]/page.tsx` | 24 | `HydrationBoundary` 내부에 `<Suspense>` 없음, `EditProductView`가 `useSuspenseQuery` 사용 |

### 올바른 Suspense 사용 (7곳)

`react-query/page.tsx`, `workspaces/page.tsx`, `workspaces/team/.../page.tsx`, `exclusive/page.tsx`, `billing/page.tsx`, `user-listing.tsx`, `device-table/index.tsx`, `device-detail.tsx`, `prefix-list.tsx`, `ip-address-list.tsx`, `site-selector.tsx`

---

## 7. 화살표 함수 컴포넌트

### 규칙

`function ComponentName() {}` 사용, `const Component: FC<Props> = () => {}` 금지.

### 위반 (5건)

| 파일 | 라인 | 코드 |
|------|------|------|
| `src/components/ui/file-preview.tsx` | 107 | `export const FilePreview: FC<FilePreviewProps> = ({` |
| `src/components/ui/notification-card.tsx` | 67 | `export const NotificationCard: FC<NotificationCardProps> = ({` |
| `src/components/ui/chart.tsx` | 71 | `const ChartStyle = ({ id, config }: {...}) => {` |
| `src/components/ui/sonner.tsx` | 6 | `const Toaster = ({ ...props }: ToasterProps) => {` |
| `src/components/kbar/index.tsx` | 62 | `const KBarComponent = ({ children }: {...}) => {` |

> `src/components/ui/` 내 파일은 shadcn 기본 컴포넌트라 수정 금지 대상. `file-preview.tsx`, `notification-card.tsx`는 자체 제작이므로 `function`으로 변경 권장.

---

## 8. 컴포넌트의 queryOptions 직접 import (hooks 우회)

`useSuspenseQuery`를 사용하는 hooks가 존재하지만, 컴포넌트가 이를 우회하여 `useQuery` + queryOptions 직접 import 패턴 혼용.

### workspace 예시

- `hooks/use-workspaces.ts` — `useSuspenseQuery(workspacesQueryOptions())` 존재
- `components/workspace-view.tsx` — `useQuery(workspacesQueryOptions())` 직접 import → hook 완전히 우회

---

## 요약

| 카테고리 | 위반 수 | 심각도 |
|----------|---------|--------|
| page.tsx 'use client' | 0건 | ✅ 양호 |
| HydrationBoundary | 7건 | 🟡 중간 |
| 메타데이터 | 0건 (타입 누락 18건) | ✅ 양호 |
| PageContainer | 7건 | 🟡 중간 |
| 에러 바운더리 | 48개 라우트 누락 | 🔴 심각 |
| Suspense 누락 | 2건 | 🔴 심각 |
| 화살표 함수 컴포넌트 | 5건 | 🟢 경미 |
