import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { DashboardList } from '@/modules/dashboard/components/dashboard-list';
import { dashboardsQueryOptions, foldersQueryOptions } from '@/modules/dashboard/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Library'
};

export default function DashboardListPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(dashboardsQueryOptions(null));
  void queryClient.prefetchQuery(foldersQueryOptions());

  return (
    <PageContainer
      pageTitle='Dashboard'
      pageDescription='동적으로 UI 배치가 가능한 대시보드를 통해 원하는 화면을 꾸며보세요. (해당 UI는 Grafana를 모티브로 개발되었습니다.)'
      pageHeaderAction={
        <Badge variant='secondary' className='text-xs font-normal'>
          Demo
        </Badge>
      }
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<div className='h-32 animate-pulse bg-muted rounded-lg' />}>
          <DashboardList />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
