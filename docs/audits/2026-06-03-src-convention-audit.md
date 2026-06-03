# src/ 디렉터리 컨벤션 감사 보고서

**기준:** `docs/core/conventions.md`, `docs/core/project.md`
**일자:** 2026-06-03
**범위:** `src/` 전체 (modules, components, hooks, types, app)

---

## 총평

디렉터리 구조 원칙은 **핵심 모듈(ipam, view-settings, react-query-demo)에서 잘 준수**되고 있다. 그러나 7개 모듈이 데이터 계층 없이 동작하고 있고, 공통 컴포넌트에 도메인 특정 코드가 일부 혼입되어 있으며, API 라우트 9곳에 Zod 검증이 누락되어 있다.

---

## A. `src/modules/` — 데이터 계층 감사

### 규칙 요약

- [필수] `api/types.ts` → `api/service.ts` → `api/queries.ts` → `hooks/` 계층 필수
- [필수] CRUD 존재 시 `api/mutations.ts`에 `mutationOptions` 정의
- [필수] 컴포넌트에서 `api/service.ts` 직접 import 금지
- [필수] Query key factory: `list`(singular) → `lists`(plural)

### 모듈별 점검 결과

| 모듈 | types | service | queries | mutations | hooks | key factory | service 직접 import | inline mutationFn |
|------|:-----:|:-------:|:-------:|:---------:|:-----:|:-----------:|:-------------------:|:-----------------:|
| **ipam** | Y | Y | Y | Y | Y | `lists` ✓ | 없음 | 없음 |
| **view-settings** | Y | Y | Y | Y | Y | `lists` ✓ | 없음 | 없음 |
| **react-query-demo** | Y | Y | Y | N/A | Y | `detail` ✓ | 없음 | N/A |
| **users** | Y | Y | Y | Y | Y | **`list` ✗** | 없음 | 없음 |
| **products** | Y | Y | Y | Y | Y | **`list` ✗** | 없음 | 없음 |
| **chat** | -- | -- | -- | -- | -- | N/A | N/A | N/A |
| **kanban** | -- | -- | -- | -- | -- | N/A | N/A | N/A |
| **overview** | -- | -- | -- | -- | -- | N/A | N/A | N/A |
| **notifications** | -- | -- | -- | -- | -- | N/A | N/A | N/A |
| **profile** | -- | -- | -- | -- | -- | N/A | N/A | N/A |
| **forms** | -- | -- | -- | -- | -- | N/A | N/A | N/A |
| **elements** | -- | -- | -- | -- | -- | N/A | N/A | N/A |

### 발견 사항

**1) Query key factory: `list` → `lists` (2개 모듈)**

`users/api/queries.ts:9` 와 `products/api/queries.ts:9` 에서 `list`(singular) 사용. 컨벤션은 `lists`(plural).

**2) 데이터 계층 누락 (7개 모듈)**

chat, kanban, overview, notifications, profile, forms, elements — `api/` 디렉토리와 `hooks/` 디렉토리 모두 없음.

이 중:
- **chat, kanban**: Zustand store로 로컬 상태 관리. 서버 데이터 없음. 향후 API 연동 시 데이터 계층 구축 필요.
- **overview, elements**: 순수 정적 페이지. 데이터 페칭 없음.
- **notifications**: Zustand store 기반 인메모리 알림. 서버 연동 없음.
- **profile, forms**: 폼 데모. submit 시 toast만 호출, 실제 API 호출 없음.

---

## B. `src/components/` — 순수 UI 감사

### 규칙 요약

- `src/components/` 는 순수 UI만 — 도메인 타입 의존 금지, 직접 API 호출 금지
- `src/components/ui/` 는 shadcn 기반, 직접 수정 금지

### 발견 사항

| 심각도 | 파일 | 문제 |
|--------|------|------|
| 🔴 | `components/github-stars-button.tsx:14` | Server Component에서 직접 `fetch()` 호출. 순수 UI 원칙 위반. |
| 🟡 | `components/user-avatar-profile.tsx:6-11` | `emailAddresses: Array<{ emailAddress: string }>` — Clerk-specific shape. 순수 UI prop(`avatarUrl`, `name`, `email`)으로 일반화 필요. |
| 🟡 | `components/layout/app-sidebar.tsx:33-39` | 하드코딩된 `mockUser` 객체 (`primary_team`, `secondary_team`, `role`). 인증 도입 시 context/store에서 주입받아야 함. |
| 🟢 | `components/form-card-skeleton.tsx:21-34` | "Product Name", "Category", "Price" 등 도메인 특정 플레이스홀더. 일반화하거나 `modules/products/`로 이동 고려. |

**긍정:** 전체 119개 컴포넌트 중 `@/modules/` 직접 import 사례 **0건**. 구조적 격리는 잘 지켜지고 있다.

---

## C. `src/hooks/` — 공통 훅 감사

### 규칙 요약

- `src/hooks/` 는 범용/공통 훅만 — 도메인 특정 훅은 `src/modules/<name>/hooks/` 에 위치

### 발견 사항

| 심각도 | 파일 | 문제 |
|--------|------|------|
| 🟡 | `hooks/use-breadcrumbs.tsx:12-19` | 하드코딩된 라우트 매핑 (`/library/modules` → "라이브러리" 등). range hook은 앱 라우트 지식을 몰라야 함. 매핑을 파라미터로 주입받도록 변경 권장. |

**긍정:** 19개 도메인 훅이 모두 `src/modules/<name>/hooks/` 에 정확히 위치. `src/hooks/` 에 도메인 모듈 import 사례 **0건**.

---

## D. `src/types/` — 공통 타입 감사

### 규칙 요약

