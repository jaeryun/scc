import PageContainer from '@/components/layout/page-container';
import { DashboardList } from '@/modules/san-dashboard/components/dashboard-list';

export const metadata = {
  title: 'Dashboard: SAN'
};

export default function SanDashboardPage() {
  return (
    <PageContainer pageTitle='(데모) SAN' pageDescription='SAN switch management dashboards'>
      <DashboardList />
    </PageContainer>
  );
}
