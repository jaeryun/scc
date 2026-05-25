import { queryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { GridDashboard, GridDashboardFolder } from './types';

export const gridDashboardKeys = {
  all: ['dashboards'] as const,
  lists: () => [...gridDashboardKeys.all, 'list'] as const,
  detail: (id: string) => [...gridDashboardKeys.all, 'detail', id] as const,
  folderLists: () => [...gridDashboardKeys.all, 'folders'] as const
};

export const gridDashboardsQueryOptions = (folderId?: string | null) =>
  queryOptions({
    queryKey: [...gridDashboardKeys.lists(), folderId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (folderId !== undefined) params.set('folderId', folderId === null ? '__root__' : folderId);
      return apiClient<GridDashboard[]>(`/api/dashboards?${params.toString()}`);
    }
  });

export const gridDashboardDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: gridDashboardKeys.detail(id),
    queryFn: () => apiClient<GridDashboard>(`/api/dashboards/${id}`),
    enabled: !!id
  });

export const foldersQueryOptions = () =>
  queryOptions({
    queryKey: gridDashboardKeys.folderLists(),
    queryFn: () => apiClient<GridDashboardFolder[]>('/api/dashboards/folders')
  });

export const folderDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...gridDashboardKeys.folderLists(), id],
    queryFn: () => apiClient<GridDashboardFolder>(`/api/dashboards/folders/${id}`),
    enabled: !!id
  });
