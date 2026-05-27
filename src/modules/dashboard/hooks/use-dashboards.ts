import { useSuspenseQuery } from '@tanstack/react-query';
import {
  dashboardsQueryOptions,
  dashboardDetailQueryOptions,
  foldersQueryOptions,
  folderDetailQueryOptions
} from '../api/queries';

export function useDashboards(folderId?: string | null) {
  return useSuspenseQuery(dashboardsQueryOptions(folderId));
}

export function useDashboardDetail(id: string) {
  return useSuspenseQuery(dashboardDetailQueryOptions(id));
}

export function useFolders() {
  return useSuspenseQuery(foldersQueryOptions());
}

export function useFolderDetail(id: string) {
  return useSuspenseQuery(folderDetailQueryOptions(id));
}