- `src/types/` 는 공통 타입만 — 도메인 특정 타입은 `src/modules/<name>/api/types.ts` 에 위치

### 점검 결과

| 파일 | 평가 |
|------|------|
| `types/index.ts` | `PermissionCheck` 인터페이스가 auth 도메인 타입(`plan`, `feature`, `requireOrg`). cross-cutting concern이라 현재 위치 방어 가능하나 auth 모듈 성장 시 `src/modules/auth/`로 이동 권장. |
| `types/data-table.ts` | TanStack Table 확장 타입. 순수 generic. ✓ |

---

## E. `src/app/` — 라우트 & API 감사

### 규칙 요약

- [필수] 모든 `page.tsx` 에 `Metadata` export
- [필수] 라우트 그룹에 `error.tsx` + `loading.tsx`
- [필수] API route: Zod `.parse()` 검증
- [필수] `HydrationBoundary` + `<Suspense>` 필수 조합
- [필수] `global-error.tsx` 에 `<html>` + `<body>` 포함

### E-1. Metadata (48개 페이지)

**전체 통과.** 48개 모든 `page.tsx`가 `metadata` 또는 `generateMetadata` export.

### E-2. Route Group Error/Loading

`(main)/` 루트: `error.tsx` + `loading.tsx` 모두 존재 ✓.

다수 sub-segment는 자체 `error.tsx`/`loading.tsx` 없음. 컨벤션은 route group 레벨만 명시하므로 **엄격한 위반은 아님**.

### E-3. API Route Zod 검증

| 통과 여부 | 파일 | 문제 |
|-----------|------|------|
| ✗ | `api/dcim/interfaces/route.ts` | `Object.fromEntries()` + `as Record<string, string>` 캐스트 |
| ✗ | `api/dcim/sites/route.ts` | 동일 패턴 |
| ✗ | `api/dcim/sites/platforms/route.ts` | 동일 패턴 |
| ✗ | `api/dcim/sites/racks/route.ts` | 동일 패턴 |
| ✗ | `api/dcim/sites/roles/route.ts` | 동일 패턴 |
| ✗ | `api/ipam/ip-addresses/route.ts` | 동일 패턴 |
| ✗ | `api/ipam/ip-addresses/search/route.ts` | `req.nextUrl.searchParams.get('q')` 수동 체크 |
| ✗ | `api/ipam/prefixes/route.ts` | Zod import만 있고 query param 검증 누락 |
| ✗ | `api/view-settings/route.ts` | GET only, query param schema 없음 |
| ✓ | `api/dcim/cables/route.ts` | `cableCreateSchema.parse()` ✓ |
| ✓ | `api/dcim/devices/route.ts` | `deviceCreateSchema.parse()` ✓ |
| ✓ | `api/ipam/ip-addresses/assign/route.ts` | `assignIpSchema.parse()` ✓ |

### E-4. HydrationBoundary + Suspense

| 통과 여부 | 파일 | 문제 |
|-----------|------|------|
| ✗ | `app/(main)/library/modules/products/[productId]/page.tsx` | `<HydrationBoundary>`만 있고 `<Suspense>` 누락 |
| ✓ | `dcim/devices/page.tsx` 등 6개 | 올바른 패턴 사용 |

### E-5. global-error.tsx

**통과.** `<html lang='en'>` + `<body>` 태그 포함, `'use client'` directive ✓.

---

## F. 종합 점수표

| 영역 | 평가 |
|------|------|
| `modules/` 데이터 계층 (ipam, view-settings, rq-demo) | ✅ 완전 준수 |
| `modules/` Query key naming | ⚠️ users, products `list` → `lists` 필요 |
| `modules/` 데이터 계층 (7개 정적 모듈) | ⚠️ Demo 콘텐츠 — 추후 API 연동 시 구축 필요 |
| `components/` 도메인 격리 (0건 cross-import) | ✅ 완벽 |
| `components/` 순수 UI 위반 | ⚠️ 4건 (fetch, domain shape, mock data, skeleton) |
| `hooks/` 도메인 격리 (0건 cross-import) | ✅ 완벽 |
| `hooks/` 범용성 위반 | ⚠️ 1건 (hardcoded route mapping) |
| `types/` 도메인 격리 | ✅ `PermissionCheck`만 경계선 |
| `app/` metadata (48/48) | ✅ 완벽 |
| `app/` route group error/loading | ✅ (그룹 루트 기준) |
| `app/` API Zod validation (9/12) | 🔴 9개 라우트 Zod 누락 |
| `app/` HydrationBoundary + Suspense | ⚠️ 1건 Suspense 누락 |
| `app/` global-error.tsx | ✅ |

---

## G. 수정 우선순위

### 🔴 High — 즉시 수정 권장

1. **API 라우트 Zod 검증** (9개 파일) — `Object.fromEntries()` + type cast 제거, `.strip()` 포함 Zod schema 적용
2. **HydrationBoundary + Suspense** (1개 파일) — `products/[productId]/page.tsx` 에 `<Suspense>` 추가
3. **Query key factory** (2개 모듈) — `users`, `products` 의 `list` → `lists`

### 🟡 Medium — 계획적 수정

4. **`github-stars-button.tsx`** — `fetch()` 호출 분리
5. **`user-avatar-profile.tsx`** — Prop 인터페이스 일반화
6. **`app-sidebar.tsx`** — `mockUser` 제거, context/store 연동
7. **`use-breadcrumbs.tsx`** — 라우트 매핑 외부 주입

### 🟢 Low — 참고

8. **`form-card-skeleton.tsx`** — 도메인 특정 문구 일반화
9. **7개 정적 모듈** — 추후 API 연동 시 데이터 계층 구축
