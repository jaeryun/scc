import PageContainer from "@/components/layout/page-container";
import { SubnetTable } from "@/features/ipam/components/subnet-table";
import { SubnetFormDialog } from "@/features/ipam/components/subnet-form";

export default function DemoIpamPage() {
  return (
    <PageContainer
      pageTitle="IPAM 대시보드"
      pageDescription="네트워크 서브넷과 IP 주소를 관리합니다."
      pageHeaderAction={<SubnetFormDialog />}
    >
      <SubnetTable />
    </PageContainer>
  );
}
