import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWorkspace, updateMemberRole } from './service';
import { workspaceKeys } from './queries';
import type { CreateWorkspacePayload, UpdateMemberRolePayload } from './types';

export function useWorkspaceMutations() {
  const queryClient = useQueryClient();

  const createWorkspaceMutation = useMutation({
    mutationFn: (data: CreateWorkspacePayload) => createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    }
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: ({
      workspaceId,
      memberId,
      role
    }: {
      workspaceId: string;
      memberId: string;
      role: UpdateMemberRolePayload['role'];
    }) => updateMemberRole(workspaceId, memberId, role),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(variables.workspaceId)
      });
    }
  });

  return { createWorkspaceMutation, updateMemberRoleMutation };
}
