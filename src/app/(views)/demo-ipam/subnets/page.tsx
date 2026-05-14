import { SubnetTable } from "@/features/ipam/components/subnet-table";
import { SubnetFormDialog } from "@/features/ipam/components/subnet-form";

export default function SubnetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">서브넷 관리</h1>
        <SubnetFormDialog />
      </div>
      <SubnetTable />
    </div>
  );
}
