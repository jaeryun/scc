'use client';

import dynamic from 'next/dynamic';

const ScalarViewer = dynamic(
  () => import('@scalar/api-reference-react').then((mod) => ({ default: mod.ApiReferenceReact })),
  {
    ssr: false,
    loading: () => (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    )
  }
);

export default function ApiReferenceViewer() {
  return (
    <div className='h-[calc(100vh-41px)] w-full' role='region' aria-label='API Reference'>
      <ScalarViewer
        configuration={{
          spec: { url: '/api-specs/internal/latest.json' },
          hideDarkModeToggle: true,
          hideSearch: false
        }}
      />
    </div>
  );
}
