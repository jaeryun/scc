"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { IpAddress } from "../types";

export function useIpAddresses(subnetId?: string) {
  return useQuery<IpAddress[]>({
    queryKey: ["ip-addresses", subnetId],
    queryFn: () =>
      apiClient(
        subnetId
          ? `/api/ipam/ip-addresses?subnetId=${subnetId}`
          : "/api/ipam/ip-addresses"
      ),
  });
}
