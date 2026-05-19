import { queryOptions } from "@tanstack/react-query";
import {
  getSubnets,
  getSubnetById,
  getIpAddresses,
  searchIpByHostname,
} from "./service";
import { IpAddressFilters, HostnameSearchFilters } from "./types";

export const subnetKeys = {
  all: ["subnets"] as const,
  lists: () => [...subnetKeys.all, "list"] as const,
  detail: (id: string) => [...subnetKeys.all, "detail", id] as const,
};

export const ipAddressKeys = {
  all: ["ip-addresses"] as const,
  lists: (filters: IpAddressFilters) =>
    [...ipAddressKeys.all, "list", filters] as const,
  search: (filters: HostnameSearchFilters) =>
    [...ipAddressKeys.all, "search", filters] as const,
};

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

export const ipHostnameSearchOptions = (filters: HostnameSearchFilters) =>
  queryOptions({
    queryKey: ipAddressKeys.search(filters),
    queryFn: () => searchIpByHostname(filters),
    enabled: !!filters.hostname,
  });
