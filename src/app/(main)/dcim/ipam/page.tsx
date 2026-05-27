import PageContainer from '@/components/layout/page-container';
import { PrefixList } from '@/modules/ipam/components/prefix-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DCIM - IPAM',
  description: 'IP Address Management — 프리픽스, IP 주소 관리'
};

export default function IpamPage() {
  return (
    <PageContainer pageTitle='IPAM' pageDescription='IP Address Management'>
      <PrefixList />
    </PageContainer>
  );
}
