import PageContainer from '@/components/layout/page-container';
import { IpamDashboardPage } from '@/features/ipam/components/dashboard-page';

export default function DemoIpamPage() {
  return (
    <PageContainer
      pageTitle='IPAM 대시보드'
      pageDescription='전체 서브넷 및 IP 현황을 모니터링합니다.'
    >
      <IpamDashboardPage />
    </PageContainer>
  );
}
