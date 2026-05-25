import PageContainer from '@/components/layout/page-container';
import { DeviceTable } from '@/modules/devices/components/device-table';

export default function DevicesPage() {
  return (
    <PageContainer pageTitle='Devices' pageDescription='Data Center Infrastructure Management'>
      <DeviceTable />
    </PageContainer>
  );
}
