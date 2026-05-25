import { queryOptions } from '@tanstack/react-query';
import { getDevices, getDevice } from './service';
import type { DeviceFilters } from './types';

export const deviceKeys = {
  all: ['netbox', 'devices'] as const,
  lists: (filters?: DeviceFilters) => [...deviceKeys.all, 'list', filters] as const,
  detail: (id: number) => [...deviceKeys.all, 'detail', id] as const
};

export const devicesQueryOptions = (filters?: DeviceFilters) =>
  queryOptions({
    queryKey: deviceKeys.lists(filters),
    queryFn: () => getDevices(filters),
    staleTime: 2 * 60 * 1000
  });

export const deviceQueryOptions = (id: number) =>
  queryOptions({
    queryKey: deviceKeys.detail(id),
    queryFn: () => getDevice(id),
    staleTime: 2 * 60 * 1000
  });
