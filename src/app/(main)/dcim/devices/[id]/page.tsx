import PageContainer from '@/components/layout/page-container';
import { DeviceDetail } from '@/modules/devices/components/device-detail';
import { deviceQueryOptions } from '@/modules/devices/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'DCIM - Device Detail',
  description: '장비 상세 정보'
};

export default async function DevicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(deviceQueryOptions(Number(id)));

  return (
    <PageContainer pageTitle='Device Detail'>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<div className='h-96 animate-pulse bg-muted rounded-lg' />}>
          <DeviceDetail id={Number(id)} />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
