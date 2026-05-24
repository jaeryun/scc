'use client';

import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { cn } from '@/lib/utils';

interface ScalarViewerProps {
  specUrl: string;
  className?: string;
}

export default function ScalarViewer({ specUrl, className }: ScalarViewerProps) {
  return (
    <div className={cn('w-full', className)} role='region' aria-label='API Reference'>
      <ApiReferenceReact
        configuration={{
          spec: { url: specUrl },
          hideDarkModeToggle: true,
          hideSearch: false
        }}
      />
    </div>
  );
}
