import { queryOptions } from '@tanstack/react-query';
import { getSites, getRacks, getRoles, getPlatforms } from './service';

export const sitesQueryOptions = queryOptions({
  queryKey: ['netbox', 'sites'],
  queryFn: getSites,
  staleTime: 2 * 60 * 1000
});

export const racksQueryOptions = (siteId?: string) =>
  queryOptions({
    queryKey: ['netbox', 'racks', siteId],
    queryFn: () => getRacks(siteId),
    staleTime: 2 * 60 * 1000
  });

export const rolesQueryOptions = queryOptions({
  queryKey: ['netbox', 'roles'],
  queryFn: getRoles,
  staleTime: 2 * 60 * 1000
});

export const platformsQueryOptions = queryOptions({
  queryKey: ['netbox', 'platforms'],
  queryFn: getPlatforms,
  staleTime: 2 * 60 * 1000
});
