import PageContainer from '@/components/layout/page-container'
import { GridCanvas } from '@/components/ui/grid-dashboard/grid-canvas'
import { GridItem } from '@/components/ui/grid-dashboard/grid-item'
import { WidgetFrame } from '@/components/ui/grid-dashboard/widget-frame'

export const metadata = {
  title: 'Dashboard: Grid Dashboard Demo',
}

export default function GridDashboardDemoPage() {
  return (
    <PageContainer pageTitle="Grid Dashboard Demo" pageDescription="12-column grid system demo">
      <GridCanvas columns={12} rowHeight={80} gap={8} className="min-h-[600px]">
        <GridItem x={0} y={0} w={4} h={3}>
          <WidgetFrame title="Widget A (4x3)">
            <p className="text-muted-foreground text-sm">This widget spans 4 columns and 3 rows.</p>
          </WidgetFrame>
        </GridItem>
        <GridItem x={4} y={0} w={4} h={2}>
          <WidgetFrame title="Widget B (4x2)">
            <p className="text-muted-foreground text-sm">This widget spans 4 columns and 2 rows.</p>
          </WidgetFrame>
        </GridItem>
        <GridItem x={8} y={0} w={4} h={2}>
          <WidgetFrame title="Widget C (4x2)">
            <p className="text-muted-foreground text-sm">This widget spans 4 columns and 2 rows.</p>
          </WidgetFrame>
        </GridItem>
        <GridItem x={4} y={2} w={8} h={2}>
          <WidgetFrame title="Widget D (8x2)">
            <p className="text-muted-foreground text-sm">This widget spans 8 columns and 2 rows.</p>
          </WidgetFrame>
        </GridItem>
        <GridItem x={0} y={3} w={12} h={2}>
          <WidgetFrame title="Widget E (12x2) - Full Width">
            <p className="text-muted-foreground text-sm">This widget spans all 12 columns.</p>
          </WidgetFrame>
        </GridItem>
      </GridCanvas>
    </PageContainer>
  )
}
