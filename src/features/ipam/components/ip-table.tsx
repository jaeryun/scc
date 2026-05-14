"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIpAddresses } from "../hooks/use-ip-addresses";
import { IpStatusBadge } from "./ip-status-badge";

interface IpTableProps {
  subnetId?: string;
}

export function IpTable({ subnetId }: IpTableProps) {
  const { data: ips, isLoading } = useIpAddresses(subnetId);

  if (isLoading) return <div>로딩 중...</div>;
  if (!ips?.length) return <div>IP 주소가 없습니다.</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>IP 주소</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>호스트명</TableHead>
          <TableHead>설명</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ips.map((ip: any) => (
          <TableRow key={ip.id}>
            <TableCell className="font-medium">{ip.ip}</TableCell>
            <TableCell><IpStatusBadge status={ip.status} /></TableCell>
            <TableCell>{ip.hostname || "-"}</TableCell>
            <TableCell>{ip.description || "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
