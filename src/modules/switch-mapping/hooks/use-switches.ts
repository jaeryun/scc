import { useSuspenseQuery } from '@tanstack/react-query';
import { switchesQueryOptions } from '../api/queries';

export function useSwitches(role: string) {
  return useSuspenseQuery(switchesQueryOptions(role));
}
