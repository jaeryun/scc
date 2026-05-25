'use client';

import { Suspense } from 'react';
import { useDevices } from '../hooks/use-devices';
import type { DeviceFilters } from '../api/types';

function DeviceTableInner({ filters }: { filters?: DeviceFilters }) {
  const { data: devices } = useDevices(filters);

  return (
    <div className='overflow-auto'>
      <table className='w-full text-sm'>
        <thead className='border-b bg-muted/50'>
          <tr>
            <th className='text-left p-2 font-medium'>Name</th>
            <th className='text-left p-2 font-medium'>Type</th>
            <th className='text-left p-2 font-medium'>Role</th>
            <th className='text-left p-2 font-medium'>Site</th>
            <th className='text-left p-2 font-medium'>Status</th>
            <th className='text-left p-2 font-medium'>Serial</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.id} className='border-b hover:bg-muted/30'>
              <td className='p-2 font-medium'>{d.name}</td>
              <td className='p-2 text-muted-foreground'>{d.deviceType}</td>
              <td className='p-2 text-muted-foreground'>{d.role}</td>
              <td className='p-2 text-muted-foreground'>{d.site ?? '-'}</td>
              <td className='p-2'>
                <span className='inline-flex items-center gap-1.5'>
                  <span
                    className={`w-2 h-2 rounded-full ${d.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}
                  />
                  {d.status}
                </span>
              </td>
              <td className='p-2 text-muted-foreground font-mono text-xs'>{d.serial || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DeviceTable({ filters }: { filters?: DeviceFilters }) {
  return (
    <Suspense fallback={<div className='h-64 animate-pulse bg-muted rounded' />}>
      <DeviceTableInner filters={filters} />
    </Suspense>
  );
}
