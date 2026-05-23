'use client';

import { useState, useCallback } from 'react';
import { GridLayout, type Layout } from 'react-grid-layout';
import { WidgetFrame } from '@/components/ui/grid-dashboard/widget-frame';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const INITIAL: Layout = [
  { i: 'a', x: 0, y: 0, w: 4, h: 3 },
  { i: 'b', x: 4, y: 0, w: 4, h: 2 },
  { i: 'c', x: 8, y: 0, w: 4, h: 2 },
  { i: 'd', x: 4, y: 2, w: 8, h: 2 },
  { i: 'e', x: 0, y: 3, w: 12, h: 2 }
];

export function GridDashboardDemo() {
  const [layout, setLayout] = useState(INITIAL);

  const handleChange = useCallback((l: Layout) => setLayout([...l]), []);

  return (
    <GridLayout
      className='layout'
      width={1200}
      gridConfig={{ cols: 12, rowHeight: 80, margin: [8, 8] }}
      dragConfig={{ enabled: true }}
      resizeConfig={{ enabled: true }}
      layout={layout}
      onLayoutChange={handleChange}
    >
      <div key='a'>
        <WidgetFrame title='Widget A (4x3)'>
          <p className='text-muted-foreground text-sm'>4 columns, 3 rows.</p>
        </WidgetFrame>
      </div>
      <div key='b'>
        <WidgetFrame title='Widget B (4x2)'>
          <p className='text-muted-foreground text-sm'>4 columns, 2 rows.</p>
        </WidgetFrame>
      </div>
      <div key='c'>
        <WidgetFrame title='Widget C (4x2)'>
          <p className='text-muted-foreground text-sm'>4 columns, 2 rows.</p>
        </WidgetFrame>
      </div>
      <div key='d'>
        <WidgetFrame title='Widget D (8x2)'>
          <p className='text-muted-foreground text-sm'>8 columns, 2 rows.</p>
        </WidgetFrame>
      </div>
      <div key='e'>
        <WidgetFrame title='Widget E (12x2)'>
          <p className='text-muted-foreground text-sm'>All 12 columns.</p>
        </WidgetFrame>
      </div>
    </GridLayout>
  );
}
