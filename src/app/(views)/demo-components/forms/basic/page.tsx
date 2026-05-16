import PageContainer from '@/components/layout/page-container';
import DemoForm from '@/components/forms/demo-form';

export const metadata = {
  title: 'Dashboard: 기본 폼'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='기본 폼'
      pageDescription='모든 필드 유형을 포함한 종합적인 폼 데모입니다.'
    >
      <DemoForm />
    </PageContainer>
  );
}
