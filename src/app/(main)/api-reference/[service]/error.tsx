'use client';

import { Button } from '@/components/ui/button';

export default function ApiReferenceServiceError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='flex flex-col items-center justify-center p-12'>
      <h2 className='text-xl font-semibold mb-2'>API Reference 로딩 실패</h2>
      <p className='text-muted-foreground mb-4 text-sm'>
        스펙 파일을 불러오는 중 오류가 발생했습니다.
      </p>
      <Button onClick={reset}>재시도</Button>
    </div>
  );
}
