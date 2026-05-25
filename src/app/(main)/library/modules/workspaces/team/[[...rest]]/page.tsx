import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { TeamView } from '@/modules/workspaces/components/team-view';
import { TeamSkeleton } from '@/modules/workspaces/components/team-skeleton';
import { teamInfoContent } from '@/config/infoconfig';

export const metadata = {
  title: 'Dashboard : 팀 관리'
};

export default async function Page({ params }: { params: Promise<{ rest?: string[] }> }) {
  const { rest } = await params;
  const workspaceId = rest?.[0] ?? '';

  return (
    <PageContainer
      pageTitle='팀 관리'
      pageDescription='팀 구성원 관리'
      infoContent={teamInfoContent}
    >
      {workspaceId ? (
        <Suspense fallback={<TeamSkeleton />}>
          <TeamView workspaceId={workspaceId} />
        </Suspense>
      ) : (
        <div className='rounded-lg border border-dashed p-8 text-center'>
          <p className='text-muted-foreground'>워크스페이스를 선택해주세요.</p>
        </div>
      )}
    </PageContainer>
  );
}
