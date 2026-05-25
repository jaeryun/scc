import PageContainer from '@/components/layout/page-container';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 Not Found',
  description: '페이지를 찾을 수 없음 — 정적 페이지 UI 데모'
};

export default function NotFoundDemoPage() {
  return (
    <PageContainer
      pageTitle='404 Not Found'
      pageDescription='페이지를 찾을 수 없을 때 표시되는 정적 UI 데모입니다.'
    >
      <div className='flex flex-col items-center justify-center py-20'>
        <Card className='w-full max-w-lg border-dashed p-12 text-center'>
          <span className='from-foreground bg-gradient-to-b to-transparent bg-clip-text text-[10rem] leading-none font-extrabold text-transparent select-none'>
            404
          </span>
          <h2 className='-mt-4 mb-2 text-2xl font-bold'>페이지를 찾을 수 없습니다</h2>
          <p className='mb-8 text-muted-foreground'>
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </p>
          <div className='flex justify-center gap-3'>
            <Button variant='default' size='lg'>
              홈으로 이동
            </Button>
            <Button variant='outline' size='lg'>
              이전 페이지
            </Button>
          </div>
        </Card>

        <div className='mt-12 w-full max-w-lg space-y-4'>
          <h3 className='font-semibold text-lg'>Variation</h3>

          <Card className='border-dashed p-10 text-center'>
            <div className='mb-4 flex justify-center'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-muted'>
                <svg
                  className='h-10 w-10 text-muted-foreground'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth={1.5}
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
                  />
                </svg>
              </div>
            </div>
            <h3 className='mb-1 text-lg font-semibold'>검색 결과 없음</h3>
            <p className='mb-6 text-sm text-muted-foreground'>
              &quot;asdf1234&quot;에 대한 검색 결과를 찾을 수 없습니다.
            </p>
            <Button variant='outline'>검색 초기화</Button>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
