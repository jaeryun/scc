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
          {isLoading && (
            <SelectItem value='loading' disabled>
              Loading...
            </SelectItem>
          )}
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
    <div className='flex flex-1 flex-col gap-6'>
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
