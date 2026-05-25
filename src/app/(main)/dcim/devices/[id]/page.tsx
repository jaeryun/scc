import PageContainer from '@/components/layout/page-container';
import { DeviceDetail } from '@/modules/devices/components/device-detail';

export default async function DevicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PageContainer pageTitle='Device Detail'>
      <DeviceDetail id={Number(id)} />
    </PageContainer>
  );
}
