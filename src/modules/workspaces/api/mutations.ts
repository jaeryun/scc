import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createWorkspace, updateMemberRole } from './service';
import { workspaceKeys } from './queries';
import type { CreateWorkspacePayload, UpdateMemberRolePayload } from './types';

export const createWorkspaceMutation = mutationOptions({
  mutationFn: (data: CreateWorkspacePayload) => createWorkspace(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: workspaceKeys.all });
  }
});

export const updateMemberRoleMutation = mutationOptions({
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
    getQueryClient().invalidateQueries({
      queryKey: workspaceKeys.members(variables.workspaceId)
    });
  }
});
