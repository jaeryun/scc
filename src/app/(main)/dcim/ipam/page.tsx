import PageContainer from '@/components/layout/page-container';
import { PrefixList } from '@/modules/ipam/components/prefix-list';

export default function IpamPage() {
  return (
    <PageContainer pageTitle='IPAM' pageDescription='IP Address Management'>
      <PrefixList />
    </PageContainer>
  );
}
