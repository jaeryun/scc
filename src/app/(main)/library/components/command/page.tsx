import PageContainer from '@/components/layout/page-container';
import { CommandDemos } from './command-demos';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '커맨드 팔레트',
  description: 'Command, CommandDialog 등 커맨드 팔레트 UI 데모'
};

export default function CommandPage() {
  return (
    <PageContainer
      pageTitle='커맨드 팔레트'
      pageDescription='Command, CommandDialog 등 커맨드 팔레트 UI 컴포넌트 데모입니다.'
    >
      <CommandDemos />
    </PageContainer>
  );
}
