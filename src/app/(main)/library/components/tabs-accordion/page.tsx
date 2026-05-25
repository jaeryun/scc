import PageContainer from '@/components/layout/page-container';
import { TabsAccordionDemos } from './tabs-accordion-demos';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tabs & Accordion',
  description: 'Tabs, Accordion, Collapsible 등 콘텐츠 컨테이너 데모'
};

export default function TabsAccordionPage() {
  return (
    <PageContainer
      pageTitle='Tabs & Accordion'
      pageDescription='Tabs, Accordion, Collapsible 등 콘텐츠 컨테이너 데모입니다.'
    >
      <TabsAccordionDemos />
    </PageContainer>
  );
}
