import { useSuspenseQuery } from '@tanstack/react-query';
import { ipAddressesQueryOptions } from '../api/queries';

export function useIpAddresses(params?: Record<string, string>) {
  return useSuspenseQuery(ipAddressesQueryOptions(params));
}
