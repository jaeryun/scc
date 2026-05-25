import { queryOptions } from '@tanstack/react-query';
import { getWorkspaces, getTeamMembers, getWorkspaceById } from './service';
import type { Workspace } from './types';

export type { Workspace };

export const workspaceKeys = {
  all: ['workspaces'] as const,
  list: () => [...workspaceKeys.all, 'list'] as const,
  detail: (id: string) => [...workspaceKeys.all, 'detail', id] as const,
  members: (workspaceId: string) => [...workspaceKeys.all, 'members', workspaceId] as const
};

export const workspacesQueryOptions = () =>
  queryOptions({
    queryKey: workspaceKeys.list(),
    queryFn: () => getWorkspaces()
  });

export const workspaceByIdOptions = (id: string) =>
  queryOptions({
    queryKey: workspaceKeys.detail(id),
    queryFn: () => getWorkspaceById(id)
  });

export const teamMembersQueryOptions = (workspaceId: string) =>
  queryOptions({
    queryKey: workspaceKeys.members(workspaceId),
    queryFn: () => getTeamMembers(workspaceId)
  });
