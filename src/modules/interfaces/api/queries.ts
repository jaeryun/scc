import { queryOptions } from '@tanstack/react-query';
import { getInterfaces } from './service';

export const interfaceKeys = {
  all: ['netbox', 'interfaces'] as const,
  list: (deviceId?: string) => [...interfaceKeys.all, 'list', deviceId] as const
};

export const interfacesQueryOptions = (deviceId?: string) =>
  queryOptions({
    queryKey: interfaceKeys.list(deviceId),
    queryFn: () => getInterfaces(deviceId),
    staleTime: 2 * 60 * 1000
  });
