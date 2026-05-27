import PageContainer from '@/components/layout/page-container';
import { DeviceDetail } from '@/modules/devices/components/device-detail';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DCIM - Device Detail',
  description: '장비 상세 정보'
};

export default async function DevicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PageContainer pageTitle='Device Detail'>
      <DeviceDetail id={Number(id)} />
    </PageContainer>
  );
}
