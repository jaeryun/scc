'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

function AnimatedProgress({ value, label }: { value: number; label: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => {
        if (prev >= value) {
          clearInterval(timer);
          return value;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium'>{label}</span>
        <span className='text-sm text-muted-foreground'>{current}%</span>
      </div>
      <Progress value={current} />
    </div>
  );
}

export function ProgressDemos() {
  return (
    <div className='flex flex-col gap-8'>
      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
          <CardDescription>
            작업 진행 상태를 시각적으로 표시하는 진행률 바입니다. 마운트 시 애니메이션으로
            채워집니다.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-6'>
          <AnimatedProgress value={25} label='데이터 동기화' />
          <AnimatedProgress value={50} label='백업 진행률' />
          <AnimatedProgress value={75} label='배포 진행률' />
          <AnimatedProgress value={100} label='완료' />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skeleton</CardTitle>
          <CardDescription>
            로딩 중 표시 예시입니다. 데이터가 로드되기 전 콘텐츠 레이아웃을 미리 보여줍니다.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-8'>
          <div className='rounded-lg border p-6'>
            <div className='flex flex-col gap-4'>
              <Skeleton className='h-5 w-32' />
              <Skeleton className='h-4 w-64' />
              <div className='mt-4 grid grid-cols-3 gap-4'>
                <div className='flex flex-col gap-2'>
                  <Skeleton className='h-8 w-16' />
                  <Skeleton className='h-3 w-12' />
                </div>
                <div className='flex flex-col gap-2'>
                  <Skeleton className='h-8 w-16' />
                  <Skeleton className='h-3 w-12' />
                </div>
                <div className='flex flex-col gap-2'>
                  <Skeleton className='h-8 w-16' />
                  <Skeleton className='h-3 w-12' />
                </div>
              </div>
            </div>
          </div>

          <div className='overflow-hidden rounded-lg border'>
            <div className='bg-muted/50 flex items-center gap-4 border-b px-4 py-3'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-24' />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center gap-4 border-b px-4 py-3 last:border-b-0'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-24' />
              </div>
            ))}
          </div>

          <div className='flex items-center gap-4'>
            <Skeleton className='h-12 w-12 rounded-full' />
            <div className='flex flex-col gap-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-3 w-48' />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spinner</CardTitle>
          <CardDescription>
            버튼과 함께 사용하는 로딩 스피너입니다. 작업 처리 중임을 표시합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap items-center gap-4'>
          <Button disabled>
            <Spinner className='size-4' />
            저장 중...
          </Button>
          <Button disabled variant='secondary'>
            <Spinner className='size-4' />
            데이터 불러오는 중...
          </Button>
          <Button disabled variant='outline'>
            <Spinner className='size-4' />
            처리 중...
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
