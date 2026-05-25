import PageContainer from '@/components/layout/page-container';
import { TableDemos } from './table-demos';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '테이블',
  description: '데이터 테이블 — 정렬, 선택, 페이지네이션'
};

export default function TablePage() {
  return (
    <PageContainer
      pageTitle='테이블'
      pageDescription='데이터 테이블 — 정렬, 선택 기능을 갖춘 shadcn/ui Table 컴포넌트 데모입니다.'
    >
      <TableDemos />
    </PageContainer>
  );
}
