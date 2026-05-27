import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateViewSetting } from './service';
import { viewSettingKeys } from './queries';
import type { UpdateViewSettingPayload } from './types';

export function useViewSettingsMutations() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ viewId, icon }: { viewId: string; icon: string }) =>
      updateViewSetting(viewId, { icon }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: viewSettingKeys.all });
    }
  });

  return { updateMutation };
}
