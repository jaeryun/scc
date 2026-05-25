import { queryOptions } from '@tanstack/react-query';
import { getInterfaces } from './service';

export const interfacesQueryOptions = (deviceId?: string) =>
  queryOptions({
    queryKey: ['netbox', 'interfaces', deviceId],
    queryFn: () => getInterfaces(deviceId),
    staleTime: 2 * 60 * 1000
  });
