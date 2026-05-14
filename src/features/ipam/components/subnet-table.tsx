"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSubnets } from "../hooks/use-subnets";

export function SubnetTable() {
  const { data: subnets, isLoading } = useSubnets();

  if (isLoading) return <div>로딩 중...</div>;
  if (!subnets?.length) return <div>서브넷이 없습니다.</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>네트워크</TableHead>
          <TableHead>설명</TableHead>
          <TableHead>VLAN</TableHead>
          <TableHead>IP 수</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subnets.map((subnet: any) => (
          <TableRow key={subnet.id}>
            <TableCell className="font-medium">{subnet.network}</TableCell>
            <TableCell>{subnet.description || "-"}</TableCell>
            <TableCell>{subnet.vlanId || "-"}</TableCell>
            <TableCell>{subnet._count?.ipAddresses ?? 0}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
