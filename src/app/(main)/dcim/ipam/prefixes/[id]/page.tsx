import { IpAddressList } from '@/modules/ipam/components/ip-address-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DCIM - Prefix Detail',
  description: '프리픽스 내 IP 주소 목록'
};

export default async function PrefixDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className='p-6 space-y-4'>
      <IpAddressList prefixId={Number(id)} />
    </div>
  );
}
