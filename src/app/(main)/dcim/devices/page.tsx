import PageContainer from '@/components/layout/page-container';
import { DeviceTable } from '@/modules/devices/components/device-table';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DCIM - Devices',
  description: '서버, 스위치, 스토리지 등 모든 물리 장비 인벤토리'
};

export default function DevicesPage() {
  return (
    <PageContainer pageTitle='Devices' pageDescription='Data Center Infrastructure Management'>
      <DeviceTable />
    </PageContainer>
  );
}
