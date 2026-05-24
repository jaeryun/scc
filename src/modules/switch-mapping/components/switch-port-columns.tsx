'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SwitchPortStatusBadge } from './switch-port-status-badge';
import type { PortMapping } from '../types';

interface SwitchPortColumnsOptions {
  statusCounts: Record<string, number>;
}

export function switchPortColumns(opts: SwitchPortColumnsOptions): ColumnDef<PortMapping>[] {
  return [
    {
      accessorKey: 'status',
      header: () => {
        const total = Object.values(opts.statusCounts).reduce((a, b) => a + b, 0);
        return `Status (${total})`;
      },
      cell: ({ getValue }) => {
        return <SwitchPortStatusBadge status={getValue() as PortMapping['status']} />;
      },
      enableColumnFilter: true,
      filterFn: 'equalsString',
      size: 140
    },
    {
      accessorKey: 'switchPortName',
      header: 'Switch Port',
      cell: ({ getValue }) => {
        return <code className='text-xs font-mono'>{getValue() as string}</code>;
      },
      enableSorting: true,
      size: 160
    },
    {
      accessorKey: 'hostName',
      header: 'Host',
      cell: ({ getValue }) => {
        const val = getValue() as string | null;
        return val ?? <span className='text-muted-foreground'>-</span>;
      },
      enableSorting: true,
      size: 160
    },
    {
      accessorKey: 'hostPortName',
      header: 'Host Port',
      cell: ({ getValue }) => {
        const val = getValue() as string | null;
        return val ? (
          <code className='text-xs font-mono'>{val}</code>
        ) : (
          <span className='text-muted-foreground'>-</span>
        );
      },
      enableSorting: true,
      size: 140
    }
  ];
}
