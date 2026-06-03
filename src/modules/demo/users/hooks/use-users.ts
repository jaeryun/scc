import { useSuspenseQuery } from '@tanstack/react-query';
import { usersQueryOptions } from '../api/queries';
import type { UserFilters } from '../api/types';

export function useUsers(filters: UserFilters) {
  return useSuspenseQuery(usersQueryOptions(filters));
}
