import { mutationOptions } from '@tanstack/react-query';
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
import { getQueryClient } from '@/lib/query-client';
import type {
  CreateDashboardPayload,
  UpdateDashboardPayload,
  CreateFolderPayload,
  UpdateFolderPayload
} from './types';

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

export const batchMoveMutation = mutationOptions({
  mutationFn: async (
    moves: Array<{ type: 'dashboard' | 'folder'; id: string; targetFolderId: string | null }>
  ) => batchMove(moves),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: dashboardKeys.all });
  }
});
