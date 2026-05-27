import PageContainer from '@/components/layout/page-container';
import ViewSettingsForm from '@/modules/view-settings/components/view-settings-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '설정 - 뷰',
  description: '각 뷰의 로고 아이콘을 관리합니다.'
};

export default function SettingsViewsPage() {
  return (
    <PageContainer pageTitle='뷰 설정' pageDescription='각 뷰의 로고 아이콘을 관리합니다.'>
      <ViewSettingsForm />
    </PageContainer>
  );
}
