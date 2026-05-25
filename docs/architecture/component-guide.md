# 컴포넌트 디렉토리 가이드

컴포넌트를 어디에 배치할지 결정하는 아키텍처 가이드입니다. 잘못된 위치는 의존성 순환, 불필요한 도메인 결합, 재사용성 저하를 초래합니다.

## 두 가지 배치 영역

### `src/components/` — 범용 UI

**정의**: 도메인 타입·로직·상태에 의존하지 않는 순수 UI. 어떤 프로젝트에도 가져다 쓸 수 있는 범용 컴포넌트.

**의존 가능**: `config/`, `hooks/`, `lib/` — 프로젝트 전역 공통 인프라만 import.

**의존 금지**: `modules/` — 도메인 모듈에 의존하면 안 됩니다.

```
src/components/ui/button.tsx        ← 순수 UI, 도메인 의존 없음
src/components/ui/card.tsx          ← 순수 UI, 프로젝트 전역 재사용
src/components/charts/bar-graph.tsx ← 순수 recharts 래퍼, 도메인 무관
```

### `src/modules/<name>/` — 도메인 모듈

**정의**: 특정 도메인의 타입, 로직, 상태에 의존하는 컴포넌트. 데이터 페칭, 도메인별 렌더링, 비즈니스 규칙을 포함.

**의존 가능**: `components/`, `hooks/`, `lib/` — 공통 인프라와 범용 UI를 자유롭게 import.

**의존 금지**: 다른 모듈 — 모듈 간 직접 import는 결합도를 높입니다. 필요한 경우 `app/` 수준에서 조합하거나 공통 부분을 `components/`로 추출하세요.

```
src/modules/ipam/components/
  subnet-table.tsx        ← useSubnets()로 IPAM 데이터 페칭
  ip-status-badge.tsx     ← IpStatus 타입에 의존
  subnet-form.tsx         ← useSubnetMutations()로 mutation
```

### `src/app/` — 페이지 조합

**정의**: URL 라우팅과 페이지 조합만 담당. 어디서든 import 가능.

**역할**: 컴포넌트와 모듈을 엮어 실제 화면을 구성합니다.

## 의존성 방향 규칙

```
components/    ← config/, hooks/, lib/ import 가능
     ↑              modules/ import 금지
modules/       ← components/, hooks/, lib/ import 가능
     ↑              타 모듈 import 금지
app/           ← 어디서든 import 가능
```

**금지**: `components/`가 `modules/`를 import하는 것. 이 방향을 위반하면 의존성 순환이 발생합니다.

```
❌ components/ui/badge.tsx → modules/ipam/types.ts
✅ modules/ipam/components/ip-status-badge.tsx → components/ui/badge.tsx
```

## 결정 트리

```
새 컴포넌트를 만든다고 가정할 때:

이 컴포넌트가 우리 애플리케이션의 도메인 타입/로직/상태에 의존하는가?
├── 아니오 → 순수 UI. src/components/<category>/
│           (어떤 프로젝트에도 가져다 쓸 수 있는 범용 컴포넌트)
└── 예 → 데이터/도메인 의존. src/modules/<name>/components/
```

## 빠른 체크리스트

- `modules/*/api/` 또는 `modules/*/hooks/` 를 import 하는가? → **modules/**
- 순수 props만 받고 렌더링만 하는가? → **components/**
- 여러 모듈에서 import해서 쓰이는가? → **components/**
- 이 모듈을 지워도 의미가 있는가? → **components/**

## 컴포넌트 유형 (참고)

컴포넌트가 데이터와 어떻게 상호작용하는지에 따른 분류입니다. 위 결정 트리로 먼저 `components/` vs `modules/`를 결정한 후 참고하세요.

### Type A: UI 전용 (순수 렌더링)

**정의**: props만 받아 렌더링. 도메인 타입에 의존하지 않으면 `src/components/`, 의존하면 `src/modules/<name>/components/`.

| 조건                              | 위치                             | 예시                                          |
| --------------------------------- | -------------------------------- | --------------------------------------------- |
| 도메인 무관, 프로젝트 전역 재사용 | `src/components/ui/`             | `Button`, `Card`, `Badge`, `EmptyState`       |
| 도메인 타입에 의존                | `src/modules/<name>/components/` | `IpStatusBadge` — IPAM 모듈이 사라지면 무의미 |

### Type B: UI + 데이터 (데이터 페칭)

**정의**: `useSuspenseQuery` / `useMutation`으로 데이터 페칭. 로딩·에러 상태 처리. 항상 모듈의 `hooks/`를 통한 간접 데이터 접근.

**위치**: 항상 `src/modules/<name>/components/`

**규칙**:

- 데이터 페칭은 무조건 `hooks/` 경유 — 컴포넌트에서 `apiClient`/`fetch`/Prisma 직접 호출 금지
- 페이지에서 사용 시 `<Suspense>` + `<HydrationBoundary state={dehydrate(queryClient)}>` 필수 조합

```
src/modules/ipam/components/
  subnet-table.tsx        ← useSubnets()로 데이터 페칭 (Type B)
  subnet-form.tsx         ← useSubnetMutations()로 mutation (Type B)
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

## 실제 예시

### 올바른 배치 ✅

| 파일                                          | 판단 근거                                                                               |
| --------------------------------------------- | --------------------------------------------------------------------------------------- |
| `modules/ipam/components/subnet-table.tsx`    | `useSubnets()`로 IPAM 데이터 페칭, `Subnet` 타입 의존 → 도메인 의존                     |
| `modules/ipam/components/ip-status-badge.tsx` | `IpStatus` 타입 의존, IPAM 모듈이 사라지면 의미 없음 → 도메인 의존                      |
| `components/ui/button.tsx`                    | 도메인 의존 없음, 프로젝트 전역 재사용 → 범용 UI                                        |
| `components/layout/app-sidebar.tsx`           | `config/views.ts`, `config/nav-config.ts` 의존 — 전역 config만 사용, 도메인 모듈과 무관 |

### 재배치 완료 사례 ✅

| 파일                               | 이전 위치        | 현재 위치            | 판단 근거                                       |
| ---------------------------------- | ---------------- | -------------------- | ----------------------------------------------- |
| `components/charts/area-graph.tsx` | modules/dashboard | `components/charts/` | 순수 recharts 래퍼, dashboard 삭제해도 의미 있음 |

| `components/charts/bar-graph.tsx`  | modules/dashboard | `components/charts/` | recharts BarChart, 도메인 무관 재사용 가능      |

| `components/charts/pie-graph.tsx`  | modules/dashboard | `components/charts/` | recharts PieChart, 범용 시각화                  |

## 컴포넌트 작성 규칙 (요약)

> 상세 규칙은 [docs/core/conventions.md](../core/conventions.md) 참조

1. 함수 선언문 사용: `function ComponentName() {}`
2. Props 인터페이스: `{ComponentName}Props`
3. `cn()`으로 className 병합, 문자열 수동 연결 금지
4. 기본적으로 서버 컴포넌트, 브라우저 API/React 훅 필요 시만 `'use client'`
5. shadcn `ui/` 컴포넌트는 직접 수정 금지, 확장만 허용
6. 아이콘은 `@/components/icons`에서만 import
