import PageContainer from '@/components/layout/page-container';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '설정 - 알림',
  description: '알림 설정을 관리합니다.'
};

export default function SettingsNotificationsPage() {
  return (
    <PageContainer pageTitle='알림 설정' pageDescription='알림 설정을 관리합니다.'>
      <div className='text-muted-foreground flex flex-1 items-center justify-center rounded-lg border border-dashed p-8'>
        <p>준비 중입니다.</p>
      </div>
    </PageContainer>
  );
}
