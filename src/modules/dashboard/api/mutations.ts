import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { apiClient } from '@/lib/api-client';
import { dashboardKeys } from './queries';
import {
  Dashboard,
  DashboardFolder,
  CreateDashboardPayload,
  UpdateDashboardPayload,
  CreateFolderPayload,
  UpdateFolderPayload
} from './types';

export const createDashboardMutation = mutationOptions({
  mutationFn: (data: CreateDashboardPayload) =>
    apiClient<Dashboard>('/api/dashboards', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: dashboardKeys.all });
  }
});

export const updateDashboardMutation = mutationOptions({
  mutationFn: ({ id, data }: { id: string; data: UpdateDashboardPayload }) =>
    apiClient<Dashboard>(`/api/dashboards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: dashboardKeys.all });
  }
});

export const deleteDashboardMutation = mutationOptions({
  mutationFn: (id: string) => apiClient<Dashboard>(`/api/dashboards/${id}`, { method: 'DELETE' }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: dashboardKeys.all });
  }
});

export const createFolderMutation = mutationOptions({
  mutationFn: (data: CreateFolderPayload) =>
    apiClient<DashboardFolder>('/api/dashboards/folders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: dashboardKeys.all });
  }
});

export const updateFolderMutation = mutationOptions({
  mutationFn: ({ id, data }: { id: string; data: UpdateFolderPayload }) =>
    apiClient<DashboardFolder>(`/api/dashboards/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: dashboardKeys.all });
  }
});

export const deleteFolderMutation = mutationOptions({
  mutationFn: (id: string) =>
    apiClient<DashboardFolder>(`/api/dashboards/folders/${id}`, { method: 'DELETE' }),
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
  mutationFn: (moves: BatchMoveItem[]) =>
    apiClient<{ moved: number }>('/api/dashboards/batch-move', {
      method: 'POST',
      body: JSON.stringify({ moves })
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: dashboardKeys.all });
  }
});
