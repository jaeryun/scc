import { mutationOptions } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import {
  createSubnet,
  updateSubnet,
  deleteSubnet,
  assignIp,
  releaseIp,
} from "./service";
import { subnetKeys, ipAddressKeys } from "./queries";
import type {
  CreateSubnetPayload,
  UpdateSubnetPayload,
  AssignIpPayload,
} from "./types";

export const createSubnetMutation = mutationOptions({
  mutationFn: (data: CreateSubnetPayload) => createSubnet(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: subnetKeys.all });
  },
});

export const updateSubnetMutation = mutationOptions({
  mutationFn: (data: UpdateSubnetPayload) => updateSubnet(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: subnetKeys.all });
  },
});

export const deleteSubnetMutation = mutationOptions({
  mutationFn: (id: string) => deleteSubnet(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: subnetKeys.all });
  },
});

export const assignIpMutation = mutationOptions({
  mutationFn: (data: AssignIpPayload) => assignIp(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: subnetKeys.all });
    getQueryClient().invalidateQueries({ queryKey: ipAddressKeys.all });
  },
});

export const releaseIpMutation = mutationOptions({
  mutationFn: (id: string) => releaseIp(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: subnetKeys.all });
    getQueryClient().invalidateQueries({ queryKey: ipAddressKeys.all });
  },
});
