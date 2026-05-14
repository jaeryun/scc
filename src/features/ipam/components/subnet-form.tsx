"use client";

import { useState } from "react";
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
import { useCreateSubnet } from "../hooks/use-subnets";

export function SubnetFormDialog() {
  const [open, setOpen] = useState(false);
  const [network, setNetwork] = useState("");
  const [description, setDescription] = useState("");
  const [vlanId, setVlanId] = useState("");
  const mutation = useCreateSubnet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutation.mutateAsync({ network, description, vlanId });
    setOpen(false);
    setNetwork("");
    setDescription("");
    setVlanId("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>서브넷 추가</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>서브넷 추가</DialogTitle>
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
            {mutation.isPending ? "생성 중..." : "생성"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
