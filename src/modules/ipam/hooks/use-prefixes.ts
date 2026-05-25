import { useSuspenseQuery } from '@tanstack/react-query';
import { prefixesQueryOptions } from '../api/queries';

export function usePrefixes(params?: Record<string, string>) {
  return useSuspenseQuery(prefixesQueryOptions(params));
}
