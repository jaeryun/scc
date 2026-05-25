import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { apiClient } from '@/lib/api-client';
import { gridDashboardKeys } from './queries';
import {
  GridDashboard,
  GridDashboardFolder,
  CreateGridDashboardPayload,
  UpdateGridDashboardPayload,
  CreateFolderPayload,
  UpdateFolderPayload
} from './types';

export const createGridDashboardMutation = mutationOptions({
  mutationFn: (data: CreateGridDashboardPayload) =>
    apiClient<GridDashboard>('/api/dashboards', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: gridDashboardKeys.all });
  }
});

export const updateGridDashboardMutation = mutationOptions({
  mutationFn: ({ id, data }: { id: string; data: UpdateGridDashboardPayload }) =>
    apiClient<GridDashboard>(`/api/dashboards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: gridDashboardKeys.all });
  }
});

export const deleteGridDashboardMutation = mutationOptions({
  mutationFn: (id: string) =>
    apiClient<GridDashboard>(`/api/dashboards/${id}`, { method: 'DELETE' }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: gridDashboardKeys.all });
  }
});

export const createFolderMutation = mutationOptions({
  mutationFn: (data: CreateFolderPayload) =>
    apiClient<GridDashboardFolder>('/api/dashboards/folders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: gridDashboardKeys.all });
  }
});

export const updateFolderMutation = mutationOptions({
  mutationFn: ({ id, data }: { id: string; data: UpdateFolderPayload }) =>
    apiClient<GridDashboardFolder>(`/api/dashboards/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: gridDashboardKeys.all });
  }
});

export const deleteFolderMutation = mutationOptions({
  mutationFn: (id: string) =>
    apiClient<GridDashboardFolder>(`/api/dashboards/folders/${id}`, { method: 'DELETE' }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: gridDashboardKeys.all });
  }
});

export type BatchMoveItem = {
  type: 'dashboard' | 'folder';
  id: string;
  targetFolderId: string | null;
};

export const batchMoveMutation = mutationOptions({
  mutationFn: (moves: BatchMoveItem[]) =>
    apiClient<{ moved: number }>('/api/dashboards/batch-move', {
      method: 'POST',
      body: JSON.stringify({ moves })
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: gridDashboardKeys.all });
  }
});
