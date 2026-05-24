'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { GridLayout, useContainerWidth } from 'react-grid-layout';
import { verticalCompactor } from 'react-grid-layout/core';
import type { LayoutItem, Layout } from 'react-grid-layout';
import { Button } from '@/components/ui/button';
import { WidgetFrame } from '@/components/ui/grid-dashboard/widget-frame';
import { Icons } from '@/components/icons';
import { demoDashboardDetailQueryOptions } from '../api/queries';
import { updateDemoDashboardMutation, deleteDemoDashboardMutation } from '../api/mutations';
import { renderPanel } from './widgets/panel-registry';
import { WidgetAddDialog } from './widget-add-dialog';
import type { Panel, PanelType } from '../api/types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

function panelsToLayout(panels: Panel[]): LayoutItem[] {
  return panels.map((p) => ({
    i: p.id,
    x: p.gridPos.x,
    y: p.gridPos.y,
    w: p.gridPos.w,
    h: p.gridPos.h
  }));
}

export function DashboardCanvas({ dashboardId }: { dashboardId: string }) {
  const router = useRouter();
  const { width, containerRef, mounted } = useContainerWidth();
  const [isEditing, setIsEditing] = useState(false);

  const { data: dashboard, isLoading } = useQuery(demoDashboardDetailQueryOptions(dashboardId));

  const updateMutation = useMutation({
    ...updateDemoDashboardMutation
  });

  const deleteMutation = useMutation({
    ...deleteDemoDashboardMutation
  });

  const panels = dashboard?.panels ?? [];

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      if (!isEditing || !dashboard) return;
      const updatedPanels: Panel[] = newLayout
        .map((l) => {
          const panel = panels.find((p) => p.id === l.i);
          if (!panel) return null;
          return {
            ...panel,
            gridPos: { x: l.x, y: l.y, w: l.w, h: l.h }
          };
        })
        .filter(Boolean) as Panel[];

      updateMutation.mutate({
        id: dashboardId,
        data: { panels: updatedPanels }
      });
    },
    [isEditing, dashboard, panels, dashboardId, updateMutation]
  );

  const addPanel = useCallback(
    (panelType: PanelType) => {
      const newPanel: Panel = {
        id: `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        type: panelType.type,
        title: panelType.label,
        gridPos: {
          x: 0,
          y: Infinity,
          w: panelType.defaultGridPos.w,
          h: panelType.defaultGridPos.h
        },
        options: { ...panelType.defaultOptions }
      };
      updateMutation.mutate({
        id: dashboardId,
        data: { panels: [...panels, newPanel] }
      });
    },
    [panels, dashboardId, updateMutation]
  );

  const removePanel = useCallback(
    (panelId: string) => {
      updateMutation.mutate({
        id: dashboardId,
        data: { panels: panels.filter((p) => p.id !== panelId) }
      });
    },
    [panels, dashboardId, updateMutation]
  );

  const updatePanelOptions = useCallback(
    (panelId: string, newOptions: Record<string, unknown>) => {
      updateMutation.mutate({
        id: dashboardId,
        data: {
          panels: panels.map((p) => (p.id === panelId ? { ...p, options: newOptions } : p))
        }
      });
    },
    [panels, dashboardId, updateMutation]
  );

  const handleDelete = useCallback(async () => {
    if (!confirm('이 대시보드를 삭제하시겠습니까?')) return;
    await deleteMutation.mutateAsync(dashboardId);
    router.push('/demo-components/grid-dashboard');
  }, [dashboardId, deleteMutation, router]);

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-muted-foreground'>대시보드 불러오는 중...</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-destructive'>대시보드를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const isEmpty = panels.length === 0;

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-end gap-2'>
        <Button
          variant={isEditing ? 'default' : 'outline'}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? '완료' : '편집'}
        </Button>
        {isEditing && <WidgetAddDialog onAdd={addPanel} />}
        <Button variant='outline' onClick={handleDelete}>
          <Icons.trash className='mr-2 h-4 w-4' />
          삭제
        </Button>
        <Button variant='outline' onClick={() => router.back()}>
          <Icons.arrowLeft className='mr-2 h-4 w-4' />
          뒤로
        </Button>
      </div>

      {isEmpty && !isEditing && (
        <div className='flex h-64 items-center justify-center rounded-lg border'>
          <p className='text-muted-foreground text-sm'>
            <strong>편집</strong> 버튼을 눌러 위젯을 추가하고 대시보드를 구성하세요.
          </p>
        </div>
      )}

      {isEmpty && isEditing && (
        <div className='flex h-64 items-center justify-center rounded-lg border'>
          <p className='text-muted-foreground text-sm'>
            <strong>위젯 추가</strong> 버튼으로 위젯을 추가한 후 드래그하여 배치하고 크기를
            조절하세요.
          </p>
        </div>
      )}

      <div ref={containerRef}>
        {mounted && !isEmpty && (
          <GridLayout
            layout={panelsToLayout(panels)}
            width={width}
            gridConfig={{ cols: 12, rowHeight: 80, margin: [8, 8] }}
            dragConfig={{ enabled: isEditing }}
            resizeConfig={{ enabled: isEditing }}
            compactor={verticalCompactor}
            onLayoutChange={handleLayoutChange}
          >
            {panels.map((panel) => (
              <div key={panel.id}>
                <WidgetFrame
                  title={panel.title}
                  isEditing={isEditing}
                  onRemove={() => removePanel(panel.id)}
                >
                  {renderPanel(panel, isEditing, (newOptions) =>
                    updatePanelOptions(panel.id, newOptions)
                  )}
                </WidgetFrame>
              </div>
            ))}
          </GridLayout>
        )}
      </div>
    </div>
  );
}
