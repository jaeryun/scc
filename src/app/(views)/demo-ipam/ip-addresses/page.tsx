import PageContainer from "@/components/layout/page-container";
import { IpTable } from "@/features/ipam/components/ip-table";

export default function IpAddressesPage() {
  return (
    <PageContainer
      pageTitle="IP 주소 관리"
      pageDescription="서브넷 내 IP 주소를 할당하고 관리합니다."
    >
      <IpTable />
    </PageContainer>
  );
}
