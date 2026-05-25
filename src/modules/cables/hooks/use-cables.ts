import { useSuspenseQuery } from '@tanstack/react-query';
import { cablesQueryOptions, cableQueryOptions } from '../api/queries';

export function useCables(params?: Record<string, string>) {
  return useSuspenseQuery(cablesQueryOptions(params));
}

export function useCable(id: number) {
  return useSuspenseQuery(cableQueryOptions(id));
}
