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

export interface NetBoxDeviceRaw {
  id: number;
  name: string | null;
  device_type: { model: string } | null;
  role: { name: string } | null;
  site: { name: string } | null;
  rack: { name: string } | null;
  status: { value: string } | string;
  serial: string | null;
  primary_ip4: { address: string } | null;
  primary_ip: { address: string } | null;
}
