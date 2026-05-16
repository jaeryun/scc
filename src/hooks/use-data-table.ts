'use client';

import * as React from 'react';
import {
  ColumnDef,
  PaginationState,
  SortingState,
  Updater,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useQueryState, useQueryStates, parseAsInteger } from 'nuqs';

interface UseDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  pageCount: number;
  shallow?: boolean;
  debounceMs?: number;
  initialState?: {
    columnPinning?: {
      left?: string[];
      right?: string[];
    };
  };
}

export function useDataTable<TData>({
  data,
  columns,
  pageCount,
  shallow = true,
  debounceMs = 500,
  initialState
}: UseDataTableProps<TData>) {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1).withOptions({ shallow, throttleMs: debounceMs }));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10).withOptions({ shallow }));

  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize: perPage
  };

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      columnPinning: initialState?.columnPinning
    },
    onPaginationChange: (updater: Updater<PaginationState>) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      setPage(newPagination.pageIndex + 1);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true
  });

  return { table };
}
