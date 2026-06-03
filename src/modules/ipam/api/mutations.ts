import { mutationOptions } from '@tanstack/react-query';
import { createPrefix, assignIp, releaseIp } from './service';
import { prefixKeys, ipKeys } from './queries';
import { getQueryClient } from '@/lib/query-client';

export const createPrefixMutation = mutationOptions({
  mutationFn: createPrefix,
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: prefixKeys.all });
  }
});

export const assignIpMutation = mutationOptions({
  mutationFn: assignIp,
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: ipKeys.all });
  }
});

export const releaseIpMutation = mutationOptions({
  mutationFn: releaseIp,
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: ipKeys.all });
  }
});
