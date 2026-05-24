import { queryOptions } from '@tanstack/react-query';
import { getViewSettings } from './service';

export const viewSettingKeys = {
  all: ['view-settings'] as const,
  lists: () => [...viewSettingKeys.all, 'list'] as const
};

export const viewSettingsQueryOptions = () =>
  queryOptions({
    queryKey: viewSettingKeys.lists(),
    queryFn: () => getViewSettings()
  });
