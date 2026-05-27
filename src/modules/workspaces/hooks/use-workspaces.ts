import { useSuspenseQuery } from '@tanstack/react-query';
import {
  workspacesQueryOptions,
  workspaceByIdOptions,
  teamMembersQueryOptions
} from '../api/queries';

export function useWorkspaces() {
  return useSuspenseQuery(workspacesQueryOptions());
}

export function useWorkspaceById(id: string) {
  return useSuspenseQuery(workspaceByIdOptions(id));
}

export function useTeamMembers(workspaceId: string) {
  return useSuspenseQuery(teamMembersQueryOptions(workspaceId));
}
