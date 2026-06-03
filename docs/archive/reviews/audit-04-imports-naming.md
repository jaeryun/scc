# Audit #4: 임포트, 네이밍, 구조

**감사 항목:** 파일 네이밍, Import 순서, 상태 관리, 환경 변수, Prisma 사용, API Zod 검증, Public 디렉토리

---

## 1. 파일 네이밍

### 규칙

- 컴포넌트 파일: kebab-case (`user-profile.tsx`)
- 훅 파일: `use-` 접두사 + kebab-case (`use-data-table.ts`)

### 결과: 양호

모든 파일이 kebab-case 준수. 컴포넌트 PascalCase, 훅 `use` 접두사 위반 없음.

---

## 2. Import 순서

### 규칙

① Node built-in → ② 외부 라이브러리 → ③ `@/` 내부 모듈 → ④ 상대 경로

### 결과: 혼합 (24개 중 13개 파일)

대표적인 위반 패턴:
- `react`를 `@/` 임포트 사이에 배치
- `sonner`, `zod`가 `@/` 임포트 사이에 위치
- `next/navigation`, `next/link`가 `@/` 또는 상대 경로 뒤에 위치

**영향받는 파일:** `header.tsx`, `layout.tsx`, `notification-center.tsx`, `product-view-page.tsx`, `user-listing.tsx`, `user-auth-form.tsx`, `search-input.tsx`, `breadcrumbs.tsx`, `kanban-board.tsx`, `messenger.tsx`, `billing-view.tsx`, `exclusive-view.tsx` 등

> 포매터(oxfmt)가 자동 교정하지 않는 영역. 점진적 정리 권장.

---

## 3. 상태 관리

### 규칙

- 서버 상태(CRUD 데이터) → React Query
- UI 상태(사이드바, 테마, 모달) → Zustand
- URL 상태(필터, 페이지네이션) → NUQS
- 지역 상태 → `useState`

### 결과: 양호

- **React Query for UI state:** 위반 없음. 사이드바/테마/모달/알림/칸반 모두 Zustand store 사용
- **useState for URL state:** 위반 없음. 페이지네이션/필터는 올바르게 `useQueryState`/`useQueryStates` 사용
- **useState for server data:** 위반 없음. 서버 데이터는 React Query로 관리
- **useState 사용처:** 모달 open/close, 입력값, 검색어 등 지역 UI 상태에 적절히 사용

---

## 4. 환경 변수

### 규칙

- 클라이언트 접근: `NEXT_PUBLIC_` 접두사
- 비밀키: 절대 `NEXT_PUBLIC_` 사용 금지

### 결과: 양호

- `NEXT_PUBLIC_APP_URL`만 사용 (`src/lib/api-client.ts:4`) — 공개 URL, 허용됨
- 클라이언트 컴포넌트(.tsx)에서 `process.env` 직접 접근 0건
- NetBox `envSchema.parse(process.env)`는 API 라우트(.ts)에서만 사용 → 서버사이드 안전

---

## 5. 컴포넌트 내 Prisma 사용

### 규칙

Prisma는 서버사이드(API 라우트, 서버 컴포넌트, service.ts)에서만 사용.

### 결과: 양호

- 컴포넌트(.tsx)에서 Prisma 직접 import **0건**
- Prisma 사용처:
  - `src/lib/prisma.ts` — 싱글턴
  - `src/app/api/view-settings/[viewId]/route.ts` — API 라우트 (서버사이드)
  - `src/lib/netbox/cache.ts` — 서버 유틸리티
  - `src/modules/view-settings/api/get-view-settings-handler.ts` — 서버사이드

---

## 6. API 라우트 Zod 검증

### 규칙

API 라우트에서 Zod 스키마 + `.parse()`로 요청 본문 검증. `ZodError`(400)와 서버 에러(500) 엄격 구분.

### 올바른 구현 (1개)

| 파일 | 검증 방식 |
|------|-----------|
| `src/app/api/view-settings/[viewId]/route.ts` | Zod `.parse()` + `ZodError` 처리 |

### 위반 (5개) — 모두 NetBox 프록시 라우트

| 파일 | 메서드 | 문제 |
|------|--------|------|
| `src/app/api/dcim/cables/route.ts` | POST | `req.json()` 검증 없이 NetBox 전달 |
| `src/app/api/dcim/devices/route.ts` | POST | `req.json()` 검증 없이 NetBox 전달 |
| `src/app/api/dcim/devices/[id]/route.ts` | PUT | `req.json()` 검증 없이 NetBox 전달 |
| `src/app/api/ipam/prefixes/route.ts` | POST | `req.json()` 검증 없이 NetBox 전달 |
| `src/app/api/ipam/ip-addresses/assign/route.ts` | POST | 구조분해만 하고 검증 없음 |

> NetBox 프록시 라우트이지만, 앱 레벨에서 Zod 검증을 추가하면 유효하지 않은 데이터를 NetBox 도달 전에 차단하고 의미 있는 400 응답 반환 가능.

---

## 7. Public 디렉토리

### 규칙

`/`로 서빙될 정적 자산만 배치. 컴포넌트/타입/로직 파일 금지.

### 결과: 양호

```
public/
├── robots.txt                       # SEO 설정
├── fonts/PretendardVariable.woff2   # 웹 폰트
└── api-specs/internal/latest.json   # OpenAPI 스펙
```

컴포넌트, 타입, 로직 파일 없음. 모두 적절한 정적 자산.

---

## 요약

| 카테고리 | 위반 수 | 심각도 |
|----------|---------|--------|
| 파일 네이밍 | 0건 | ✅ 양호 |
| Import 순서 | 13개 파일 | 🟢 경미 |
| 상태 관리 구분 | 0건 | ✅ 양호 |
| 환경 변수 | 0건 | ✅ 양호 |
| Prisma 격리 | 0건 | ✅ 양호 |
| API Zod 검증 | 5건 | 🔴 심각 |
| Public 디렉토리 | 0건 | ✅ 양호 |
