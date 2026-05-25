'use client';

import type { ReactNode } from 'react';
import type { Panel, PanelType } from '../../api/types';
import { PanelText } from './panel-text';
import { PanelStat } from './panel-stat';
import { PanelChart } from './panel-chart';
import { PanelInfoCard } from './panel-info-card';
import { PanelList } from './panel-list';

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
  },
  {
    type: 'list',
    label: '목록',
    description: '열 기반 데이터 목록 표시',
    icon: 'listTree',
    defaultGridPos: { w: 4, h: 4 },
    defaultOptions: {
      title: 'Recent Sales',
      columns: [
        { key: 'name', label: '이름', type: 'avatar' },
        { key: 'email', label: '이메일', type: 'text' },
        { key: 'amount', label: '금액', type: 'amount' }
      ],
      rows: [
        { name: 'Olivia Martin', email: 'olivia@example.com', amount: '+₩1,999.00' },
        { name: 'Jackson Lee', email: 'jackson@example.com', amount: '+₩39.00' },
        { name: 'Isabella Nguyen', email: 'isabella@example.com', amount: '+₩299.00' },
        { name: 'William Kim', email: 'william@example.com', amount: '+₩99.00' },
        { name: 'Sofia Davis', email: 'sofia@example.com', amount: '+₩39.00' }
      ]
    }
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
    case 'list':
      return (
        <PanelList
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
