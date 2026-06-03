import NotificationsPage from '@/modules/demo/notifications/components/notifications-page';
import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard: 알림'
};

export default function Page() {
  return (
    <PageContainer pageTitle='알림' pageDescription='최근 알림 및 업데이트'>
      <NotificationsPage />
    </PageContainer>
  );
}
