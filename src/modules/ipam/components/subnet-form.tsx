"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubnetMutations } from "../hooks/use-subnet-mutations";
import { Subnet } from "../types";

interface SubnetFormDialogProps {
  initialData?: Subnet | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SubnetFormDialog({
  initialData,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: SubnetFormDialogProps) {
  const isEdit = !!initialData;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const [network, setNetwork] = useState(initialData?.network ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [vlanId, setVlanId] = useState(initialData?.vlanId ?? "");

  useEffect(() => {
    if (open) {
      setNetwork(initialData?.network ?? "");
      setDescription(initialData?.description ?? "");
      setVlanId(initialData?.vlanId ?? "");
    }
  }, [open, initialData]);

  const { createMutation, updateMutation } = useSubnetMutations();

  const mutation = isEdit ? updateMutation : createMutation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await updateMutation.mutateAsync({
        id: initialData.id,
        network,
        description,
        vlanId,
        purpose: null,
        centers: [],
      });
    } else {
      await createMutation.mutateAsync({ network, description, vlanId, purpose: null, centers: [] });
    }
    setOpen(false);
    if (!isEdit) {
      setNetwork("");
      setDescription("");
      setVlanId("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button>서브넷 추가</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "서브넷 수정" : "서브넷 추가"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="network">네트워크</Label>
            <Input
              id="network"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              placeholder="192.168.1.0/24"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="vlanId">VLAN ID</Label>
            <Input
              id="vlanId"
              value={vlanId}
              onChange={(e) => setVlanId(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? isEdit
                ? "수정 중..."
                : "생성 중..."
              : isEdit
                ? "수정"
                : "생성"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
