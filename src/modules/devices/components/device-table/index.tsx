'use client';

import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { devicesQueryOptions } from '../../api/queries';
import { columns } from './columns';

function DeviceTableInner() {
  const { data: devices } = useSuspenseQuery(devicesQueryOptions());

  const table = useReactTable({
    data: devices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: { pageSize: 15 }
    }
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}

export function DeviceTable() {
  return (
    <Suspense fallback={<div className='h-96 animate-pulse bg-muted rounded-lg' />}>
      <DeviceTableInner />
    </Suspense>
  );
}
