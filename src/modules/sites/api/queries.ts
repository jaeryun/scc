import { queryOptions } from '@tanstack/react-query';
import { getSites, getRacks, getRoles, getPlatforms } from './service';

export const siteKeys = {
  all: ['netbox', 'sites'] as const,
  lists: () => [...siteKeys.all, 'list'] as const,
  racks: (siteId?: string) => [...siteKeys.all, 'racks', siteId] as const,
  roles: () => [...siteKeys.all, 'roles'] as const,
  platforms: () => [...siteKeys.all, 'platforms'] as const
};

export const sitesQueryOptions = queryOptions({
  queryKey: siteKeys.lists(),
  queryFn: getSites,
  staleTime: 2 * 60 * 1000
});

export const racksQueryOptions = (siteId?: string) =>
  queryOptions({
    queryKey: siteKeys.racks(siteId),
    queryFn: () => getRacks(siteId),
    staleTime: 2 * 60 * 1000
  });

export const rolesQueryOptions = queryOptions({
  queryKey: siteKeys.roles(),
  queryFn: getRoles,
  staleTime: 2 * 60 * 1000
});

export const platformsQueryOptions = queryOptions({
  queryKey: siteKeys.platforms(),
  queryFn: getPlatforms,
  staleTime: 2 * 60 * 1000
});
