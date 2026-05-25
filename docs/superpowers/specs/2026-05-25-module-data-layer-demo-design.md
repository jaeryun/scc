# Module Data Layer Demo — Design Spec

## Overview

library/modules 메뉴의 모듈 데모 페이지가 컴포넌트 페이지와 동일하게 UI 디자인만 보여주는 문제를 해결한다.
각 UI 요소 옆에 데이터 레이어(types, service, queries, hooks)를 사이드 패널로 노출해 모듈의 차별점을 보여준다.

첫 적용 대상: 대시보드 페이지 (`/library/modules/dashboard`)

## Architecture

```
src/
├── components/data-layer/           # 공통 재사용 패널 (모든 모듈에서 사용)
│   ├── data-layer-trigger.tsx       # 요소 우측상단 </> 버튼 (Sheet 트리거)
│   ├── data-layer-panel.tsx         # 우측 사이드 시트 (탭: types|service|queries|hooks)
│   └── code-block.tsx               # Shiki 기반 코드 하이라이팅
│
├── modules/dashboard/               # demo-dashboard → dashboard 리네임
│   ├── data-layer-spec.ts           # 요소→파일 매핑 스펙
│   ├── api/
│   │   ├── types.ts                 # 기존 Panel,GridPos + 신규 DashboardStats,RecentSale 등 추가
│   │   ├── service.ts              # 기존 grid CRUD + 신규 getDashboardStats() 등 추가
│   │   ├── queries.ts              # TanStack Query queryOptions (grid + stats)
│   │   ├── mutations.ts            # TanStack Query mutationOptions (grid CRUD)
│   │   └── serialize.ts            # 기존 Prisma → JSON 시리얼라이즈 유틸 (이름 변경)
│   ├── hooks/                       # useDashboardStats(), useRecentSales() 등
│   └── components/                  # 대시보드 UI 컴포넌트 + grid-dashboard 위젯
│
└── app/(main)/library/modules/dashboard/
    ├── layout.tsx                   # 각 슬롯에 DataLayerTrigger 배치
    ├── @sales/page.tsx              # RecentSales (실제 데이터로 교체)
    ├── @bar_stats/page.tsx          # BarGraph (실제 데이터로 교체)
    ├── @area_stats/page.tsx         # AreaGraph (실제 데이터로 교체)
    ├── @pie_stats/page.tsx          # PieGraph (실제 데이터로 교체)
    └── default.tsx                  # 기본 슬롯 (통계카드들, 실제 데이터로 교체)
```

## Data Flow

```
UI Component
  └─ useSuspenseQuery(dashboardStatsQueryOptions())
       ├─ queries.ts: dashboardStatsQueryOptions()
       │    └─ service.ts: getDashboardStats()
       │         └─ fetch('/api/dashboard/stats') → mock 응답
       │            (singular "dashboard" — [id] 충돌 회피)
       └─ types.ts: DashboardStats 타입으로 응답 캐스팅

                       ↓ (사용자가 </> 클릭 시)

DataLayerPanel
  └─ data-layer-spec.ts에서 elementId로 매핑 조회
       ├─ types 탭: api/types.ts 파일 → Shiki 하이라이팅
       ├─ service 탭: api/service.ts 파일 → Shiki 하이라이팅
       ├─ queries 탭: api/queries.ts 파일 → Shiki 하이라이팅
       ├─ hooks 탭: hooks/use-*.ts 파일 → Shiki 하이라이팅
       └─ 각 탭 하단: 실제 API 응답 JSON (React Query devtools 캐시에서 추출)
```

## Components

### DataLayerTrigger

```tsx
<DataLayerTrigger elementId="stats-cards" />
```

- `elementId`로 `data-layer-spec.ts`의 키를 참조
- Sheet 트리거 역할 (shadcn Sheet)
- 요소 우측상단에 절대 위치, `</>` 아이콘
- opacity: 0 → hover 시 opacity: 1

### DataLayerPanel

- shadcn `Sheet` 기반, `side="right"`, width ~480px
- Props: `elementId: string`
- 내부에서 `data-layer-spec.ts`의 해당 스펙을 읽어 탭 구성
- 없는 탭(예: mutations)은 자동 숨김
- 탭 전환은 클라이언트 상태

### CodeBlock

- `filePath: string`과 `symbol?: string`을 받아 서버에서 파일 내용 fetch
- Shiki로 TypeScript 하이라이팅
- `symbol`이 있으면 해당 심볼 부분만 하이라이트 (또는 주석으로 표시)
- 코드 라인 번호 포함

## data-layer-spec.ts Format

```typescript
type ElementDataLayerSpec = {
  label: string;
  types: { file: string; symbol?: string };
  service: { file: string; symbol: string };
  queries: { file: string; symbol: string };
  hooks?: { file: string; symbol: string };
  mutations?: { file: string; symbol?: string };
};

const dashboardDataLayerSpec: Record<string, ElementDataLayerSpec> = {
  'stats-cards': {
    label: '통계 카드',
    types: { file: 'api/types.ts', symbol: 'DashboardStats' },
    service: { file: 'api/service.ts', symbol: 'getDashboardStats' },
    queries: { file: 'api/queries.ts', symbol: 'dashboardStatsQueryOptions' },
    hooks: { file: 'hooks/use-dashboard-stats.ts', symbol: 'useDashboardStats' },
  },
  'recent-sales': { /* ... */ },
  'bar-chart': { /* ... */ },
  'area-chart': { /* ... */ },
  'pie-chart': { /* ... */ },
};
```

`file` 경로는 `src/modules/dashboard/` 기준 상대경로.

## Rename Plan

