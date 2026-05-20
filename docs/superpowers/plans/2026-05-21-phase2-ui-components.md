# Phase 2: Switch Port Mapping — UI Components

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 스위치 포트-호스트 매핑 UI 컴포넌트 제작 및 페이지 조립

**Architecture:** Phase 1의 데이터 계층(types/service/queries/hooks) 위에 순수 presentational 컴포넌트(Type A)를 쌓음. 컴포넌트 배치: 도메인 의존성 있으므로 `src/modules/switch-mapping/components/`. 기존 shadcn DataTable + Sheet + Badge 활용.

**Tech Stack:** React 19, TypeScript, TanStack Table v8, shadcn/ui (DataTable, Sheet, Badge, Skeleton), Tailwind CSS v4

---

## File Map

```
Create:
  src/modules/switch-mapping/components/switch-port-status-badge.tsx
  src/modules/switch-mapping/components/switch-port-columns.tsx
  src/modules/switch-mapping/components/switch-port-detail-sheet.tsx
  src/modules/switch-mapping/components/switch-port-table.tsx
  src/app/(main)/switch-mapping/page.tsx

Modify:
  src/config/views.ts                               ← 뷰 등록
  src/modules/switch-mapping/index.ts                ← 컴포넌트 export 추가
```

---

### Task 9: Status Badge Component (Type A)

**Files:**
- Create: `src/modules/switch-mapping/components/switch-port-status-badge.tsx`

- [ ] **Step 1: Create status badge component**

```typescript
// src/modules/switch-mapping/components/switch-port-status-badge.tsx

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PortStatus } from '../types'

const STATUS_CONFIG: Record<PortStatus, { label: string; className: string }> = {
  up: {
    label: 'Up',
    className:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  },
  down: {
    label: 'Down',
    className:
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  },
  degraded: {
    label: 'Degraded',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  unconnected: {
    label: 'Unconnected',
    className: 'bg-muted text-muted-foreground border-muted-foreground/20',
  },
}

interface SwitchPortStatusBadgeProps {
  status: PortStatus
}

export function SwitchPortStatusBadge({ status }: SwitchPortStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge variant='outline' className={cn('rounded-sm text-xs', config.className)}>
      {config.label}
    </Badge>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/switch-mapping/components/switch-port-status-badge.tsx
git commit -m "feat(switch-mapping): add status badge component"
```

---

### Task 10: Column Definitions Factory (Type A)

**Files:**
- Create: `src/modules/switch-mapping/components/switch-port-columns.tsx`

- [ ] **Step 1: Read existing DataTable pattern for reference**

Read `src/modules/ipam/components/subnets-table/columns.tsx` to understand the column definition pattern used in the project.

- [ ] **Step 2: Create column definitions**

```typescript
// src/modules/switch-mapping/components/switch-port-columns.tsx

'use client'

import { ColumnDef } from '@tanstack/react-table'
import { SwitchPortStatusBadge } from './switch-port-status-badge'
import type { PortMapping } from '../types'

function StatusHeader({ statusCounts }: { statusCounts: Record<string, number> }) {
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0)
  return `Status (${total})`
}

interface SwitchPortColumnsOptions {
  statusCounts: Record<string, number>
}

export function switchPortColumns(opts: SwitchPortColumnsOptions): ColumnDef<PortMapping>[] {
  return [
    {
      accessorKey: 'status',
      header: () => <StatusHeader statusCounts={opts.statusCounts} />,
      cell: ({ getValue }) => {
        return <SwitchPortStatusBadge status={getValue() as PortMapping['status']} />
      },
      enableColumnFilter: true,
      filterFn: 'equalsString',
      size: 140,
    },
    {
      accessorKey: 'switchPortName',
      header: 'Switch Port',
      cell: ({ getValue }) => {
        return <code className='text-xs font-mono'>{getValue() as string}</code>
      },
      enableSorting: true,
      size: 160,
    },
    {
      accessorKey: 'hostName',
      header: 'Host',
      cell: ({ getValue }) => {
        const val = getValue() as string | null
        return val ?? <span className='text-muted-foreground'>-</span>
      },
      enableSorting: true,
      size: 160,
    },
    {
      accessorKey: 'hostPortName',
      header: 'Host Port',
      cell: ({ getValue }) => {
        const val = getValue() as string | null
        return val
          ? <code className='text-xs font-mono'>{val}</code>
          : <span className='text-muted-foreground'>-</span>
      },
      enableSorting: true,
      size: 140,
    },
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/switch-mapping/components/switch-port-columns.tsx
git commit -m "feat(switch-mapping): add column definitions"
```

