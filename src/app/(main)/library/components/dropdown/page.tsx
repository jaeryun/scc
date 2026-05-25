import PageContainer from '@/components/layout/page-container';
import { DropdownDemos } from './dropdown-demos';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '드롭다운 & 컨텍스트',
  description: 'DropdownMenu, ContextMenu, Menubar 등 메뉴 UI 데모'
};

export default function DropdownPage() {
  return (
    <PageContainer
      pageTitle='드롭다운 & 컨텍스트'
      pageDescription='DropdownMenu, ContextMenu, Menubar 등 shadcn/ui 메뉴 컴포넌트 데모입니다.'
    >
      <DropdownDemos />
    </PageContainer>
  );
}
