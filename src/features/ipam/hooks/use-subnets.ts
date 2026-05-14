"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { SubnetInput } from "../schemas";
import { Subnet } from "../types";

export function useSubnets() {
  return useQuery<Subnet[]>({
    queryKey: ["subnets"],
    queryFn: () => apiClient("/api/ipam/subnets"),
  });
}

export function useCreateSubnet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubnetInput) =>
      apiClient("/api/ipam/subnets", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subnets"] }),
  });
}
