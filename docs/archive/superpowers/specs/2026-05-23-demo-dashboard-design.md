# Demo Dashboard — Design Specification

**Date:** 2026-05-23
**Status:** Approved
**References:** [Grafana Dashboard JSON Model](https://grafana.com/docs/grafana/latest/dashboards/json-model/), [react-grid-layout v2 Examples](https://github.com/react-grid-layout/react-grid-layout/tree/master/test/examples)
**Grid System:** react-grid-layout v2 (12-column, responsive)

---

## 1. Overview

정적 그리드 데모(`GridDashboardDemo`)를 Grafana 스타일의 DB 연동 대시보드 시스템으로 확장.
react-grid-layout 공식 예제 패턴 + Grafana Dashboard JSON Model을 표준 참조로 삼는다.

### 핵심 원칙
- **데이터 모델**: Grafana의 `{ type, title, gridPos, options }` 패널 구조를 따름
- **그리드**: react-grid-layout v2 API (`ResponsiveGridLayout`, `useContainerWidth`)
- **패널 추가**: RGL Example 06, 11 패턴 — `y: Infinity`로 하단 배치
- **패널 편집**: Grafana 패널 편집 패턴 — 뷰/편집 모드 분리, 인라인 + Dialog 편집
- **저장**: RGL Example 07 패턴 — `onLayoutChange` → DB 저장 (자동 저장)

---

## 2. Pages & Routes

```
/demo-components/grid-dashboard
  ├── page.tsx                          → 대시보드 목록
  └── [dashboardId]/
      └── page.tsx                      → 대시보드 캔버스
```

---

## 3. Data Model

### 3.1 Reference: Grafana Panel Structure

Grafana에서 패널은 다음과 같은 구조로 표현된다:
```json
{
  "id": 4,
  "type": "text",
  "title": "Panel Title",
  "gridPos": { "x": 0, "y": 0, "w": 12, "h": 9 },
  "options": { "mode": "markdown", "content": "# title" }
}
```

### 3.2 Our Model

Grafana의 `gridPos`{x,y,w,h} + `options` 패턴을 Prisma JSON 컬럼에 저장:

```prisma
model DemoDashboard {
  id            String   @id @default(cuid())
  title         String                            // dashboard title
  description   String?
  schemaVersion Int      @default(1)              // schema versioning (Grafana pattern)
  layout        Json     @default("{\"columns\":12,\"rowHeight\":80}")
  panels        Json     @default("[]")           // Panel[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### 3.3 TypeScript Types (Grafana-inspired)

```typescript
// Grid position — exactly matches react-grid-layout LayoutItem + Grafana gridPos
interface GridPos {
  x: number  // column start (0-indexed)
  y: number  // row start
  w: number  // width in columns
  h: number  // height in rows
}

// Panel — stored in panels Json array
// Mirrors Grafana: { id, type, title, gridPos, options }
interface Panel {
  id: string          // unique panel instance id (cuid)
  type: string        // panel type, references WidgetRegistry
  title: string       // display title (editable)
  gridPos: GridPos    // position & size
  options: Record<string, unknown>  // type-specific options
}

// WidgetRegistry entry — metadata for each panel type
interface PanelType {
  type: string
  label: string
  description: string
  icon: string
  defaultGridPos: GridPos   // default w, h
  defaultOptions: Record<string, unknown>
}
```

### 3.4 Key Design Decisions (from Grafana)

| Decision | Rationale |
|----------|-----------|
| `gridPos` as nested object | Grafana standard, cleaner than flat x/y/w/h |
| `options` (not `config`) | Grafana terminology |
| `panels` (not `items`) | Grafana terminology |
| `title` per panel | Grafana pattern — each panel has its own title |
| `schemaVersion` | Grafana pattern — future-proofing for data migration |
| `layout` as separate config | Grid settings (columns, rowHeight) separate from panel data |

---

## 4. Panel Registry & Rendering

### 4.1 Registry Architecture (Grafana Panel Plugin pattern)

```
widget-registry.ts
  ├── panelTypes: PanelType[]           → all registered panel types
  ├── getPanelType(type: string)        → lookup
  ├── searchPanelTypes(query: string)   → filter for dialog
  └── renderPanel(panel, isEditing, onOptionsChange) → dispatcher
```

### 4.2 Panel Types (v1)

| type | label | 편집 방식 | defaultGridPos | defaultOptions |
|------|-------|-----------|----------------|----------------|
| `text` | 텍스트 | inline | `{ w:3, h:3 }` | `{ content: "" }` |
| `stat` | 통계 | inline | `{ w:2, h:2 }` | `{ value: "0", unit: "" }` |
| `chart` | 차트 | inline | `{ w:4, h:3 }` | `{ chartType: "bar" }` |
| `info-card` | 정보 카드 | **dialog** | `{ w:3, h:3 }` | `{ description: "", status: "active", color: "blue", showBorder: true }` |

### 4.3 Panel Rendering Contract (Grafana pattern)

```typescript
interface PanelContentProps {
  options: Record<string, unknown>
  isEditing: boolean
  onOptionsChange: (newOptions: Record<string, unknown>) => void
}
```

- `isEditing=false`: Viewer mode — read-only rendering
- `isEditing=true`: Panel edit mode — inline editors or dialog trigger button
- `onOptionsChange`: called when panel options change, parent handles DB persistence

---

## 5. Components

### 5.1 Page Components (Server Components)

```
demo-components/grid-dashboard/
  ├── page.tsx                          → PageContainer + DashboardList
  └── [dashboardId]/page.tsx            → PageContainer + DashboardCanvas
```

### 5.2 Module Components (`src/modules/demo-dashboard/components/`)

| Component | Description |
|-----------|-------------|
| `DashboardList` | Dashboard cards grid + create/inline-edit title-desc + delete |
| `DashboardCanvas` | 12-col ResponsiveGridLayout + edit mode + panel rendering |
| `WidgetAddDialog` | Searchable panel type selection Dialog (Grafana Add Panel pattern) |
| `widgets/PanelText` | Text panel (inline editing) |
| `widgets/PanelStat` | Stat panel (inline editing) |
| `widgets/PanelChart` | Chart panel (inline type change) |
| `widgets/PanelInfoCard` | Info card panel (Dialog editing) |
| `widgets/panel-registry.tsx` | Panel registry + rendering dispatcher |

### 5.3 Shared UI (`src/components/ui/grid-dashboard/`)

| Component | Usage |
|-----------|-------|
| `WidgetFrame` | Panel card wrapper (title + remove/edit button) — existing, may enhance slightly |

---

## 6. API Design

```
GET    /api/demo-dashboards              → list all
POST   /api/demo-dashboards              → create { title }
GET    /api/demo-dashboards/:id          → detail
PUT    /api/demo-dashboards/:id          → update (title, description, layout, panels)
DELETE /api/demo-dashboards/:id          → delete
```

---

## 7. Data Flow

### 7.1 Canvas Page (react-grid-layout Example 06 + 07 patterns)

```
DashboardCanvas
  ├── useQuery(detail) → fetch dashboard
  ├── useMutation(update) → PUT on every change (auto-save)
  ├── ResponsiveGridLayout (RGL v2)
  │     ├── layouts: panels → RGL Layout[]
  │     ├── onLayoutChange → map back to panels → PUT
  │     ├── dragConfig.enabled = isEditing
  │     └── resizeConfig.enabled = isEditing
  ├── per panel: WidgetFrame
  │     ├── title = panel.title
  │     ├── isEditing={isEditing}
  │     ├── onRemove → filter panel → PUT (RGL Example 06)
  │     └── children: renderPanel(item, isEditing, onOptionsChange)
  │           └── onOptionsChange → update options → PUT
  ├── [+ Add Widget] button
  │     └── WidgetAddDialog
  │           ├── searchPanelTypes → filter registry
  │           └── select → new Panel with y:Infinity → PUT (RGL Ex 06)
  └── Header: title, description, Edit/Done toggle, Delete, Back
```

### 7.2 Key RGL Pattern: onLayoutChange → save

```typescript
// RGL LayoutItem[] → Panel[] mapping (Example 07 pattern)
onLayoutChange={(newLayout) => {
  const updatedPanels = newLayout.map((l) => {
    const panel = panels.find((p) => p.id === l.i)
    return { ...panel, gridPos: { x: l.x, y: l.y, w: l.w, h: l.h } }
  })
  updateMutation.mutate({ id, data: { panels: updatedPanels } })
}}
```

---

## 8. react-grid-layout Standards (21-example audit)

### 8.1 API Decision: v2 with useContainerWidth

All 21 examples were analyzed. The v2 API with hooks (examples 18-21) is the modern pattern:

```typescript
import { GridLayout, useContainerWidth } from 'react-grid-layout'
import { verticalCompactor } from 'react-grid-layout/core'
// CSS
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

function DashboardCanvas({ panels, isEditing, onLayoutChange }) {
  const { width, containerRef, mounted } = useContainerWidth()

  return (
    <div ref={containerRef}>
      {mounted && (
        <GridLayout
          width={width}
          layout={toRglLayout(panels)}
          gridConfig={{ cols: 12, rowHeight: 80 }}
          dragConfig={{ enabled: isEditing }}
          resizeConfig={{ enabled: isEditing }}
          compactor={verticalCompactor}
          constraints={[gridBounds, minMaxSize]}
          onLayoutChange={onLayoutChange}
        >
          {panels.map((p) => (
            <div key={p.id}>
              <WidgetFrame title={p.title} isEditing={isEditing}>
                {renderPanel(p, isEditing, onOptionsChange)}
              </WidgetFrame>
            </div>
          ))}
        </GridLayout>
      )}
    </div>
  )
}
```

**Why not `WidthProvider` HOC?** The HOC is the legacy v1 pattern used by examples 0-17. Examples 18-21 use `useContainerWidth` hook directly — this is the v2 idiomatic approach.

### 8.2 Reference Implementation Map (MUST FOLLOW)

| Example | Pattern | Priority | Usage in Our Dashboard |
|---------|---------|----------|------------------------|
| **06** | Dynamic Add/Remove: `y: Infinity` for new panels, `_.reject` for remove | ★★★ | `addPanel()` / `removePanel()` |
| **07** | Layout persistence: `onLayoutChange` → `saveToLS` pattern | ★★★ | `onLayoutChange` → `PUT /api/demo-dashboards` |
| **02** | Edit mode toggle: `isDraggable` + `isResizable` boolean | ★★★ | `isEditing` state → `dragConfig` / `resizeConfig` |
| **04** | `data-grid` on children: declarative item layout | ★★★ | children declare their own `data-grid` |
| **14** | Responsive Bootstrap: breakpoint-aware layouts | ★★ | `ResponsiveGridLayout` + breakpoints |
| **11** | Toolbox: separate `layouts` / `toolbox` arrays | ★★ | WidgetAddDialog add/remove pattern |
| **19** | Constraints: `gridBounds` + `minMaxSize` | ★★ | Prevent widgets from leaving grid |
| **17** | Resizable handles: `resizeHandles: ["se"]` | ★ | Default: only bottom-right resize |
| **18** | Compactors: `verticalCompactor` (default) | ★ | Standard vertical gravity compaction |
| **20** | Aspect ratio: per-item `aspectRatio` constraint | ☆ | Future: chart widgets |
| **21** | Custom constraints: `snapToGrid`, custom rules | ☆ | Future: alignment snapping |

### 8.3 Key Code Patterns (from audited examples)

**a) Panel → RGL LayoutItem mapping (Ex 06, 07)**
```typescript
function toRglLayout(panels: Panel[]): LayoutItem[] {
  return panels.map((p) => ({
    i: p.id,                    // panel.id === LayoutItem.i
    x: p.gridPos.x,
    y: p.gridPos.y,
    w: p.gridPos.w,
    h: p.gridPos.h
  }))
}
```

**b) Add panel with auto bottom placement (Ex 06)**
```typescript
const addPanel = useCallback((panelType: PanelType) => {
  const newPanel: Panel = {
    id: crypto.randomUUID(),
    type: panelType.type,
    title: panelType.label,
    gridPos: { x: 0, y: Infinity, w: panelType.defaultGridPos.w, h: panelType.defaultGridPos.h },
    options: { ...panelType.defaultOptions }
  }
  const updatedPanels = [...panels, newPanel]
  // RGL will auto-place at bottom when y: Infinity
  updateMutation.mutate({ id: dashboardId, data: { panels: updatedPanels } })
}, [panels, dashboardId, updateMutation])
```

**c) Remove panel (Ex 06, 11)**
```typescript
const removePanel = useCallback((panelId: string) => {
  const updatedPanels = panels.filter((p) => p.id !== panelId)
  updateMutation.mutate({ id: dashboardId, data: { panels: updatedPanels } })
}, [panels, dashboardId, updateMutation])
```

**d) Layout change → auto-save (Ex 07)**
```typescript
const handleLayoutChange = useCallback((newLayout: LayoutItem[]) => {
  const updatedPanels = newLayout.map((l) => {
    const panel = panels.find((p) => p.id === l.i)
    if (!panel) return null
    return {
      ...panel,
      gridPos: { x: l.x, y: l.y, w: l.w, h: l.h }
    }
  }).filter(Boolean) as Panel[]
  updateMutation.mutate({ id: dashboardId, data: { panels: updatedPanels } })
}, [panels, dashboardId, updateMutation])
```

### 8.4 Breakpoint & Responsive Config

```typescript
const breakpoints = { lg: 1200, md: 996, sm: 768 }
const colsConfig = { lg: 12, md: 8, sm: 4 }
const margin: [number, number] = [8, 8]
```

### 8.5 Rules Summary

1. `panel.id` → `LayoutItem.i` (stable, unique, never regenerated)
2. `y: Infinity` for new panels (RGL auto-places at bottom)
3. Deep copy layouts before mutation (RGL mutates internally)
4. `mounted` check before rendering grid (SSR safety)
5. `verticalCompactor` as default compactor
6. `gridBounds` + `minMaxSize` constraints always applied
7. CSS: import both stylesheets once in the canvas component

---

## 9. File Structure

```
src/
├── app/
│   ├── (main)/demo-components/grid-dashboard/
│   │   ├── page.tsx
│   │   └── [dashboardId]/page.tsx
│   └── api/demo-dashboards/
│       ├── route.ts
│       └── [id]/route.ts
│
├── modules/demo-dashboard/
│   ├── api/
│   │   ├── types.ts
│   │   ├── service.ts
│   │   ├── queries.ts
│   │   └── mutations.ts
│   └── components/
│       ├── dashboard-list.tsx
│       ├── dashboard-canvas.tsx
│       ├── widget-add-dialog.tsx
│       └── widgets/
│           ├── panel-registry.tsx
│           ├── panel-text.tsx
│           ├── panel-stat.tsx
│           ├── panel-chart.tsx
│           └── panel-info-card.tsx
│
├── components/ui/grid-dashboard/
│   └── widget-frame.tsx
│
└── config/
    └── views.ts                                # already registered
```

---

## 10. Implementation Order

1. Prisma model `DemoDashboard` + migration
2. API routes (GET list, POST create, GET detail, PUT update, DELETE)
3. Module layer: `types.ts` → `service.ts` → `queries.ts` → `mutations.ts`
4. Panel registry + 4 panel components
5. `WidgetAddDialog`
6. `DashboardList` page
7. `DashboardCanvas` page
8. Remove/replace `grid-dashboard-demo.tsx` old demo
9. react-grid-layout CLAUDE.md documentation
10. Verify (lint, typecheck, build)
