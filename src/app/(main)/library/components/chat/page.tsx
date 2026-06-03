import ChatViewPage from '@/modules/chat/components/chat-view-page';
import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard: 채팅'
};

export default function Page() {
  return (
    <PageContainer pageTitle='채팅' pageDescription='실시간 팀 채팅'>
      <ChatViewPage />
    </PageContainer>
  );
}
