'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import { Button } from '@/components/ui/button';
import { WidgetFrame } from '@/components/ui/grid-dashboard/widget-frame';
import { Icons } from '@/components/icons';
import { dashboardDetailQueryOptions } from '../api/queries';
import { updateDashboardMutation } from '../api/mutations';
import type { DashboardItem } from '../api/types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

function renderWidgetContent(item: DashboardItem) {
  return (
    <p className='text-muted-foreground text-sm'>
      {item.type} ({item.w}×{item.h})
    </p>
  );
}

export function DashboardCanvas({ dashboardId }: { dashboardId: string }) {
  const router = useRouter();
  const { containerRef, width } = useContainerWidth();
  const { data: dashboard, isLoading } = useQuery(dashboardDetailQueryOptions(dashboardId));
  const [isEditing, setIsEditing] = useState(false);
  const updateMutation = useMutation(updateDashboardMutation);

  const layout = (dashboard?.items ?? []).map((item) => ({
    i: item.id,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h
  }));

  const handleLayoutChange = useCallback(
    (newLayout: { i: string; x: number; y: number; w: number; h: number }[]) => {
      if (!dashboard) return;
      const updatedItems: DashboardItem[] = newLayout
        .map((l) => {
          const existing = dashboard.items.find((item) => item.id === l.i);
          if (!existing) return null;
          return { ...existing, x: l.x, y: l.y, w: l.w, h: l.h };
        })
        .filter(Boolean) as DashboardItem[];

      updateMutation.mutate({
        id: dashboardId,
        data: { items: updatedItems }
      });
    },
    [dashboard, dashboardId, updateMutation]
  );

  const handleRemoveWidget = useCallback(
    (itemId: string) => {
      if (!dashboard) return;
      updateMutation.mutate({
        id: dashboardId,
        data: {
          items: dashboard.items.filter((item) => item.id !== itemId)
        }
      });
    },
    [dashboard, dashboardId, updateMutation]
  );

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-muted-foreground'>Loading dashboard...</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-destructive'>Dashboard not found.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>{dashboard.name}</h2>
          {dashboard.description && (
            <p className='text-muted-foreground'>{dashboard.description}</p>
          )}
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Done' : 'Edit'}
          </Button>
          <Button variant='outline' onClick={() => router.back()}>
            <Icons.arrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
        </div>
      </div>

      {width > 0 && (
        <ResponsiveGridLayout
          className='layout'
          width={width}
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 12, md: 6, sm: 4 }}
          rowHeight={80}
          dragConfig={{ enabled: isEditing }}
          resizeConfig={{ enabled: isEditing }}
          onLayoutChange={(newLayout) => {
            if (isEditing) handleLayoutChange([...newLayout]);
          }}
        >
          {dashboard.items.map((item) => (
            <div key={item.id}>
              <WidgetFrame
                title={item.type}
                isEditing={isEditing}
                onRemove={() => handleRemoveWidget(item.id)}
              >
                {renderWidgetContent(item)}
              </WidgetFrame>
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
