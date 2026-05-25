'use client';

import { Button } from '@/components/ui/button';

export default function ApiReferenceError({
  error: _error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='flex flex-col items-center justify-center p-12'>
      <h2 className='text-xl font-semibold mb-2'>오류가 발생했습니다</h2>
      <p className='text-muted-foreground mb-4 text-sm'>
        페이지를 불러오는 중 문제가 발생했습니다.
      </p>
      <Button onClick={reset}>재시도</Button>
    </div>
  );
}
