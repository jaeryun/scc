import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from './queries';
import {
  createDashboard,
  updateDashboard,
  deleteDashboard,
  createFolder,
  updateFolder,
  deleteFolder,
  batchMove
} from './service';
import type {
  CreateDashboardPayload,
  UpdateDashboardPayload,
  CreateFolderPayload,
  UpdateFolderPayload
} from './types';

export function useDashboardMutations() {
  const queryClient = useQueryClient();

  const createDashboardMutation = useMutation({
    mutationFn: async (data: CreateDashboardPayload) => createDashboard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    }
  });

  const updateDashboardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDashboardPayload }) =>
      updateDashboard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    }
  });

  const deleteDashboardMutation = useMutation({
    mutationFn: async (id: string) => deleteDashboard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    }
  });

  const createFolderMutation = useMutation({
    mutationFn: async (data: CreateFolderPayload) => createFolder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    }
  });

  const updateFolderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFolderPayload }) =>
      updateFolder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    }
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: string) => deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    }
  });

  const batchMoveMutation = useMutation({
    mutationFn: async (
      moves: Array<{ type: 'dashboard' | 'folder'; id: string; targetFolderId: string | null }>
    ) => batchMove(moves),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    }
  });

  return {
    createDashboardMutation,
    updateDashboardMutation,
    deleteDashboardMutation,
    createFolderMutation,
    updateFolderMutation,
    deleteFolderMutation,
    batchMoveMutation
  };
}
