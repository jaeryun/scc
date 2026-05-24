import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { apiClient } from '@/lib/api-client';
import { dashboardKeys } from './queries';
import { Dashboard, CreateDashboardPayload, UpdateDashboardPayload } from './types';

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

export const duplicateDashboardMutation = mutationOptions({
  mutationFn: (id: string) =>
    apiClient<Dashboard>(`/api/dashboards/${id}/duplicate`, { method: 'POST' }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: dashboardKeys.all });
  }
});
