# SAN Grid Dashboard — Design Specification

**Date:** 2026-05-22  
**Status:** Draft — Pending Review  
**Grid System:** 12-Column  
**View:** `(데모) SAN` — `/san` (Home 아래)

---

## 1. Overview

SAN(Storage Area Network) 인프라를 시각적으로 관리하는 **Grid Dashboard** 시스템.

사용자가 직접 캔버스에 위젯(스위치 테이블, 요약 카드, 토폴로지 맵 등)을 배치하고, 드래그로 위치를 조정하며, 여러 개의 대시보드 화면을 저장/불러오기할 수 있음.

### Real-World Targets
- **Brocade X7-4** (4-blade, 48 ports/blade = 192 ports)
- **Fabric A/B** 이중화 — 2 sets
- **ISL 연결** — 1 switch × 5 sets
- **PowerMax 스토리지** 포트: `1C:01`, `2C:04` 등
- **서버 HBA** — `sp-tst-rac01`, 포트명 `host0` + PCI Slot/Port

---

## 2. Requirements

### Functional
1. **대시보드 목록** — 저장된 대시보드 카드 그리드 (`/san`)
2. **대시보드 생성** — `[+ New Dashboard]` → 이름 입력 → 빈 12열 캔버스
3. **위젯 추가** — `[+ Add Widget]` → 위젯 타입 선택 → 캔버스에 배치
4. **드래그 이동** — `@dnd-kit/core` + snap-to-grid (12열 기준)
5. **크기 조절** — 위젯 코너/가장자리 드래그로 w/h 조절 (그리드 셀 단위)
6. **화면 저장** — `POST /api/dashboards` — 레이아웃 JSON을 Prisma에 저장
7. **화면 불러오기** — `GET /api/dashboards/:id` — 캔버스 복원
8. **더미 데이터** — Brocade X7-4 더미 (192 ports × 2 fabrics)

### Non-Functional
- 반응형: 데스크탑 우선, 12열 그리드는 태블릿에서 6열로 줄어듦
- 순수 UI 컴포넌트 먼저 → `demo-components` 페이지에 예시 → 대시보드에 조합
- `react-resizable-panels` 재사용 또는 `@dnd-kit` 기반 직접 구현

---

## 3. Architecture

```
src/
├── app/
│   ├── (main)/
│   │   └── san/
│   │       ├── page.tsx              # 대시보드 목록
│   │       └── [dashboardId]/
│   │           └── page.tsx          # 대시보드 캔버스 (편집/뷰)
│   └── api/
│       └── dashboards/
│           ├── route.ts              # GET list, POST create
│           └── [id]/
│               ├── route.ts          # GET, PUT, DELETE
│               └── duplicate/
│                   └── route.ts      # POST duplicate
│
├── modules/
│   └── san-dashboard/
│       ├── components/
│       │   ├── dashboard-list.tsx
│       │   ├── dashboard-canvas.tsx      # 12-col grid + dnd-kit
│       │   ├── dashboard-item.tsx        # draggable wrapper
│       │   ├── widget-switch-table.tsx     # 192행 스위치 테이블
│       │   ├── widget-switch-summary.tsx   # 요약 카드 (Up/Down/Unconnected)
│       │   ├── widget-isl-topology.tsx     # ISL 연결선 맵
│       │   ├── widget-server-card.tsx      # 서버 HBA 정보 카드
│       │   └── widget-add-dialog.tsx       # 위젯 추가 모달
│       ├── api/
│       │   ├── types.ts
│       │   ├── service.ts
│       │   ├── queries.ts
│       │   └── mutations.ts
│       └── types/
│           └── dashboard.ts
│
├── components/
│   └── ui/
│       └── grid-dashboard/           # 순수 UI 컴포넌트 (재사용)
│           ├── grid-canvas.tsx
│           ├── grid-item.tsx
│           ├── resize-handle.tsx
│           └── widget-frame.tsx
│
└── config/
    └── views.ts                        # (데모) SAN 뷰 등록
```

---

## 4. Data Model (Prisma)

