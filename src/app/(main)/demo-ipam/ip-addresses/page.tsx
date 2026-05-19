import PageContainer from '@/components/layout/page-container';
import { IpAssignReturnPage } from '@/modules/ipam/components/ip-assign-page';

export default function IpAddressesPage() {
  return (
    <PageContainer
      pageTitle='IP 할당/반납'
      pageDescription='서브넷의 빈 IP를 자동 할당하거나 호스트네임으로 검색하여 IP를 반납합니다.'
    >
      <IpAssignReturnPage />
    </PageContainer>
  );
}
