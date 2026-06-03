import PageContainer from '@/components/layout/page-container';
import { billingInfoContent } from '@/config/infoconfig';
import BillingView from '@/modules/demo/billing/components/billing-view';
import BillingSkeleton from '@/modules/demo/billing/components/billing-skeleton';
import { Suspense } from 'react';
import {
  plansQueryOptions,
  subscriptionQueryOptions,
  invoicesQueryOptions
} from '@/modules/demo/billing/api/queries';
import { getQueryClient } from '@/lib/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export const metadata = {
  title: 'Dashboard : 결제'
};

export default function Page() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(plansQueryOptions());
  void queryClient.prefetchQuery(subscriptionQueryOptions());
  void queryClient.prefetchQuery(invoicesQueryOptions());

  return (
    <PageContainer pageTitle='결제' pageDescription='구독 관리' infoContent={billingInfoContent}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<BillingSkeleton />}>
          <BillingView />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
