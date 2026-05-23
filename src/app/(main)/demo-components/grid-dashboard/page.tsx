import PageContainer from '@/components/layout/page-container';
import { GridDashboardDemo } from '@/components/ui/grid-dashboard/grid-dashboard-demo';

export const metadata = {
  title: 'Dashboard: Grid Dashboard Demo'
};

export default function GridDashboardDemoPage() {
  return (
    <PageContainer
      pageTitle='Grid Dashboard Demo'
      pageDescription='12-column grid system using react-grid-layout'
    >
      <GridDashboardDemo />
    </PageContainer>
  );
}
