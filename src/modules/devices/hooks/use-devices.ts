import { useSuspenseQuery } from '@tanstack/react-query';
import { devicesQueryOptions, deviceQueryOptions } from '../api/queries';
import type { DeviceFilters } from '../api/types';

export function useDevices(filters?: DeviceFilters) {
  return useSuspenseQuery(devicesQueryOptions(filters));
}

export function useDevice(id: number) {
  return useSuspenseQuery(deviceQueryOptions(id));
}
