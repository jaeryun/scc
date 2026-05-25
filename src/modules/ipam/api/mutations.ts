import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPrefix, assignIp, releaseIp } from './service';
import { prefixKeys, ipKeys } from './queries';

export function usePrefixMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: prefixKeys.all });

  const createMutation = useMutation({
    mutationFn: createPrefix,
    onSuccess: invalidate
  });

  return { createMutation };
}

export function useIpMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ipKeys.all });

  const assignMutation = useMutation({
    mutationFn: assignIp,
    onSuccess: invalidate
  });

  const releaseMutation = useMutation({
    mutationFn: releaseIp,
    onSuccess: invalidate
  });

  return { assignMutation, releaseMutation };
}
