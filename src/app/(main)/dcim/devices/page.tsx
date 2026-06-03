import PageContainer from '@/components/layout/page-container';
import { DeviceTable } from '@/modules/devices/components/device-table';
import { devicesQueryOptions } from '@/modules/devices/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'DCIM - Devices',
  description: '서버, 스위치, 스토리지 등 모든 물리 장비 인벤토리'
};

export default function DevicesPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(devicesQueryOptions());

  return (
    <PageContainer pageTitle='Devices' pageDescription='Data Center Infrastructure Management'>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<div className='h-96 animate-pulse bg-muted rounded-lg' />}>
          <DeviceTable />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
