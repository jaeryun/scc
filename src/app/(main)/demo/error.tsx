'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DemoError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page render failed', { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <div className='flex flex-1 items-center justify-center p-6'>
      <div className='text-center space-y-3'>
        <h2 className='text-lg font-semibold'>데모 페이지 오류</h2>
        <p className='text-sm text-muted-foreground'>문제가 발생했습니다.</p>
        <Button variant='outline' size='sm' onClick={reset}>
          다시 시도
        </Button>
      </div>
    </div>
  );
}
