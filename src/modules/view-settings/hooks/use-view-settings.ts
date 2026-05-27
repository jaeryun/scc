import { useQuery } from '@tanstack/react-query';
import { viewSettingsQueryOptions } from '../api/queries';

export function useViewSettings() {
  return useQuery(viewSettingsQueryOptions());
}
