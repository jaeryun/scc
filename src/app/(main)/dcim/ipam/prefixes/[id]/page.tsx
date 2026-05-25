import { IpAddressList } from '@/modules/ipam/components/ip-address-list';

export default async function PrefixDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className='p-6 space-y-4'>
      <IpAddressList prefixId={Number(id)} />
    </div>
  );
}
