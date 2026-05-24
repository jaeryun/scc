'use client';

import { useState, useMemo } from 'react';
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DataTableFacetedFilter } from '@/components/ui/table/data-table-faceted-filter';
import { SwitchPortDetailSheet } from './switch-port-detail-sheet';
import { switchPortColumns } from './switch-port-columns';
import type { PortMapping } from '../types';
import type { Option } from '@/types/data-table';

interface SwitchPortTableProps {
  ports: PortMapping[];
  switchName: string;
}

function statusFilterOptions(): Option[] {
  return [
    { label: 'Up', value: 'up' },
    { label: 'Down', value: 'down' },
    { label: 'Unconnected', value: 'unconnected' }
  ];
}

export function SwitchPortTable({ ports }: SwitchPortTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedPort, setSelectedPort] = useState<PortMapping | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of ports) {
      counts[p.status] = (counts[p.status] ?? 0) + 1;
    }
    return counts;
  }, [ports]);

  const columns = useMemo(() => switchPortColumns({ statusCounts }), [statusCounts]);

  const table = useReactTable({
    data: ports,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTable
        table={table}
        onRowClick={(row) => {
          setSelectedPort(row);
          setSheetOpen(true);
        }}
      >
        <DataTableToolbar table={table}>
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title='Status'
            options={statusFilterOptions()}
          />
        </DataTableToolbar>
      </DataTable>
      <SwitchPortDetailSheet port={selectedPort} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
