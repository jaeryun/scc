import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { dashboardKeys } from './queries';
import {
  CreateDashboardPayload,
  UpdateDashboardPayload,
  CreateFolderPayload,
  UpdateFolderPayload
} from './types';
import {
  createDashboard,
  updateDashboard,
  deleteDashboard,
  createFolder,
  updateFolder,
  deleteFolder,
  batchMove
} from './service';

export const createDashboardMutation = mutationOptions({
  mutationFn: async (data: CreateDashboardPayload) => createDashboard(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: dashboardKeys.all });
  }
});

export const updateDashboardMutation = mutationOptions({
  mutationFn: async ({ id, data }: { id: string; data: UpdateDashboardPayload }) =>
    updateDashboard(id, data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: dashboardKeys.all });
  }
});

export const deleteDashboardMutation = mutationOptions({
  mutationFn: async (id: string) => deleteDashboard(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: dashboardKeys.all });
  }
});

export const createFolderMutation = mutationOptions({
  mutationFn: async (data: CreateFolderPayload) => createFolder(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: dashboardKeys.all });
  }
});

export const updateFolderMutation = mutationOptions({
  mutationFn: async ({ id, data }: { id: string; data: UpdateFolderPayload }) =>
    updateFolder(id, data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: dashboardKeys.all });
  }
});

export const deleteFolderMutation = mutationOptions({
  mutationFn: async (id: string) => deleteFolder(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: dashboardKeys.all });
  }
});

export type BatchMoveItem = {
  type: 'dashboard' | 'folder';
  id: string;
  targetFolderId: string | null;
};

export const batchMoveMutation = mutationOptions({
  mutationFn: async (moves: BatchMoveItem[]) => batchMove(moves),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: dashboardKeys.all });
  }
});
