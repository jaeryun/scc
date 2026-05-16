import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { usersQueryOptions } from '../api/queries';
import { UsersTable } from './users-table';

export default function UserListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');
  const roles = searchParamsCache.get('role');
  const sortRaw = searchParamsCache.get('sort');
  const sort = sortRaw ? JSON.parse(sortRaw) : [];

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(roles && { roles }),
    ...(sort.length > 0 && sortRaw && { sort: sortRaw })
  };

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(usersQueryOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersTable />
    </HydrationBoundary>
  );
}
