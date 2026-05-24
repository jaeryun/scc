import { apiClient } from '@/lib/api-client';

export interface ViewSettingItem {
  viewId: string;
  label: string;
  icon: string;
}

export interface UpdateViewSettingPayload {
  icon: string;
}

export async function getViewSettings(): Promise<ViewSettingItem[]> {
  return apiClient('/api/view-settings');
}

export async function updateViewSetting(
  viewId: string,
  data: UpdateViewSettingPayload
): Promise<{ id: string; viewId: string; icon: string }> {
  return apiClient(`/api/view-settings/${viewId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}
