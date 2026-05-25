import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { PokemonInfo } from '@/modules/react-query-demo/components/pokemon-info';
import { PokemonSkeleton } from '@/modules/react-query-demo/components/pokemon-skeleton';
import { reactQueryInfoContent } from '@/modules/react-query-demo/info-content';

export const metadata = {
  title: 'React Query'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='React Query'
      pageDescription='데이터 페칭 패턴 데모'
      infoContent={reactQueryInfoContent}
    >
      <Suspense fallback={<PokemonSkeleton />}>
        <PokemonInfo />
      </Suspense>
    </PageContainer>
  );
}