---

### Task 11: Detail Sheet Component (Type A)

**Files:**
- Create: `src/modules/switch-mapping/components/switch-port-detail-sheet.tsx`

- [ ] **Step 1: Read existing Sheet pattern for reference**

Read `src/modules/ipam/components/subnet-form-sheet.tsx` and `src/modules/users/components/user-form-sheet.tsx` for Sheet usage patterns.

- [ ] **Step 2: Create detail sheet component**

```typescript
// src/modules/switch-mapping/components/switch-port-detail-sheet.tsx

'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { SwitchPortStatusBadge } from './switch-port-status-badge'
import type { PortMapping } from '../types'

interface SwitchPortDetailSheetProps {
  port: PortMapping | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DetailRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className='flex items-center justify-between py-1.5'>
      <span className='text-muted-foreground text-sm'>{label}</span>
      <span className='font-mono text-sm'>{value ?? '-'}</span>
    </div>
  )
}

export function SwitchPortDetailSheet({
  port,
  open,
  onOpenChange,
}: SwitchPortDetailSheetProps) {
  if (!port) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>No port selected</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )
  }

  const portAttrs = Object.entries(port.values)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-[400px] sm:max-w-[400px]'>
        <SheetHeader>
          <SheetTitle className='font-mono'>{port.switchPortName}</SheetTitle>
          <SheetDescription>
            <SwitchPortStatusBadge status={port.status} />
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-4'>
          <div>
            <h4 className='mb-2 text-sm font-semibold'>Switch</h4>
            <DetailRow label='Switch' value={port.switchName} />
            <DetailRow label='Port' value={port.switchPortName} />
            {portAttrs.map(([key, value]) => (
              <DetailRow key={key} label={key} value={String(value)} />
            ))}
          </div>

          <Separator />

          <div>
            <h4 className='mb-2 text-sm font-semibold'>
              Connected Host
            </h4>
            <DetailRow label='Hostname' value={port.hostName} />
            <DetailRow label='Host Port' value={port.hostPortName} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/switch-mapping/components/switch-port-detail-sheet.tsx
git commit -m "feat(switch-mapping): add detail sheet component"
```

---

### Task 12: Main Switch Port Table Component (Type A)

**Files:**
- Create: `src/modules/switch-mapping/components/switch-port-table.tsx`

- [ ] **Step 1: Read existing DataTable usage patterns**

Read `src/modules/ipam/components/subnets-table/subnets-table.tsx` and `src/modules/users/components/users-table/index.tsx` for how DataTable is used in the project. Also read `src/components/ui/table/data-table-toolbar.tsx` for filter configuration.

- [ ] **Step 2: Create the main table component**

