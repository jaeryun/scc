import ProfileViewPage from '@/modules/demo/profile/components/profile-view-page';
import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard : Profile'
};

export default async function Page() {
  return (
    <PageContainer pageTitle='프로필' pageDescription='내 프로필 정보 관리'>
      <ProfileViewPage />
    </PageContainer>
  );
}
