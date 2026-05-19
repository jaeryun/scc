"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createIpAddress,
  updateIpAddress,
  deleteIpAddress,
} from "../api/service";
import {
  CreateIpAddressPayload,
  UpdateIpAddressPayload,
} from "../api/types";
import { ipAddressKeys, subnetKeys } from "../api/queries";

export function useIpAddressMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateIpAddressPayload) => createIpAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ipAddressKeys.all });
      queryClient.invalidateQueries({ queryKey: subnetKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateIpAddressPayload) => updateIpAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ipAddressKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteIpAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ipAddressKeys.all });
      queryClient.invalidateQueries({ queryKey: subnetKeys.all });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
