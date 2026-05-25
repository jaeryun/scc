import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { WorkspaceView } from '@/modules/workspaces/components/workspace-view';
import { WorkspaceSkeleton } from '@/modules/workspaces/components/workspace-skeleton';
import { workspacesInfoContent } from '@/config/infoconfig';

export const metadata = {
  title: 'Dashboard : 워크스페이스'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='워크스페이스'
      pageDescription='워크스페이스 관리'
      infoContent={workspacesInfoContent}
    >
      <Suspense fallback={<WorkspaceSkeleton />}>
        <WorkspaceView />
      </Suspense>
    </PageContainer>
  );
}
