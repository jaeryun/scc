import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { apiClient } from '@/lib/api-client';
import { demoDashboardKeys } from './queries';
import {
  DemoDashboard,
  DemoDashboardFolder,
  CreateDemoDashboardPayload,
  UpdateDemoDashboardPayload,
  CreateFolderPayload,
  UpdateFolderPayload
} from './types';

export const createDemoDashboardMutation = mutationOptions({
  mutationFn: (data: CreateDemoDashboardPayload) =>
    apiClient<DemoDashboard>('/api/demo-dashboards', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: demoDashboardKeys.all });
  }
});

export const updateDemoDashboardMutation = mutationOptions({
  mutationFn: ({ id, data }: { id: string; data: UpdateDemoDashboardPayload }) =>
    apiClient<DemoDashboard>(`/api/demo-dashboards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: demoDashboardKeys.all });
  }
});

export const deleteDemoDashboardMutation = mutationOptions({
  mutationFn: (id: string) =>
    apiClient<DemoDashboard>(`/api/demo-dashboards/${id}`, { method: 'DELETE' }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: demoDashboardKeys.all });
  }
});

export const createFolderMutation = mutationOptions({
  mutationFn: (data: CreateFolderPayload) =>
    apiClient<DemoDashboardFolder>('/api/demo-dashboards/folders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: demoDashboardKeys.all });
  }
});

export const updateFolderMutation = mutationOptions({
  mutationFn: ({ id, data }: { id: string; data: UpdateFolderPayload }) =>
    apiClient<DemoDashboardFolder>(`/api/demo-dashboards/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: demoDashboardKeys.all });
  }
});

export const deleteFolderMutation = mutationOptions({
  mutationFn: (id: string) =>
    apiClient<DemoDashboardFolder>(`/api/demo-dashboards/folders/${id}`, { method: 'DELETE' }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: demoDashboardKeys.all });
  }
});

export type BatchMoveItem = {
  type: 'dashboard' | 'folder';
  id: string;
  targetFolderId: string | null;
};

export const batchMoveMutation = mutationOptions({
  mutationFn: (moves: BatchMoveItem[]) =>
    apiClient<{ moved: number }>('/api/demo-dashboards/batch-move', {
      method: 'POST',
      body: JSON.stringify({ moves })
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: demoDashboardKeys.all });
  }
});
