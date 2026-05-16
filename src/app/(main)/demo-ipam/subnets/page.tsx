import PageContainer from "@/components/layout/page-container";
import { SubnetTable } from "@/features/ipam/components/subnet-table";
import { SubnetFormDialog } from "@/features/ipam/components/subnet-form";

export default function SubnetsPage() {
  return (
    <PageContainer
      pageTitle="서브넷 관리"
      pageDescription="네트워크 서브넷을 등록하고 관리합니다."
      pageHeaderAction={<SubnetFormDialog />}
    >
      <SubnetTable />
    </PageContainer>
  );
}
