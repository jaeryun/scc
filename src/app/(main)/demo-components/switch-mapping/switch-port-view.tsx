'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { useSwitchPorts, useSwitchesByRole } from '@/modules/switch-mapping/hooks/use-switch-ports';
import { SwitchPortTable } from '@/modules/switch-mapping/components/switch-port-table';

const SWITCH_CONFIG = [
  { role: 'ib-switch', label: 'IB Switch' },
  { role: 'san-switch', label: 'SAN Switch' },
  { role: 'access-switch', label: 'UTP Access Switch' }
];

function SwitchPortSection({ role, label }: { role: string; label: string }) {
  const { data: devices, isLoading: devicesLoading } = useSwitchesByRole(role);
  const firstDeviceId = devices?.[0]?.id ? String(devices[0].id) : '';
  const { data, isLoading, isError, refetch } = useSwitchPorts(firstDeviceId);

  const switchName = useMemo(() => {
    if (!devices || devices.length === 0) return 'No device found';
    return devices[0].name ?? `Device#${devices[0].id}`;
  }, [devices]);

  const isReady = !devicesLoading && firstDeviceId;

  return (
    <div className='flex flex-col gap-4 h-[600px]'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>{label}</h3>
          <p className='text-sm text-muted-foreground'>{switchName}</p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => refetch()}
          disabled={!isReady || isLoading}
        >
          <Icons.reload className='mr-2 h-4 w-4' />
          Sync
        </Button>
      </div>
      {devicesLoading && <Skeleton className='h-64 w-full' />}
      {!devicesLoading && devices?.length === 0 && (
        <p className='text-muted-foreground text-sm'>No {label} found.</p>
      )}
      {isLoading && isReady && <Skeleton className='h-64 w-full' />}
      {isError && (
        <p className='text-destructive text-sm'>
          Failed to load switch data. Check NetBox connection.
        </p>
      )}
      {data && <SwitchPortTable ports={data.ports} switchName={data.switchName} />}
    </div>
  );
}

export function SwitchPortView() {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      {SWITCH_CONFIG.map((config) => (
        <SwitchPortSection key={config.role} role={config.role} label={config.label} />
      ))}
    </div>
  );
}
