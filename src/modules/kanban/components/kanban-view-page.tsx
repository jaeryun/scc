import PageContainer from '@/components/layout/page-container';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import NewTaskDialog from '@/components/kanban/new-task-dialog';

export default function KanbanViewPage() {
  return (
    <PageContainer
      pageTitle='칸반 보드'
      pageDescription='드래그 앤 드롭으로 작업 관리'
      pageHeaderAction={<NewTaskDialog />}
    >
      <KanbanBoard />
    </PageContainer>
  );
}
