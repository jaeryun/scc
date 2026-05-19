import PageContainer from '@/components/layout/page-container';
import AdvancedFormPatterns from '@/modules/forms/components/advanced-form-patterns';

export const metadata = {
  title: 'Dashboard: 고급 폼 패턴'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='고급 폼 패턴'
      pageDescription='연결 필드, 비동기 검증, 동적 행, 중첩 객체, 교차 필드 검증, 폼 레벨 오류 처리 등의 패턴을 보여줍니다.'
    >
      <AdvancedFormPatterns />
    </PageContainer>
  );
}