```typescript
// src/modules/switch-mapping/components/switch-port-table.tsx

'use client'

import { useState, useMemo } from 'react'
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { DataTable } from '@/components/ui/table/data-table'
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar'
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header'
import { SwitchPortDetailSheet } from './switch-port-detail-sheet'
import { switchPortColumns } from './switch-port-columns'
import type { PortMapping, PortStatus } from '../types'

interface SwitchPortTableProps {
  ports: PortMapping[]
  switchName: string
}

function statusFilterOptions() {
  return [
    { label: 'Up', value: 'up' },
    { label: 'Down', value: 'down' },
    { label: 'Unconnected', value: 'unconnected' },
  ]
}

export function SwitchPortTable({ ports, switchName }: SwitchPortTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [selectedPort, setSelectedPort] = useState<PortMapping | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of ports) {
      counts[p.status] = (counts[p.status] ?? 0) + 1
    }
    return counts
  }, [ports])

  const columns = useMemo(() => switchPortColumns({ statusCounts }), [statusCounts])

  const table = useReactTable({
    data: ports,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className='flex flex-col gap-4'>
      <DataTableToolbar
        table={table}
        filterFields={[
          {
            id: 'status',
            label: 'Status',
            options: statusFilterOptions(),
          },
        ]}
      />
      <DataTable
        table={table}
        onRowClick={(row) => {
          setSelectedPort(row.getValue('status') as unknown as PortMapping)
          setSheetOpen(true)
        }}
      />
      <SwitchPortDetailSheet
        port={selectedPort}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}
```

- [ ] **Step 3: Fix the onRowClick — row.original 사용**

The `onRowClick` in the existing `DataTable` uses `row.getValue()`, but we need `row.original`. Check the DataTable component:

Read `src/components/ui/table/data-table.tsx` to verify the row click handler signature.

If `onRowClick` receives `Row<TData>`, change to:

```typescript
onRowClick={(row) => {
  setSelectedPort((row as { original: PortMapping }).original)
  setSheetOpen(true)
}}
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/switch-mapping/components/switch-port-table.tsx
git commit -m "feat(switch-mapping): add main table component"
```

---

### Task 13: Page Assembly + View Config

**Files:**
- Modify: `src/config/views.ts`
- Create: `src/app/(main)/switch-mapping/page.tsx`

- [ ] **Step 1: Add view to config**

Read `src/config/views.ts`. Add a new view entry before the `settings` entry:

```typescript
{
  id: 'switch-mapping',
  label: 'Switch Mapping',
  icon: 'switch',
  navItems: [
    { title: 'Port Mapping', href: '/switch-mapping', icon: 'network' },
  ],
},
```

- [ ] **Step 2: Create page with switch selector + sync button**

```typescript
// src/app/(main)/switch-mapping/page.tsx

import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/page-container'
import { SwitchPortView } from './switch-port-view'

export const metadata: Metadata = {
  title: 'Switch Port Mapping',
  description: '네트워크 스위치 포트-호스트 매핑 현황',
}

export default function SwitchMappingPage() {
  return (
    <PageContainer
      pageTitle='Switch Port Mapping'
      pageDescription='IB / SAN / UTP 스위치 포트 연결 현황'
    >
      <SwitchPortView />
    </PageContainer>
  )
}
```

- [ ] **Step 3: Create client view component**

