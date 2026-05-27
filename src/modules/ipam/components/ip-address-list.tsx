'use client';

import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import { usePrefixes } from '../hooks/use-prefixes';
import { useIpAddresses } from '../hooks/use-ip-addresses';

const STATUS_CLASS: Record<string, string> = {
  active: 'bg-[var(--chart-2)]/20 text-[var(--chart-2)]',
  reserved: 'bg-[var(--chart-4)]/20 text-[var(--chart-4)]',
  deprecated: 'bg-destructive/20 text-destructive'
};

function IpListInner({ prefixId }: { prefixId: number }) {
  const { data: ips } = useIpAddresses({ prefix: String(prefixId) });
  const { data: prefixes } = usePrefixes();
  const prefix = prefixes.find((p) => p.id === prefixId);

  return (
    <div className='space-y-4'>
      {prefix && (
        <div className='rounded-lg border p-4'>
          <div className='text-sm text-muted-foreground'>Prefix</div>
          <div className='text-lg font-mono font-semibold'>{prefix.prefix}</div>
          <div className='text-sm text-muted-foreground mt-1'>{prefix.description}</div>
        </div>
      )}

      <h2 className='text-lg font-semibold'>IP Addresses ({ips.length})</h2>
      <div className='overflow-auto rounded-lg border'>
        <table className='w-full text-sm'>
          <thead className='border-b bg-muted/50'>
            <tr>
              <th className='text-left p-2 font-medium'>Address</th>
              <th className='text-left p-2 font-medium'>Status</th>
              <th className='text-left p-2 font-medium'>DNS Name</th>
              <th className='text-left p-2 font-medium'>Description</th>
              <th className='text-left p-2 font-medium'>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {ips.map((ip) => (
              <tr key={ip.id} className='border-b hover:bg-muted/30'>
                <td className='p-2 font-mono font-medium'>{ip.address}</td>
                <td className='p-2'>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs font-medium',
                      STATUS_CLASS[ip.status] ?? 'bg-muted/30 text-muted-foreground'
                    )}
                  >
                    {ip.status}
                  </span>
                </td>
                <td className='p-2 text-muted-foreground'>{ip.dnsName || '-'}</td>
                <td className='p-2 text-muted-foreground'>{ip.description || '-'}</td>
                <td className='p-2 text-muted-foreground font-mono text-xs'>
                  {ip.assignedObject || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function IpAddressList({ prefixId }: { prefixId: number }) {
  return (
    <Suspense fallback={<div className='h-48 animate-pulse bg-muted rounded' />}>
      <IpListInner prefixId={prefixId} />
    </Suspense>
  );
}
