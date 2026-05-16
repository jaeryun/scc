import PageContainer from '@/components/layout/page-container';
import FormsShowcasePage from '@/features/forms/components/forms-showcase-page';

export const metadata = {
  title: 'Dashboard: 다단계 폼'
};

export default function Page() {
  return (
    <PageContainer pageTitle='다단계 폼' pageDescription='다단계 마법사 폼 패턴입니다.'>
      <FormsShowcasePage />
    </PageContainer>
  );
}
