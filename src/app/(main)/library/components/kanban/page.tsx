import KanbanViewPage from '@/modules/kanban/components/kanban-view-page';
import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard: 칸반 보드'
};

export default function Page() {
  return (
    <PageContainer pageTitle='칸반 보드' pageDescription='작업 항목을 관리하는 칸반 보드'>
      <KanbanViewPage />
    </PageContainer>
  );
}
