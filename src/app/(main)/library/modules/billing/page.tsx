import PageContainer from '@/components/layout/page-container';
import { billingInfoContent } from '@/config/infoconfig';
import BillingView from '@/modules/billing/components/billing-view';
import BillingSkeleton from '@/modules/billing/components/billing-skeleton';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : 결제'
};

export default function Page() {
  return (
    <PageContainer pageTitle='결제' pageDescription='구독 관리' infoContent={billingInfoContent}>
      <Suspense fallback={<BillingSkeleton />}>
        <BillingView />
      </Suspense>
    </PageContainer>
  );
}
