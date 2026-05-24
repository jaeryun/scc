import { queryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Dashboard } from './types';

export const dashboardKeys = {
  all: ['dashboards'] as const,
  lists: () => [...dashboardKeys.all, 'list'] as const,
  detail: (id: string) => [...dashboardKeys.all, 'detail', id] as const
};

export const dashboardsQueryOptions = () =>
  queryOptions({
    queryKey: dashboardKeys.lists(),
    queryFn: () => apiClient<Dashboard[]>('/api/dashboards')
  });

export const dashboardDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: dashboardKeys.detail(id),
    queryFn: () => apiClient<Dashboard>(`/api/dashboards/${id}`),
    enabled: !!id
  });
