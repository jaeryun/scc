import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { WorkspaceView } from '@/modules/workspaces/components/workspace-view';
import { WorkspaceSkeleton } from '@/modules/workspaces/components/workspace-skeleton';
import { workspacesInfoContent } from '@/config/infoconfig';
import { workspacesQueryOptions } from '@/modules/workspaces/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export const metadata = {
  title: 'Dashboard : 워크스페이스'
};

export default function Page() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(workspacesQueryOptions());

  return (
    <PageContainer
      pageTitle='워크스페이스'
      pageDescription='워크스페이스 관리'
      infoContent={workspacesInfoContent}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<WorkspaceSkeleton />}>
          <WorkspaceView />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
