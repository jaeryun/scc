import PageContainer from '@/components/layout/page-container';
import { DashboardCanvas } from '@/modules/san-dashboard/components/dashboard-canvas';

export const metadata = {
  title: 'Dashboard: SAN Canvas'
};

type PageProps = {
  params: Promise<{ dashboardId: string }>;
};

export default async function DashboardDetailPage({ params }: PageProps) {
  const { dashboardId } = await params;
  return (
    <PageContainer pageTitle='(데모) SAN' pageDescription='Drag to reposition, resize from corner'>
      <DashboardCanvas dashboardId={dashboardId} />
    </PageContainer>
  );
}
