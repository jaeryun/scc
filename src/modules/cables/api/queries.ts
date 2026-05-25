import { queryOptions } from '@tanstack/react-query';
import { getCables, getCable } from './service';

export const cableKeys = {
  all: ['netbox', 'cables'] as const,
  lists: (params?: Record<string, string>) => [...cableKeys.all, 'list', params] as const,
  detail: (id: number) => [...cableKeys.all, 'detail', id] as const
};

export const cablesQueryOptions = (params?: Record<string, string>) =>
  queryOptions({
    queryKey: cableKeys.lists(params),
    queryFn: () => getCables(params),
    staleTime: 2 * 60 * 1000
  });

export const cableQueryOptions = (id: number) =>
  queryOptions({
    queryKey: cableKeys.detail(id),
    queryFn: () => getCable(id),
    staleTime: 2 * 60 * 1000
  });
