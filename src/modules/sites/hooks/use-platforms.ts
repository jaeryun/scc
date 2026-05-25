import { useSuspenseQuery } from '@tanstack/react-query';
import { platformsQueryOptions } from '../api/queries';

export function usePlatforms() {
  return useSuspenseQuery(platformsQueryOptions);
}
