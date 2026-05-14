import { IpTable } from "@/features/ipam/components/ip-table";

export default function IpAddressesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">IP 주소 관리</h1>
      <IpTable />
    </div>
  );
}
