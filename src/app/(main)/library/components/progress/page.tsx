import PageContainer from '@/components/layout/page-container';
import { ProgressDemos } from './progress-demos';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '진행률 & 스켈레톤',
  description: 'Progress, Skeleton, Spinner 등 로딩 상태 UI 컴포넌트 데모'
};

export default function ProgressPage() {
  return (
    <PageContainer
      pageTitle='진행률 & 스켈레톤'
      pageDescription='Progress, Skeleton, Spinner 등 로딩 상태를 표현하는 UI 컴포넌트 데모입니다.'
    >
      <ProgressDemos />
    </PageContainer>
  );
}