```prisma
model Dashboard {
  id        String   @id @default(cuid())
  name      String
  description String?
  layout    Json     // { columns: 12, rowHeight: 80 }
  items     Json     // DashboardItem[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

```typescript
// DashboardItem (JSON stored)
interface DashboardItem {
  id: string
  type: 'switch-table' | 'switch-summary' | 'isl-topology' | 'server-card' | 'text'
  targetId: string       // 장비 ID (예: "san-brc-x7-4-fa01")
  x: number              // grid column start (0-11)
  y: number              // grid row start
  w: number              // width in columns
  h: number              // height in rows
  config: Record<string, unknown>  // 타입별 설정
}
```

---

## 5. UI Design

### 5.1 대시보드 목록 (`/san`)
```
┌─────────────────────────────────────────────┐
│  (데모) SAN                              [+ New] │
├─────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐            │
│  │ DC1-SAN-A  │  │ DC1-SAN-B  │  [+ ...]  │
│  │ 5 widgets  │  │ 3 widgets  │            │
│  │ Edit  View │  │ Edit  View │            │
│  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────┘
```

### 5.2 대시보드 캔버스 (`/san/:id`)
```
┌─────────────────────────────────────────────┐
│  DC1-SAN-A    [Edit] [Save] [+ Add Widget] │
├─────────────────────────────────────────────┤
│  12-Column Grid Canvas (scrollable)         │
│  ┌────────────┬────┬─────────────────┐   │
│  │            │    │                   │   │
│  │ Fabric A   │S1  │   ISL Topology    │   │
│  │ Table      │    │   Map             │   │
│  │ (4x3)      │    │   (4x3)           │   │
│  │            │    │                   │   │
│  ├────────────┴────┼───────────────────┤   │
│  │                 │                   │   │
│  │   Fabric B      │   Server Cards    │   │
│  │   Table         │   (4x2)           │   │
│  │   (6x3)         │                   │   │
│  │                 │                   │   │
│  └─────────────────┴───────────────────┘   │
└─────────────────────────────────────────────┘
```

### 5.3 위젯 타입

| 위젯 | 설명 | 기본 크기 | 내용 |
|------|------|-----------|------|
| `switch-table` | 스위치 포트 테이블 | 4×3 (12열 기준) | 192행 스크롤 테이블 |
| `switch-summary` | 요약 카드 | 2×1 | Up/Down/Unconnected 카운트 |
| `isl-topology` | ISL 연결 맵 | 4×2 | 스위치 간 ISL 선 + 상태 |
| `server-card` | 서버 HBA 카드 | 2×1 | 서버명, HBA 리스트 |
| `text` | 자유 텍스트 | 2×1 | 제목/메모 |

---

## 6. Component Breakdown

### 6.1 순수 UI 컴포넌트 (`src/components/ui/grid-dashboard/`)

**`GridCanvas`**
- Props: `columns: number`, `rowHeight: number`, `items: GridItem[]`, `onItemsChange`
- 12열 CSS Grid (`grid-template-columns: repeat(12, 1fr)`)
- `@dnd-kit/core`로 드래그, snap-to-grid

**`GridItem`**
- Props: `item: GridItem`, `isEditing: boolean`, `onDragEnd`, `onResize`
- 드래그 핸들 (헤더), 리사이즈 핸들 (코너)
- 편집 모드: 테두리 강조, 드래그/리사이즈 활성화

**`ResizeHandle`**
- 4개 코너 + 4개 가장자리 핸들
- 드래그 시 `w`, `h`를 그리드 셀 단위로 조정

### 6.2 도메인 컴포넌트 (`src/modules/san-dashboard/components/`)

**`WidgetSwitchTable`**
- `DataTable` 재사용 (기존 `switch-port-table.tsx` 확장)
- 192행, 페이지네이션 없음, 세로 스크롤
- 컬럼: Status, Switch Port, Host, Host Port, PCI Slot, Port, Speed
- Brocade 더미 데이터 주입

**`WidgetSwitchSummary`**
- 작은 카드 위젯
- 총 포트 / Up / Down / Unconnected 숫자 표시
- 색상 뱃지

**`WidgetISLTopology`**
- SVG/Canvas 기반 간단한 네트워크 다이어그램
- 스위치를 노드로, ISL을 선으로 표시
- 클릭하면 포트 상세

---

## 7. API Design

```
GET    /api/dashboards              → { dashboards: Dashboard[] }
POST   /api/dashboards              → { id, name, layout, items }
GET    /api/dashboards/:id         → { id, name, layout, items }
PUT    /api/dashboards/:id         → update layout/items
DELETE /api/dashboards/:id         → remove
POST   /api/dashboards/:id/duplicate → clone
```

---

## 8. Implementation Phases

### Phase 1: Foundation (Backend)
1. Prisma `Dashboard` 모델 추가 + 마이그레이션
2. API Routes (`/api/dashboards/*`) CRUD 구현
3. Query/Mutation options (TanStack Query)

### Phase 2: Pure UI Components
1. `GridCanvas`, `GridItem`, `ResizeHandle` 구현
2. `demo-components` 페이지에 예시 추가 (`/demo-components/grid-dashboard`)
3. 독립 테스트 가능

### Phase 3: Dashboard Shell
1. `/san` — 대시보드 목록 페이지
2. `/san/:id` — 캔버스 페이지 (읽기 전용)
3. 편집 모드 토글

### Phase 4: Widget Types
1. `WidgetSwitchTable` — Brocade X7-4 더미 데이터 (192 ports)
2. `WidgetSwitchSummary` — 요약 카드
3. `WidgetISLTopology` — ISL 맵
4. `WidgetServerCard` — 서버 HBA 카드

### Phase 5: Drag & Drop + Resize
1. `@dnd-kit/core` 통합
2. Snap-to-grid (12열)
3. Resize 핸들
4. `[+ Add Widget]` 다이얼로그

### Phase 6: Polish
1. 뷰 등록 (`views.ts`)
2. 반응형 (태블릿: 6열)
3. 대시보드 저장/불러오기 UX
4. 삭제 확인, 복제 기능

### Phase 7: SAN Dummy Data
1. Brocade X7-4 Fabric A/B 더미 생성
2. 192 ports × 2 sets = 384 ports total
3. 연결 상태: up 60%, down 2%, unconnected 38%
4. PowerMax 스토리지, 서버 HBA 더미

---

## 9. Open Questions

| # | 질문 | 영향 |
|---|------|------|
| 1 | 위젯 리사이즈는 그리드 셀 단위로만? 아니면 픽셀 단위 자유 리사이즈? | 그리드 snap 로직 |
| 2 | ISL Topology 위젯은 SVG 직접 그리기? 아니면 라이브러리(`react-flow`, `cytoscape`)? | 번들 크기 |
| 3 | 대시보드는 사용자별로 분리? 아니면 전역 공유? | Prisma 스키마 (userId?) |

---

## 10. References

- `@dnd-kit/core` — 드래그앤드롭
- `react-resizable-panels` — 리사이즈 (이미 프로젝트에 있음)
- `DataTable` (`src/components/ui/table/data-table.tsx`) — 테이블 재사용
- Kanban 보드 (`src/modules/kanban/`) — dnd-kit 사용 예시
