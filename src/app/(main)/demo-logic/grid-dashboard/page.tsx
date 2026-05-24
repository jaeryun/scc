import PageContainer from '@/components/layout/page-container';
import { DashboardList } from '@/modules/demo-dashboard/components/dashboard-list';

export const metadata = {
  title: 'Dashboard: Grid Dashboard'
};

export default function GridDashboardListPage() {
  return (
    <PageContainer pageTitle='Grid Dashboard' pageDescription='폴더와 대시보드를 관리하세요'>
      <DashboardList />
    </PageContainer>
  );
}
