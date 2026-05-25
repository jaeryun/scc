'use client';

import type { ReactNode } from 'react';
import type { Panel, PanelType } from '../../api/types';
import { PanelText } from './panel-text';
import { PanelStat } from './panel-stat';
import { PanelChart } from './panel-chart';
import { PanelInfoCard } from './panel-info-card';

export const PANEL_TYPES: PanelType[] = [
  {
    type: 'text',
    label: '텍스트',
    description: '편집 가능한 텍스트 메모',
    icon: 'fileText',
    defaultGridPos: { w: 3, h: 3 },
    defaultOptions: { content: '' }
  },
  {
    type: 'stat',
    label: '통계',
    description: '값, 트렌드, 설명이 있는 통계 카드',
    icon: 'trendingUp',
    defaultGridPos: { w: 3, h: 3 },
    defaultOptions: { value: '0', unit: '' }
  },
  {
    type: 'chart',
    label: '차트',
    description: '막대/영역/파이 차트',
    icon: 'barChart',
    defaultGridPos: { w: 4, h: 3 },
    defaultOptions: { chartType: 'bar' }
  },
  {
    type: 'info-card',
    label: '정보 카드',
    description: '상태, 색상, 테두리가 있는 카드',
    icon: 'info',
    defaultGridPos: { w: 3, h: 3 },
    defaultOptions: { description: '', status: 'active', color: 'blue', showBorder: true }
  }
];

export function getPanelType(type: string): PanelType | undefined {
  return PANEL_TYPES.find((pt) => pt.type === type);
}

export function searchPanelTypes(query: string): PanelType[] {
  const q = query.toLowerCase();
  return PANEL_TYPES.filter(
    (pt) => pt.label.toLowerCase().includes(q) || pt.description.toLowerCase().includes(q)
  );
}

export function renderPanel(
  panel: Panel,
  isEditing: boolean,
  onOptionsChange: (options: Record<string, unknown>) => void
): ReactNode {
  switch (panel.type) {
    case 'text':
      return (
        <PanelText
          options={panel.options}
          isEditing={isEditing}
          onOptionsChange={onOptionsChange}
        />
      );
    case 'stat':
      return (
        <PanelStat
          options={panel.options}
          isEditing={isEditing}
          onOptionsChange={onOptionsChange}
        />
      );
    case 'chart':
      return (
        <PanelChart
          options={panel.options}
          isEditing={isEditing}
          onOptionsChange={onOptionsChange}
        />
      );
    case 'info-card':
      return (
        <PanelInfoCard
          options={panel.options}
          isEditing={isEditing}
          onOptionsChange={onOptionsChange}
        />
      );
    default:
      return (
        <div className='flex items-center justify-center h-full text-muted-foreground text-sm'>
          알 수 없는 위젯 타입: {panel.type}
        </div>
      );
  }
}
