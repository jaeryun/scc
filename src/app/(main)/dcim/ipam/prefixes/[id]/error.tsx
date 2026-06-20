'use client';

import ErrorPageComponent from '@/components/layout/error-page';

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorPageComponent error={error} reset={reset} />;
}
