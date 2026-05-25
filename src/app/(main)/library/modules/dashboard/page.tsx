import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { DashboardList } from '@/modules/dashboard/components/dashboard-list';

export const metadata = {
  title: 'Dashboard: Library'
};

export default function DashboardListPage() {
  return (
    <PageContainer
      pageTitle='Dashboard'
      pageDescription='폴더와 대시보드를 관리하세요. 데이터는 서버 재시작 시 초기화됩니다.'
      pageHeaderAction={
        <Badge variant='secondary' className='text-xs font-normal'>
          Demo
        </Badge>
      }
    >
      <DashboardList />
    </PageContainer>
  );
}
