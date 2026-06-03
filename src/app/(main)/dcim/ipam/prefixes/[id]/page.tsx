import { IpAddressList } from '@/modules/ipam/components/ip-address-list';
import PageContainer from '@/components/layout/page-container';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DCIM - Prefix Detail',
  description: '프리픽스 내 IP 주소 목록'
};

export default async function PrefixDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PageContainer pageTitle='Prefix Detail' pageDescription='프리픽스 내 IP 주소 목록'>
      <IpAddressList prefixId={Number(id)} />
    </PageContainer>
  );
}
