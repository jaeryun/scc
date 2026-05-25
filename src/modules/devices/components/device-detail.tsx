'use client';

import { Suspense } from 'react';
import { useDevice } from '@/modules/devices/hooks/use-devices';
import { useInterfaces } from '@/modules/interfaces/hooks/use-interfaces';

function DetailInner({ id }: { id: number }) {
  const { data: device } = useDevice(id);
  const { data: interfaces } = useInterfaces(String(id));

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 gap-4'>
        <div className='rounded-lg border p-4'>
          <div className='text-sm text-muted-foreground'>Name</div>
          <div className='text-lg font-semibold'>{device.name}</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-sm text-muted-foreground'>Status</div>
          <div className='flex items-center gap-2'>
            <span
              className={`w-2 h-2 rounded-full ${device.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}
            />
            <span className='text-lg font-semibold capitalize'>{device.status}</span>
          </div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-sm text-muted-foreground'>Type</div>
          <div className='text-lg font-semibold'>{device.deviceType}</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-sm text-muted-foreground'>Role</div>
          <div className='text-lg font-semibold'>{device.role}</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-sm text-muted-foreground'>Site</div>
          <div className='text-lg font-semibold'>{device.site ?? '-'}</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-sm text-muted-foreground'>Rack</div>
          <div className='text-lg font-semibold'>{device.rack ?? '-'}</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-sm text-muted-foreground'>Serial</div>
          <div className='text-lg font-semibold font-mono'>{device.serial || '-'}</div>
        </div>
        <div className='rounded-lg border p-4'>
          <div className='text-sm text-muted-foreground'>Primary IP</div>
          <div className='text-lg font-semibold font-mono'>{device.primaryIp || '-'}</div>
        </div>
      </div>

      <div>
        <h2 className='text-lg font-semibold mb-3'>Interfaces ({interfaces.length})</h2>
        <div className='overflow-auto rounded-lg border'>
          <table className='w-full text-sm'>
            <thead className='border-b bg-muted/50'>
              <tr>
                <th className='text-left p-2 font-medium'>Name</th>
                <th className='text-left p-2 font-medium'>Type</th>
                <th className='text-left p-2 font-medium'>Speed</th>
                <th className='text-left p-2 font-medium'>MTU</th>
                <th className='text-left p-2 font-medium'>Connected To</th>
              </tr>
            </thead>
            <tbody>
              {interfaces.map((iface) => (
                <tr key={iface.id} className='border-b hover:bg-muted/30'>
                  <td className='p-2 font-medium'>{iface.name}</td>
                  <td className='p-2 text-muted-foreground'>{iface.type}</td>
                  <td className='p-2 text-muted-foreground font-mono'>
                    {iface.speed ? `${(iface.speed / 1_000_000).toFixed(1)} Gbps` : '-'}
                  </td>
                  <td className='p-2 text-muted-foreground font-mono'>{iface.mtu ?? '-'}</td>
                  <td className='p-2 text-muted-foreground'>
                    {iface.linkPeers.length > 0
                      ? iface.linkPeers.map((p) => `${p.device}/${p.name}`).join(', ')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function DeviceDetail({ id }: { id: number }) {
  return (
    <Suspense fallback={<div className='h-96 animate-pulse bg-muted rounded' />}>
      <DetailInner id={id} />
    </Suspense>
  );
}
