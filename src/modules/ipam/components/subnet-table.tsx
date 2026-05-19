"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertModal } from "@/components/modal/alert-modal";
import { Icons } from "@/components/icons";
import { useSubnets } from "../hooks/use-subnets";
import { useSubnetMutations } from "../hooks/use-subnet-mutations";
import { SubnetFormDialog } from "./subnet-form";
import { Subnet } from "../types";

type SubnetWithCount = Subnet & { _count?: { ipAddresses: number } };

export function SubnetTable() {
  const { data: subnets, isLoading } = useSubnets();
  const [editSubnet, setEditSubnet] = useState<Subnet | null>(null);
  const [deleteSubnet, setDeleteSubnet] = useState<Subnet | null>(null);
  const { deleteMutation } = useSubnetMutations();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!subnets?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg border-dashed">
        <Icons.network className="h-10 w-10 text-muted-foreground/60 mb-3" />
        <p className="text-muted-foreground font-medium">등록된 서브넷이 없습니다</p>
        <p className="text-muted-foreground text-sm mt-1">
          우측 상단의 &#39;서브넷 추가&#39; 버튼을 클릭하세요.
        </p>
      </div>
    );
  }

  return (
    <>
      <AlertModal
        isOpen={!!deleteSubnet}
        onClose={() => setDeleteSubnet(null)}
        onConfirm={() => {
          if (deleteSubnet) {
            deleteMutation.mutate(deleteSubnet.id, {
              onSuccess: () => setDeleteSubnet(null),
            });
          }
        }}
        loading={deleteMutation.isPending}
      />
      <SubnetFormDialog
        initialData={editSubnet}
        open={!!editSubnet}
        onOpenChange={(open) => {
          if (!open) setEditSubnet(null);
        }}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>네트워크</TableHead>
            <TableHead>설명</TableHead>
            <TableHead>VLAN</TableHead>
            <TableHead>IP 수</TableHead>
            <TableHead className="w-[50px]">
              <span className="sr-only">작업</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subnets.map((subnet: SubnetWithCount) => (
            <TableRow key={subnet.id}>
              <TableCell className="font-medium">{subnet.network}</TableCell>
              <TableCell>{subnet.description || "-"}</TableCell>
              <TableCell>{subnet.vlanId || "-"}</TableCell>
              <TableCell>{subnet._count?.ipAddresses ?? 0}</TableCell>
              <TableCell>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" aria-label="작업 메뉴 열기">
                      <Icons.ellipsis className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setEditSubnet(subnet)}>
                      <Icons.edit className="mr-2 h-4 w-4" /> 수정
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteSubnet(subnet)}>
                      <Icons.trash className="mr-2 h-4 w-4" /> 삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
