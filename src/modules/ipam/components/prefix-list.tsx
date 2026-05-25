'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePrefixes } from '../hooks/use-prefixes';

function PrefixListInner() {
  const { data: prefixes } = usePrefixes();

  return (
    <div className='overflow-auto rounded-lg border'>
      <table className='w-full text-sm'>
        <thead className='border-b bg-muted/50'>
          <tr>
            <th className='text-left p-2 font-medium'>Prefix</th>
            <th className='text-left p-2 font-medium'>Description</th>
            <th className='text-left p-2 font-medium'>VLAN</th>
            <th className='text-left p-2 font-medium'>Site</th>
            <th className='text-left p-2 font-medium'>Role</th>
          </tr>
        </thead>
        <tbody>
          {prefixes.map((p) => (
            <tr key={p.id} className='border-b hover:bg-muted/30'>
              <td className='p-2 font-medium font-mono'>
                <Link href={`/dcim/ipam/prefixes/${p.id}`} className='text-primary hover:underline'>
                  {p.prefix}
                </Link>
              </td>
              <td className='p-2 text-muted-foreground'>{p.description || '-'}</td>
              <td className='p-2 text-muted-foreground'>{p.vlan ?? '-'}</td>
              <td className='p-2 text-muted-foreground'>{p.site ?? '-'}</td>
              <td className='p-2 text-muted-foreground'>{p.role ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PrefixList() {
  return (
    <Suspense fallback={<div className='h-32 animate-pulse bg-muted rounded' />}>
      <PrefixListInner />
    </Suspense>
  );
}
