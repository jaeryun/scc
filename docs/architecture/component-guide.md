# 컴포넌트 디렉토리 가이드

컴포넌트를 어디에 배치할지 결정하는 아키텍처 가이드입니다. 잘못된 위치는 의존성 순환, 불필요한 도메인 결합, 재사용성 저하를 초래합니다.

## 세 가지 컴포넌트 유형

### Type A: UI 전용 컴포넌트 (순수 렌더링)

**정의**: props만 받아 렌더링. 데이터 페칭 없음. 도메인 타입에 의존하지 않음.

**배치 기준**: _"이 모듈을 삭제해도 이 컴포넌트가 의미 있는가?"_

| 조건 | 위치 | 예시 |
|------|------|------|
| 프로젝트 전역에서 재사용 가능 | `src/components/ui/` | `Button`, `Card`, `Badge`, `EmptyState` |
| 특정 도메인에만 의미 있음 | `src/modules/<name>/components/` | `IpStatusBadge` — IPAM 모듈이 사라지면 무의미 |

```
src/components/ui/card.tsx        ← Type A (전역)
src/modules/ipam/components/     ← Type A (도메인)
  ip-status-badge.tsx            ← IpStatus 타입에 의존
```

### Type B: UI + 데이터 컴포넌트 (데이터 표시, 폼)

**정의**: `useSuspenseQuery` / `useMutation`으로 데이터 페칭. 로딩·에러 상태 처리. 항상 모듈의 `hooks/`를 통한 간접 데이터 접근.

**위치**: `src/modules/<name>/components/`

**규칙**:
- **데이터 페칭은 무조건 `hooks/` 경유** — 컴포넌트에서 `apiClient`/`fetch`/Prisma 직접 호출 금지
- 페이지에서 사용 시 `<Suspense>` + `<HydrationBoundary state={dehydrate(queryClient)}>` 필수 조합

```
src/modules/ipam/components/
  subnet-table.tsx        ← useSubnets()로 데이터 페칭 (Type B)
  subnet-form.tsx         ← useSubnetMutations()로 mutation (Type B)
  subnet-form-sheet.tsx   ← Sheet 래퍼 + useSubnetMutations() (Type B)
```

### Type C: 데이터 전용 (컴포넌트 아님 — api, hooks, schemas)

**위치**: `src/modules/<name>/api/` + `hooks/` + `schemas/`

**계층 구조** (각 계층은 자신의 하위 계층만 의존):

```
api/types.ts         ← API 요청/응답 타입, 필터 타입
     ↓
api/service.ts       ← apiClient()로 Route Handler 호출
     ↓
api/queries.ts       ← React Query 옵션 (queryOptions), 쿼리 키 팩토리
     ↓
hooks/               ← useQuery/useMutation 훅 (queries.ts 소비)
     ↓
components/          ← hooks를 통해서만 데이터 접근
```

**훅 네이밍**: `use-<name>s.ts` (조회), `use-<name>-mutations.ts` (생성·수정·삭제)

## `components/` vs `modules/` 구분

| | `src/components/` | `src/modules/<name>/` |
|---|---|---|
| **성격** | 프로젝트 전역 공통 | 특정 도메인 모듈 |
| **의존 방향** | 누구에게도 의존 안 함 | `components/`를 import 가능 |
| **도메인 의존** | 없음 (순수 UI) | 자체 도메인 타입·로직에 의존 |
| **재사용** | 여러 모듈에서 import | 주로 `app/`에서만 소비 |
| **삭제 영향** | 여러 모듈에 영향 | 해당 모듈과 그 소비자에만 영향 |

## 의존성 방향 규칙

```
components/        ← 외부 의존 없음. 순수 UI 원자.
     ↑
modules/           ← components/, lib/, hooks/ import 가능
     ↑
app/               ← 어디서든 import 가능. URL 바인딩만 수행.
```

**금지**: `components/`가 `modules/`를 import하는 것. 이 방향을 위반하면 의존성 순환이 발생합니다.

```
❌ components/ui/badge.tsx → modules/ipam/types.ts
✅ modules/ipam/components/ip-status-badge.tsx → components/ui/badge.tsx
```

## 결정 트리

```
새 컴포넌트를 만든다고 가정할 때:

데이터 페칭이 필요한가?
├── 아니오 → 순수 UI (Type A)
│   ├── 이 모듈을 삭제해도 의미가 있는가?
│   │   ├── 예 → src/components/ui/
│   │   └── 아니오 → src/modules/<name>/components/
│   └──
└── 예 → UI + 데이터 (Type B)
    └── src/modules/<name>/components/
        ↳ hooks/ + api/ 를 함께 사용해야 함
```

## 실제 예시 (코드베이스 기반)

### 올바른 배치 ✅

| 파일 | 유형 | 판단 근거 |
|------|------|-----------|
| `modules/ipam/components/subnet-table.tsx` | Type B | `useSubnets()`로 IPAM 데이터 페칭, `Subnet` 타입 의존 |
| `modules/ipam/components/ip-status-badge.tsx` | Type A | `IpStatus` 타입 의존, IPAM 모듈이 사라지면 의미 없음 |
| `components/layout/app-sidebar.tsx` | Type B | `useCurrentView()`, `views` config 의존 — 레이아웃 셸 |
| `components/ui/button.tsx` | Type A | 도메인 의존 없음, 프로젝트 전역 재사용 |

### 재배치 완료 사례 ✅ (원칙 적용 이력)

| 파일 | 이전 위치 | 현재 위치 | 판단 근거 |
|------|-----------|-----------|------|
| `components/charts/area-graph.tsx` | modules/overview | `components/charts/` | 순수 recharts 래퍼, overview 삭제해도 의미 있음 |
| `components/charts/bar-graph.tsx` | modules/overview | `components/charts/` | recharts BarChart, 도메인 무관 재사용 가능 |
| `components/charts/pie-graph.tsx` | modules/overview | `components/charts/` | recharts PieChart, 범용 시각화 |
| `components/kanban/board-column.tsx` | modules/kanban | `components/kanban/` | dnd-kit 범용 UI, store는 modules/kanban/utils/에 유지 |
| `components/kanban/task-card.tsx` | modules/kanban | `components/kanban/` | 칸반 공통 카드, 도메인 타입 미의존 |

## 컴포넌트 작성 규칙 (요약)

> 상세 규칙은 [docs/core/conventions.md](../core/conventions.md) 참조

1. 함수 선언문 사용: `function ComponentName() {}`
2. Props 인터페이스: `{ComponentName}Props`
3. `cn()`으로 className 병합, 문자열 수동 연결 금지
4. 기본적으로 서버 컴포넌트, 브라우저 API/React 훅 필요 시만 `'use client'`
5. shadcn `ui/` 컴포넌트는 직접 수정 금지, 확장만 허용
6. 아이콘은 `@/components/icons`에서만 import
