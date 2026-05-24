import type { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import { DashboardCanvas } from '@/modules/demo-dashboard/components/dashboard-canvas';
import { getDemoDashboardById } from '@/modules/demo-dashboard/api/service';

export async function generateMetadata(props: {
  params: Promise<{ dashboardId: string }>;
}): Promise<Metadata> {
  const { dashboardId } = await props.params;
  const dashboard = await getDemoDashboardById(dashboardId);
  return {
    title: dashboard ? `Dashboard: ${dashboard.title}` : 'Dashboard: Not Found'
  };
}

export default async function GridDashboardCanvasPage(props: {
  params: Promise<{ dashboardId: string }>;
}) {
  const { dashboardId } = await props.params;
  const dashboard = await getDemoDashboardById(dashboardId);

  return (
    <PageContainer
      pageTitle={dashboard?.title ?? 'Dashboard Canvas'}
      pageDescription={dashboard?.description ?? '대시보드를 보고 편집하세요'}
    >
      <DashboardCanvas dashboardId={dashboardId} />
    </PageContainer>
  );
}
