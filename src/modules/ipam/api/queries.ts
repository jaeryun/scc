import { queryOptions } from '@tanstack/react-query';
import { getPrefixes, getIpAddresses } from './service';

export const prefixKeys = {
  all: ['netbox', 'prefixes'] as const,
  lists: (params?: Record<string, string>) => [...prefixKeys.all, 'list', params] as const
};

export const ipKeys = {
  all: ['netbox', 'ip-addresses'] as const,
  lists: (params?: Record<string, string>) => [...ipKeys.all, 'list', params] as const
};

export const prefixesQueryOptions = (params?: Record<string, string>) =>
  queryOptions({
    queryKey: prefixKeys.lists(params),
    queryFn: () => getPrefixes(params),
    staleTime: 2 * 60 * 1000
  });

export const ipAddressesQueryOptions = (params?: Record<string, string>) =>
  queryOptions({
    queryKey: ipKeys.lists(params),
    queryFn: () => getIpAddresses(params),
    staleTime: 2 * 60 * 1000
  });
