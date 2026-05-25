import PageContainer from '@/components/layout/page-container';
import type { Metadata } from 'next';
import { ChartDemos } from './chart-demos';

export const metadata: Metadata = {
  title: '차트',
  description: 'Recharts 기반 차트 UI 데모'
};

export default function ChartPage() {
  return (
    <PageContainer
      pageTitle='차트'
      pageDescription='Recharts 기반 차트 UI 데모입니다. Bar, Line, Area, Pie, Donut 차트 예제를 제공합니다.'
    >
      <ChartDemos />
    </PageContainer>
  );
}
