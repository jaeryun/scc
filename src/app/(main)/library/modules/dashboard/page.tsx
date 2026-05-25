import PageContainer from '@/components/layout/page-container';
import { DashboardList } from '@/modules/dashboard/components/dashboard-list';

export const metadata = {
  title: 'Dashboard'
};

export default function DashboardListPage() {
  return (
    <PageContainer pageTitle='Grid Dashboard' pageDescription='폴더와 대시보드를 관리하세요'>
      <DashboardList />
    </PageContainer>
  );
}
