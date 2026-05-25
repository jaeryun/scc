import { useSuspenseQuery } from '@tanstack/react-query';
import { sitesQueryOptions } from '../api/queries';

export function useSites() {
  return useSuspenseQuery(sitesQueryOptions);
}
