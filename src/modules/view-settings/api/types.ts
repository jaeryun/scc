export interface ViewSettingItem {
  viewId: string;
  label: string;
  icon: string;
}

export interface UpdateViewSettingPayload {
  icon: string;
}

export interface ViewSettingUpdateResponse {
  id: string;
  viewId: string;
  icon: string;
}
