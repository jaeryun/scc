'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/page-container';

export default function ErrorPage({
  error,
  resetAction
}: {
  error: Error & { digest?: string };
  resetAction: () => void;
}) {
  useEffect(() => {
    console.error('Page render failed', { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <PageContainer pageTitle='오류 발생' pageDescription='페이지를 불러오는 중 문제가 발생했습니다'>
      <div className='flex flex-col items-center gap-4 py-12'>
        <p className='text-muted-foreground'>{error.message || '알 수 없는 오류'}</p>
        <Button onClick={() => resetAction()}>다시 시도</Button>
      </div>
    </PageContainer>
  );
}
