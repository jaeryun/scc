import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { TeamView } from '@/modules/demo/workspaces/components/team-view';
import { TeamSkeleton } from '@/modules/demo/workspaces/components/team-skeleton';
import { teamInfoContent } from '@/config/infoconfig';
import {
  workspaceByIdOptions,
  teamMembersQueryOptions
} from '@/modules/demo/workspaces/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export const metadata = {
  title: 'Dashboard : 팀 관리'
};

export default async function Page({ params }: { params: Promise<{ rest?: string[] }> }) {
  const { rest } = await params;
  const workspaceId = rest?.[0] ?? '';

  const queryClient = getQueryClient();
  if (workspaceId) {
    void queryClient.prefetchQuery(workspaceByIdOptions(workspaceId));
    void queryClient.prefetchQuery(teamMembersQueryOptions(workspaceId));
  }

  return (
    <PageContainer
      pageTitle='팀 관리'
      pageDescription='팀 구성원 관리'
      infoContent={teamInfoContent}
    >
      {workspaceId ? (
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<TeamSkeleton />}>
            <TeamView workspaceId={workspaceId} />
          </Suspense>
        </HydrationBoundary>
      ) : (
        <div className='rounded-lg border border-dashed p-8 text-center'>
          <p className='text-muted-foreground'>워크스페이스를 선택해주세요.</p>
        </div>
      )}
    </PageContainer>
  );
}
