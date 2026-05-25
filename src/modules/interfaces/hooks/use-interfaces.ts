import { useSuspenseQuery } from '@tanstack/react-query';
import { interfacesQueryOptions } from '../api/queries';

export function useInterfaces(deviceId?: string) {
  return useSuspenseQuery(interfacesQueryOptions(deviceId));
}
