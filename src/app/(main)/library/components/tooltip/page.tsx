import PageContainer from '@/components/layout/page-container';
import { TooltipDemos } from './tooltip-demos';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '오버레이',
  description: 'Toast, Tooltip, Popover, HoverCard 컴포넌트 데모'
};

export default function TooltipPage() {
  return (
    <PageContainer
      pageTitle='오버레이'
      pageDescription='Toast, Tooltip, Popover, HoverCard 등 오버레이 UI 데모입니다.'
    >
      <TooltipDemos />
    </PageContainer>
  );
}
