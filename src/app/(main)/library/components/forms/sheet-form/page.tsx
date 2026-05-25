import PageContainer from '@/components/layout/page-container';
import SheetFormDemo from '@/modules/forms/components/sheet-form-demo';

export const metadata = {
  title: 'Dashboard: 시트 폼'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='시트 및 다이얼로그 폼'
      pageDescription='시트와 다이얼로그 낸부에 외부 제출 버튼을 사용하는 폼 패턴입니다.'
    >
      <SheetFormDemo />
    </PageContainer>
  );
}
