import { queryOptions } from '@tanstack/react-query';
import { Dashboard, DashboardFolder } from './types';
import { getDashboards, getDashboardById, getFolders, getFolderById } from './service';

export const dashboardKeys = {
  all: ['dashboards'] as const,
  lists: () => [...dashboardKeys.all, 'list'] as const,
  detail: (id: string) => [...dashboardKeys.all, 'detail', id] as const,
  folderLists: () => [...dashboardKeys.all, 'folders'] as const
};

export const dashboardsQueryOptions = (folderId?: string | null) =>
  queryOptions({
    queryKey: [...dashboardKeys.lists(), folderId],
    queryFn: async () => getDashboards(folderId)
  });

export const dashboardDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: dashboardKeys.detail(id),
    queryFn: async () => getDashboardById(id),
    enabled: !!id
  });

export const foldersQueryOptions = () =>
  queryOptions({
    queryKey: dashboardKeys.folderLists(),
    queryFn: async () => getFolders()
  });

export const folderDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...dashboardKeys.folderLists(), id],
    queryFn: async () => getFolderById(id),
    enabled: !!id
  });
