import type { InfobarContent } from '@/components/ui/infobar';

export const reactQueryInfoContent: InfobarContent = {
  title: 'React Query 패턴',
  sections: [
    {
      title: '서버 프리페치',
      description:
        'getQueryClient().prefetchQuery()를 사용하여 서버에서 데이터를 미리 가져옵니다. 직렬화된 상태를 HydrationBoundary에 전달하므로 클라이언트는 캐시된 데이터로 시작하여 첫 로딩 시 스피너가 표시되지 않습니다.',
      links: [
        {
          title: 'TanStack Query SSR 문서',
          url: 'https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr'
        }
      ]
    },
    {
      title: '쿼리 옵션',
      description:
        '쿼리 키와 페치 함수를 공유 queryOptions() 객체에 정의합니다. 서버 프리페치와 클라이언트 훅에서 재사용되어 동기화를 유지합니다.',
      links: [
        {
          title: 'queryOptions API',
          url: 'https://tanstack.com/query/latest/docs/framework/react/reference/queryOptions'
        }
      ]
    },
    {
      title: '서스펜스 쿼리',
      description:
        '클라이언트에서 useSuspenseQuery()를 사용하여 React Suspense와 통합합니다. 서버 프리페치와 결합하면 데이터가 즉시 제공되며, Suspense는 캐시가 만료된 후속 탐색에서만 폴백을 표시합니다.',
      links: []
    },
    {
      title: '낙관적 업데이트',
      description:
        '뮤테이션은 onMutate를 사용하여 요청이 완료되기 전에 캐시를 낙관적으로 업데이트합니다. 오류 발생 시 이전 상태로 롤백됩니다. 완료 시 쿼리를 무효화하여 최신 데이터를 다시 가져옵니다.',
      links: [
        {
          title: '낙관적 업데이트 가이드',
          url: 'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates'
        }
      ]
    }
  ]
};
