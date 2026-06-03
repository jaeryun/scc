import IconsViewPage from '@/modules/elements/components/icons-view-page';
import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard : 아이콘'
};

export default function Page() {
  return (
    <PageContainer pageTitle='아이콘' pageDescription='사용 가능한 아이콘 목록'>
      <IconsViewPage />
    </PageContainer>
  );
}