| From | To |
|------|----|
| `src/modules/demo-dashboard/` | `src/modules/dashboard/` |
| `src/app/api/demo-dashboards/` | `src/app/api/dashboards/` |
| `src/app/api/dashboards/` (san-dashboard) | `src/app/api/san-dashboards/` |
| `@/modules/demo-dashboard` (all imports) | `@/modules/dashboard` |
| `/api/demo-dashboards` (all refs) | `/api/dashboards` |
| `/api/dashboards` (san-dashboard refs) | `/api/san-dashboards` |

파일 이동은 `git mv` 사용. import/참조는 grep으로 전수 조사 후 일괄 수정.

## Dashboard Data Layer Design

### types.ts (기존 grid dashboard 타입에 추가)

기존 `DemoDashboard`, `Panel`, `GridPos` 등은 유지하고, 아래 타입을 추가:

```typescript
// === 기존 타입 유지: Panel, GridPos, DemoDashboard, DemoDashboardFolder 등 ===

// === 신규: stats/chart 데모용 타입 ===

export type DashboardStats = {
  totalRevenue: number;
  newCustomers: number;
  activeAccounts: number;
  growthRate: number;
};

export type RecentSale = {
  id: number;
  name: string;
  email: string;
  amount: number;
  avatar: string;
};

export type ChartDataPoint = {
  month: string;
  desktop: number;
  mobile: number;
};

export type BrowserStat = {
  browser: string;
  visitors: number;
  fill: string;
};

export type DashboardResponse = {
  stats: DashboardStats;
  recentSales: RecentSale[];
  barChartData: ChartDataPoint[];
  areaChartData: ChartDataPoint[];
  pieChartData: BrowserStat[];
};
```

### service.ts (기존 grid CRUD 함수에 추가)

기존 `getDemoDashboards()`, `createDemoDashboard()` 등은 유지하고, 아래 함수를 추가:

- `getDashboardStats()` → `/api/dashboard/stats` 호출
- `getRecentSales()` → `/api/dashboard/sales` 호출
- `getBarChartData()` → `/api/dashboard/charts/bar` 호출
- `getAreaChartData()` → `/api/dashboard/charts/area` 호출
- `getPieChartData()` → `/api/dashboard/charts/pie` 호출

> `/api/dashboard/stats` (단수형) — `/api/dashboards/[id]`(기존 CRUD)와 경로 충돌을 피하기 위해 단수형으로 분리.

### API Routes (mock)

기존 grid dashboard CRUD 라우트 (`/api/dashboards/*`)와 별도로 아래 라우트를 신규 생성:

- `GET /api/dashboard/stats` → `{ totalRevenue, newCustomers, activeAccounts, growthRate }`
- `GET /api/dashboard/sales` → `RecentSale[]` (5개)
- `GET /api/dashboard/charts/bar` → `ChartDataPoint[]` (6개월)
- `GET /api/dashboard/charts/area` → `ChartDataPoint[]` (12개월)
- `GET /api/dashboard/charts/pie` → `BrowserStat[]` (5개 브라우저)

> 라우트 명세: `/api/dashboard/` (단수) — `/api/dashboards/[id]`와의 경로 충돌을 방지하기 위해 stats/chart 전용으로 분리.

### queries.ts

```typescript
export const dashboardStatsQueryOptions = () =>
  queryOptions({ queryKey: ['dashboard', 'stats'], queryFn: getDashboardStats });

export const recentSalesQueryOptions = () =>
  queryOptions({ queryKey: ['dashboard', 'sales'], queryFn: getRecentSales });
// ... barChartQueryOptions, areaChartQueryOptions, pieChartQueryOptions
```

### hooks/

```typescript
export function useDashboardStats() {
  return useSuspenseQuery(dashboardStatsQueryOptions());
}
export function useRecentSales() {
  return useSuspenseQuery(recentSalesQueryOptions());
}
// ...
```

## Library Demo Page Update

### layout.tsx

각 슬롯에 `DataLayerTrigger` 추가:

```tsx
<Card>
  <DataLayerTrigger elementId="stats-cards" />
  {/* 기존 통계카드들 */}
</Card>

{bar_stats}    ← 내부 Card에 <DataLayerTrigger elementId="bar-chart" />
{sales}        ← 내부 Card에 <DataLayerTrigger elementId="recent-sales" />
{area_stats}   ← 내부 Card에 <DataLayerTrigger elementId="area-chart" />
{pie_stats}    ← 내부 Card에 <DataLayerTrigger elementId="pie-chart" />
```

### 각 슬롯 페이지

- 기존 하드코딩 데이터 → 실제 mock API 호출로 교체
- `prefetchQuery` + `HydrationBoundary` 패턴 적용 (Users 모듈과 동일)
- 병렬 라우트 Suspense + error.tsx 유지
- loading.tsx (스켈레톤) 유지

## Non-Goals (이번 작업 제외)

- 다른 모듈(product, users, grid-dashboard 등) 데모 페이지의 데이터 레이어 노출
- 실제 DB/Prisma 연결 → mock 데이터로만 구현
- CodeBlock의 symbol-level 하이라이팅 (파일 전체를 읽어서 보여주고 주석으로 표기)
- data-layer-spec.ts의 자동 생성 도구

## Testing

- `npm run build` 통과 확인
- `/library/modules/dashboard` 페이지 수동 확인:
  - 각 요소 hover 시 `</>` 버튼 표시
  - `</>` 클릭 시 우측 패널 슬라이드 인
  - 각 탭에서 실제 파일 코드가 하이라이팅되어 표시
  - 실제 API 응답 JSON이 탭 하단에 표시
  - 탭 전환 정상 동작
  - 패널 닫기 정상 동작