```typescript
// src/app/(main)/switch-mapping/switch-port-view.tsx

'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Icons } from '@/components/icons'
import { useSwitchPorts, useSwitchesByRole } from '@/modules/switch-mapping/hooks/use-switch-ports'
import { SwitchPortTable } from '@/modules/switch-mapping/components/switch-port-table'
import type { NetBoxDevice } from '@/modules/switch-mapping/api/types'

const SWITCH_ROLES = [
  { role: 'ib-switch', label: 'IB Switch' },
  { role: 'san-switch', label: 'SAN Switch' },
  { role: 'access-switch', label: 'UTP Access Switch' },
]

function SwitchSelector({
  role,
  onSelect,
}: {
  role: string
  onSelect: (deviceId: string) => void
}) {
  const { data: devices, isLoading } = useSwitchesByRole(role)

  return (
    <div className='flex flex-col gap-1'>
      <label className='text-sm font-medium text-muted-foreground'>
        {SWITCH_ROLES.find((r) => r.role === role)?.label ?? role}
      </label>
      <Select onValueChange={onSelect}>
        <SelectTrigger className='w-[320px]'>
          <SelectValue placeholder='Select switch...' />
        </SelectTrigger>
        <SelectContent>
          {isLoading && <SelectItem value='loading' disabled>Loading...</SelectItem>}
          {(devices ?? []).map((d: NetBoxDevice) => (
            <SelectItem key={d.id} value={String(d.id)}>
              {d.name ?? `Device#${d.id}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function SwitchPortView() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const { data, isLoading, isError, refetch } = useSwitchPorts(selectedDeviceId)

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-end gap-4'>
        {SWITCH_ROLES.map((r) => (
          <SwitchSelector
            key={r.role}
            role={r.role}
            onSelect={(id) => {
              setSelectedDeviceId(id)
            }}
          />
        ))}
        <Button
          variant='outline'
          size='sm'
          onClick={() => refetch()}
          disabled={!selectedDeviceId}
        >
          <Icons.reload className='mr-2 h-4 w-4' />
          Sync Now
        </Button>
      </div>

      {isLoading && !data && <Skeleton className='h-64 w-full' />}
      {isError && (
        <p className='text-destructive text-sm'>
          Failed to load switch data. Check NetBox connection.
        </p>
      )}
      {data && (
        <SwitchPortTable ports={data.ports} switchName={data.switchName} />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Update barrel export**

Read `src/modules/switch-mapping/index.ts`. Add component exports:

```typescript
export { SwitchPortTable } from './components/switch-port-table'
export { SwitchPortDetailSheet } from './components/switch-port-detail-sheet'
export { SwitchPortStatusBadge } from './components/switch-port-status-badge'
```

- [ ] **Step 5: Check existing DataTable row click signature**

Read `src/components/ui/table/data-table.tsx` lines around `onRowClick` to verify the exact type signature. Adjust Task 12's `onRowClick` handler accordingly.

- [ ] **Step 6: Commit**

```bash
git add src/config/views.ts
git add src/app/(main)/switch-mapping/
git add src/modules/switch-mapping/index.ts
git commit -m "feat(switch-mapping): add page assembly + view config"
```

---

### Task 14: Build & Integration Test

- [ ] **Step 1: Run lint**

```bash
bun run lint
```

Expected: No errors.

- [ ] **Step 2: Run format check**

```bash
bun run format:check
```

Expected: No formatting issues. If issues, run `bun run format:fix`.

- [ ] **Step 3: Run build**

```bash
bun run build
```

Expected: Build succeeds.

- [ ] **Step 4: Start dev server and verify page**

```bash
bun run dev
```

Navigate to `http://localhost:3000/switch-mapping`.

Expected:
- Page loads with "Switch Port Mapping" title
- Three Select dropdowns visible (IB Switch, SAN Switch, UTP Access Switch)
- Selecting a switch loads port data table
- Up ports show green badge, unconnected show gray
- Clicking a row opens detail sheet
- "Sync Now" button re-fetches data from NetBox

- [ ] **Step 5: Test error state**

Temporarily stop NetBox or change NETBOX_URL to invalid. Refresh page.

Expected: "Failed to load switch data" error message without page crash.

- [ ] **Step 6: Commit (if any fixes)**

```bash
git add -A
git commit -m "fix(switch-mapping): integration test fixes"
```

---

## Phase 2 Completion Checklist

- [ ] `bun run build` 성공
- [ ] `bun run lint` 통과
- [ ] `/switch-mapping` 페이지 로드됨
- [ ] IB/SAN/UTP 스위치 Select 보임
- [ ] 스위치 선택 → 포트 목록 테이블 표시
- [ ] 상태(Up/Unconnected) Badge 정상 렌더링
- [ ] 행 클릭 → Detail Sheet 열림
- [ ] "Sync Now" 버튼 → NetBox 재조회
- [ ] NetBox 중지 시 에러 메시지 표시 (크래시 없음)
