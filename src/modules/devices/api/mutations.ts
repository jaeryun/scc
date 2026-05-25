import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDevice, updateDevice, deleteDevice } from './service';
import { deviceKeys } from './queries';

export function useDeviceMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: deviceKeys.all });

  const createMutation = useMutation({
    mutationFn: createDevice,
    onSuccess: invalidate
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      updateDevice(id, body),
    onSuccess: invalidate
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDevice,
    onSuccess: invalidate
  });

  return { createMutation, updateMutation, deleteMutation };
}
