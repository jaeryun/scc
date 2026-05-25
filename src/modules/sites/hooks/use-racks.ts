import { useSuspenseQuery } from '@tanstack/react-query';
import { racksQueryOptions } from '../api/queries';

export function useRacks(siteId?: string) {
  return useSuspenseQuery(racksQueryOptions(siteId));
}
