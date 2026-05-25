import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { exclusiveInfoContent } from '@/config/infoconfig';
import { ExclusiveView } from '@/modules/exclusive/components/exclusive-view';
import { ExclusiveSkeleton } from '@/modules/exclusive/components/exclusive-skeleton';

export const metadata = {
  title: 'Dashboard : 특별'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='특별'
      pageDescription='프리미엄 전용 기능'
      infoContent={exclusiveInfoContent}
    >
      <Suspense fallback={<ExclusiveSkeleton />}>
        <ExclusiveView />
      </Suspense>
    </PageContainer>
  );
}
