import { apiClient } from '@/lib/api-client';
import type { ViewSettingItem, UpdateViewSettingPayload, ViewSettingUpdateResponse } from './types';

export async function getViewSettings(): Promise<ViewSettingItem[]> {
  return apiClient('/api/view-settings');
}

export async function updateViewSetting(
  viewId: string,
  data: UpdateViewSettingPayload
): Promise<ViewSettingUpdateResponse> {
  return apiClient(`/api/view-settings/${viewId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}
