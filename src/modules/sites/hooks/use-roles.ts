import { useSuspenseQuery } from '@tanstack/react-query';
import { rolesQueryOptions } from '../api/queries';

export function useRoles() {
  return useSuspenseQuery(rolesQueryOptions);
}
