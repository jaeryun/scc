'use client';

import { Column, ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { Subnet } from '../../types';
import { CellAction } from './cell-action';

type SubnetWithCount = Subnet & { _count?: { ipAddresses: number } };

export const columns: ColumnDef<SubnetWithCount>[] = [
  {
    accessorKey: 'network',
    header: ({ column }: { column: Column<SubnetWithCount, unknown> }) => (
      <DataTableColumnHeader column={column} title='서브넷' />
    ),
    cell: ({ row }) => {
      const desc = row.original.description;
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{row.original.network}</span>
          {desc && <span className='text-muted-foreground text-xs'>{desc}</span>}
        </div>
      );
    },
    meta: {
      label: '서브넷',
      placeholder: '서브넷 검색...',
      variant: 'text' as const,
      icon: Icons.network
    },
    enableColumnFilter: true
  },
  {
    accessorKey: 'purpose',
    header: ({ column }: { column: Column<SubnetWithCount, unknown> }) => (
      <DataTableColumnHeader column={column} title='용도' />
    ),
    cell: ({ cell }) => {
      const purpose = cell.getValue<string | null>();
      if (!purpose) return <span className='text-muted-foreground'>-</span>;
      return (
        <Badge variant='outline' className='capitalize'>
          {purpose}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: '용도',
      variant: 'multiSelect' as const,
      options: [
        { value: '서비스-PM', label: '서비스-PM' },
        { value: '서비스-VM', label: '서비스-VM' },
        { value: 'OOB', label: 'OOB' },
        { value: '백업', label: '백업' },
        { value: 'H-B', label: 'H-B' },
        { value: 'NAS', label: 'NAS' }
      ]
    }
  },
  {
    accessorKey: 'centers',
    header: ({ column }: { column: Column<SubnetWithCount, unknown> }) => (
      <DataTableColumnHeader column={column} title='센터' />
    ),
    cell: ({ cell }) => {
      const centers = cell.getValue<string[]>();
      if (!centers?.length) return <span className='text-muted-foreground'>-</span>;
      return (
        <div className='flex flex-wrap gap-1'>
          {centers.map((c) => (
            <Badge key={c} variant='secondary' className='text-xs'>
              {c}
            </Badge>
          ))}
        </div>
      );
    },
    enableSorting: false
  },
  {
    accessorKey: 'vlanId',
    header: ({ column }: { column: Column<SubnetWithCount, unknown> }) => (
      <DataTableColumnHeader column={column} title='VLAN' />
    ),
    cell: ({ cell }) => {
      const vlan = cell.getValue<string | null>();
      return <span>{vlan || '-'}</span>;
    }
  },
  {
    id: 'ipCount',
    header: ({ column }: { column: Column<SubnetWithCount, unknown> }) => (
      <DataTableColumnHeader column={column} title='전체 IP' />
    ),
    accessorFn: (row) => row._count?.ipAddresses ?? 0,
    cell: ({ cell }) => <span className='tabular-nums'>{cell.getValue<number>()}</span>
  },
  {
    id: 'usageRate',
    header: ({ column }: { column: Column<SubnetWithCount, unknown> }) => (
      <DataTableColumnHeader column={column} title='사용률' />
    ),
    accessorFn: (row) => {
      const count = row._count?.ipAddresses ?? 0;
      const max = row.network.includes('/24')
        ? 256
        : row.network.includes('/23')
          ? 512
          : count || 1;
      return count / max;
    },
    cell: ({ row }) => {
      const count = row.original._count?.ipAddresses ?? 0;
      const max = row.original.network.includes('/24')
        ? 256
        : row.original.network.includes('/23')
          ? 512
          : count || 1;
      const pct = Math.min(100, (count / max) * 100);
      const barColor = pct > 75 ? 'bg-amber-500' : pct > 50 ? 'bg-chart-2' : 'bg-chart-1';
      return (
        <div className='flex items-center gap-2'>
          <div className='bg-muted h-2 w-16 overflow-hidden rounded'>
            <div className={`h-full rounded ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          <span className='text-muted-foreground w-8 text-right text-xs tabular-nums'>
            {pct.toFixed(0)}%
          </span>
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
