import PageContainer from '@/components/layout/page-container';
import { SubnetsTable } from '@/modules/ipam/components/subnets-table/subnets-table';
import { SubnetFormSheetTrigger } from '@/modules/ipam/components/subnet-form-sheet';

export default function SubnetsPage() {
  return (
    <PageContainer
      pageTitle='서브넷 관리'
      pageDescription='네트워크 서브넷을 등록하고 관리합니다.'
      pageHeaderAction={<SubnetFormSheetTrigger />}
    >
      <SubnetsTable />
    </PageContainer>
  );
}
