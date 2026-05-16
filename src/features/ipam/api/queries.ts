import { queryOptions } from "@tanstack/react-query";
import {
  getSubnets,
  getSubnetById,
  getIpAddresses,
} from "./service";
import { IpAddressFilters } from "./types";

// ─── Query Key Factories ───

export const subnetKeys = {
  all: ["subnets"] as const,
  lists: () => [...subnetKeys.all, "list"] as const,
  detail: (id: string) => [...subnetKeys.all, "detail", id] as const,
};

export const ipAddressKeys = {
  all: ["ip-addresses"] as const,
  lists: (filters: IpAddressFilters) =>
    [...ipAddressKeys.all, "list", filters] as const,
};

// ─── Query Options ───

export const subnetsQueryOptions = () =>
  queryOptions({
    queryKey: subnetKeys.lists(),
    queryFn: () => getSubnets(),
  });

export const subnetDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: subnetKeys.detail(id),
    queryFn: () => getSubnetById(id),
    enabled: !!id,
  });

export const ipAddressesQueryOptions = (filters: IpAddressFilters = {}) =>
  queryOptions({
    queryKey: ipAddressKeys.lists(filters),
    queryFn: () => getIpAddresses(filters),
  });
