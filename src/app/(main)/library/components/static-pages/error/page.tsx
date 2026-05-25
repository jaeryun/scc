import PageContainer from '@/components/layout/page-container';
import { Button, buttonVariants } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '에러 페이지',
  description: '서버 에러 상태 — 정적 페이지 UI 데모'
};

export default function ErrorDemoPage() {
  return (
    <PageContainer
      pageTitle='에러 페이지'
      pageDescription='500, 502, 503 등 서버 에러 상태를 표시하는 정적 UI 데모입니다.'
    >
      <div className='space-y-8'>
        {/* 500 Internal Server Error */}
        <Card className='border-dashed p-12 text-center'>
          <span className='from-destructive bg-gradient-to-b to-transparent bg-clip-text text-[8rem] leading-none font-extrabold text-transparent select-none'>
            500
          </span>
          <h2 className='-mt-2 mb-2 text-xl font-bold'>서버 오류가 발생했습니다</h2>
          <p className='mb-8 text-muted-foreground'>
            예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          <div className='flex justify-center gap-3'>
            <Button variant='default'>새로고침</Button>
            <Button variant='outline'>홈으로 이동</Button>
          </div>
        </Card>

        {/* 503 Maintenance */}
        <Card className='border-dashed p-12 text-center'>
          <div className='mb-6 flex justify-center'>
            <div className='flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/10'>
              <svg
                className='h-12 w-12 text-amber-500'
                fill='none'
                stroke='currentColor'
                strokeWidth={1.5}
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M11.42 15.17 12 13.5l.58 1.67H15l-1.5 1.09.57 1.67L12 16.74l-2.07 1.19.57-1.67L9 15.17h2.42Z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z'
                />
              </svg>
            </div>
          </div>
          <h2 className='mb-2 text-xl font-bold'>점검 중입니다</h2>
          <p className='mb-2 text-muted-foreground'>
            더 나은 서비스 제공을 위해 시스템 점검을 진행하고 있습니다.
          </p>
          <Badge variant='secondary' className='mb-6 font-mono'>
            예상 완료: 2026-05-25 06:00 (KST)
          </Badge>
          <div>
            <Button variant='outline'>상태 페이지 보기</Button>
          </div>
        </Card>

        {/* Inline Error Alert */}
        <div className='space-y-3'>
          <h3 className='font-semibold text-lg'>인라인 에러 알림</h3>

          <Alert variant='destructive'>
            <AlertTitle>저장 실패</AlertTitle>
            <AlertDescription>
              데이터를 저장하는 중 오류가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertTitle>주의</AlertTitle>
            <AlertDescription>이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?</AlertDescription>
          </Alert>

          <Alert variant='default'>
            <AlertTitle>정보</AlertTitle>
            <AlertDescription>
              새로운 업데이트가 있습니다. 페이지를 새로고침하면 최신 버전이 적용됩니다.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </PageContainer>
  );
}
