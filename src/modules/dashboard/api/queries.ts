import { queryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Dashboard, DashboardFolder } from './types';

export const dashboardKeys = {
  all: ['dashboards'] as const,
  lists: () => [...dashboardKeys.all, 'list'] as const,
  detail: (id: string) => [...dashboardKeys.all, 'detail', id] as const,
  folderLists: () => [...dashboardKeys.all, 'folders'] as const
};

export const dashboardsQueryOptions = (folderId?: string | null) =>
  queryOptions({
    queryKey: [...dashboardKeys.lists(), folderId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (folderId !== undefined) params.set('folderId', folderId === null ? '__root__' : folderId);
      return apiClient<Dashboard[]>(`/api/dashboards?${params.toString()}`);
    }
  });

export const dashboardDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: dashboardKeys.detail(id),
    queryFn: () => apiClient<Dashboard>(`/api/dashboards/${id}`),
    enabled: !!id
  });

export const foldersQueryOptions = () =>
  queryOptions({
    queryKey: dashboardKeys.folderLists(),
    queryFn: () => apiClient<DashboardFolder[]>('/api/dashboards/folders')
  });

export const folderDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...dashboardKeys.folderLists(), id],
    queryFn: () => apiClient<DashboardFolder>(`/api/dashboards/folders/${id}`),
    enabled: !!id
  });
