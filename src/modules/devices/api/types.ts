export interface Device {
  id: number;
  name: string;
  deviceType: string;
  role: string;
  site: string | null;
  rack: string | null;
  status: string;
  serial: string;
  primaryIp: string | null;
}

export interface DeviceFilters {
  role?: string;
  site_id?: string;
  status?: string;
  search?: string;
}
