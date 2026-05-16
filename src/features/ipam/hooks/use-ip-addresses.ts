"use client";

import { useQuery } from "@tanstack/react-query";
import { ipAddressesQueryOptions } from "../api/queries";
import { IpAddressFilters } from "../api/types";

export function useIpAddresses(filters: IpAddressFilters = {}) {
  return useQuery(ipAddressesQueryOptions(filters));
}
