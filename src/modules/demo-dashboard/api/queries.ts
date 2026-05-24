import { queryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DemoDashboard, DemoDashboardFolder } from './types';

export const demoDashboardKeys = {
  all: ['demo-dashboards'] as const,
  lists: () => [...demoDashboardKeys.all, 'list'] as const,
  detail: (id: string) => [...demoDashboardKeys.all, 'detail', id] as const,
  folderLists: () => [...demoDashboardKeys.all, 'folders'] as const
};

export const demoDashboardsQueryOptions = (folderId?: string | null) =>
  queryOptions({
    queryKey: [...demoDashboardKeys.lists(), folderId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (folderId !== undefined) params.set('folderId', folderId === null ? '__root__' : folderId);
      return apiClient<DemoDashboard[]>(`/api/demo-dashboards?${params.toString()}`);
    }
  });

export const demoDashboardDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: demoDashboardKeys.detail(id),
    queryFn: () => apiClient<DemoDashboard>(`/api/demo-dashboards/${id}`),
    enabled: !!id
  });

export const foldersQueryOptions = () =>
  queryOptions({
    queryKey: demoDashboardKeys.folderLists(),
    queryFn: () => apiClient<DemoDashboardFolder[]>('/api/demo-dashboards/folders')
  });

export const folderDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...demoDashboardKeys.folderLists(), id],
    queryFn: () => apiClient<DemoDashboardFolder>(`/api/demo-dashboards/folders/${id}`),
    enabled: !!id
  });
