'use client';

import { Suspense } from 'react';
import { useSites } from '../hooks/use-sites';

function SiteSelectorInner({
  value,
  onChange
}: {
  value?: number;
  onChange: (id: number) => void;
}) {
  const { data: sites } = useSites();
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(Number(e.target.value))}
      className='border rounded px-2 py-1'
    >
      <option value=''>Select site...</option>
      {sites.map((site) => (
        <option key={site.id} value={site.id}>
          {site.name}
        </option>
      ))}
    </select>
  );
}

export function SiteSelector(props: { value?: number; onChange: (id: number) => void }) {
  return (
    <Suspense fallback={<div className='h-9 w-48 animate-pulse bg-muted rounded' />}>
      <SiteSelectorInner {...props} />
    </Suspense>
  );
}
