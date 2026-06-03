import { mutationOptions } from '@tanstack/react-query';
import { updateViewSetting } from './service';
import { viewSettingKeys } from './queries';
import { getQueryClient } from '@/lib/query-client';

export const updateViewSettingMutation = mutationOptions({
  mutationFn: ({ viewId, icon }: { viewId: string; icon: string }) =>
    updateViewSetting(viewId, { icon }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: viewSettingKeys.all });
  }
});
