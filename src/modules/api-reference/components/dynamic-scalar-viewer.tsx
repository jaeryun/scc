'use client';

import dynamic from 'next/dynamic';
import { ScalarLoadingSkeleton } from './scalar-loading';

const ScalarViewerClient = dynamic(
  () => import('@/modules/api-reference/components/scalar-viewer'),
  { ssr: false, loading: () => <ScalarLoadingSkeleton /> }
);

export default function DynamicScalarViewer({ specUrl }: { specUrl: string }) {
  return <ScalarViewerClient specUrl={specUrl} />;
}
