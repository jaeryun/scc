import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, updateUser, deleteUser } from './service';
import { userKeys } from './queries';
import type { UserMutationPayload } from './types';

export function useUserMutations() {
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: (data: UserMutationPayload) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: UserMutationPayload }) =>
      updateUser(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    }
  });

  return { createUserMutation, updateUserMutation, deleteUserMutation };
}
