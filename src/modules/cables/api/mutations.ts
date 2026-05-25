import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCable, deleteCable } from './service';
import { cableKeys } from './queries';

export function useCableMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: cableKeys.all });

  const createMutation = useMutation({
    mutationFn: createCable,
    onSuccess: invalidate
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCable,
    onSuccess: invalidate
  });

  return { createMutation, deleteMutation };
}
