'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { cn } from '@/lib/utils';
import type { ColumnDef, Column } from '@tanstack/react-table';
import type { Device } from '../../api/types';

const STATUS_MAP: Record<
  string,
  { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }
> = {
  active: { variant: 'default', label: 'Active' },
  offline: { variant: 'secondary', label: 'Offline' },
  planned: { variant: 'outline', label: 'Planned' },
  staged: { variant: 'outline', label: 'Staged' },
  failed: { variant: 'destructive', label: 'Failed' },
  inventory: { variant: 'secondary', label: 'Inventory' },
  decommissioning: { variant: 'secondary', label: 'Decommissioning' }
};

const STATUS_DOT_CLASS: Record<string, string> = {
  active: 'bg-[var(--chart-2)]',
  failed: 'bg-destructive',
  planned: 'bg-[var(--chart-1)]',
  staged: 'bg-primary',
  inventory: 'bg-muted',
  decommissioning: 'bg-muted'
};

export const columns: ColumnDef<Device>[] = [
  {
    accessorKey: 'name',
    header: ({ column }: { column: Column<Device, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <Link
        href={`/dcim/devices/${row.original.id}`}
        className='font-medium text-primary hover:underline'
      >
        {row.original.name}
      </Link>
    ),
    meta: {
      label: 'Name',
      placeholder: 'Search by name...',
      variant: 'text' as const
    },
    enableColumnFilter: true
  },
  {
    accessorKey: 'deviceType',
    header: ({ column }: { column: Column<Device, unknown> }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ getValue }) => (
      <span className='text-muted-foreground'>{getValue<string>() || '—'}</span>
    ),
    meta: {
      label: 'Type',
      placeholder: 'Search type...',
      variant: 'text' as const
    },
    enableColumnFilter: true
  },
  {
    accessorKey: 'role',
    header: ({ column }: { column: Column<Device, unknown> }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ getValue }) => {
      const role = getValue<string>();
      return (
        <Badge variant='outline' className='capitalize'>
          {role || '—'}
        </Badge>
      );
    },
    meta: {
      label: 'Role',
      variant: 'select' as const
    },
    enableColumnFilter: true,
    filterFn: 'includesString'
  },
  {
    accessorKey: 'site',
    header: ({ column }: { column: Column<Device, unknown> }) => (
      <DataTableColumnHeader column={column} title='Site' />
    ),
    cell: ({ getValue }) => (
      <span className='text-muted-foreground'>{getValue<string>() || '—'}</span>
    ),
    meta: {
      label: 'Site',
      variant: 'select' as const
    },
    enableColumnFilter: true,
    filterFn: 'includesString'
  },
  {
    accessorKey: 'status',
    header: ({ column }: { column: Column<Device, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ getValue }) => {
      const status = getValue<string>() || '';
      const conf = STATUS_MAP[status] ?? { variant: 'outline' as const, label: status };
      return (
        <Badge variant={conf.variant}>
          <span
            className={cn(
              'mr-1 inline-block w-1.5 h-1.5 rounded-full',
              STATUS_DOT_CLASS[status] ?? 'bg-muted'
            )}
          />
          {conf.label}
        </Badge>
      );
    },
    meta: {
      label: 'Status',
      variant: 'select' as const
    },
    enableColumnFilter: true,
    filterFn: 'includesString'
  },
  {
    accessorKey: 'serial',
    header: ({ column }: { column: Column<Device, unknown> }) => (
      <DataTableColumnHeader column={column} title='Serial' />
    ),
    cell: ({ getValue }) => (
      <span className='text-muted-foreground font-mono text-xs'>{getValue<string>() || '—'}</span>
    ),
    meta: {
      label: 'Serial',
      placeholder: 'Search serial...',
      variant: 'text' as const
    },
    enableColumnFilter: false
  },
  {
    accessorKey: 'primaryIp',
    header: ({ column }: { column: Column<Device, unknown> }) => (
      <DataTableColumnHeader column={column} title='IP' />
    ),
    cell: ({ getValue }) => (
      <span className='text-muted-foreground font-mono text-xs'>{getValue<string>() || '—'}</span>
    ),
    meta: {
      label: 'IP',
      placeholder: 'Search IP...',
      variant: 'text' as const
    },
    enableColumnFilter: false
  }
];
