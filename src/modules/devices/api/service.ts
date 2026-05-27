import { apiClient } from '@/lib/api-client';
import type { Device, DeviceFilters, NetBoxDeviceRaw } from './types';

function toDevice(raw: NetBoxDeviceRaw): Device {
  return {
    id: raw.id,
    name: raw.name ?? '(unnamed)',
    deviceType: raw.device_type?.model ?? '',
    role: raw.role?.name ?? '',
    site: raw.site?.name ?? null,
    rack: raw.rack?.name ?? null,
    status: typeof raw.status === 'string' ? raw.status : (raw.status.value ?? ''),
    serial: raw.serial ?? '',
    primaryIp: raw.primary_ip4?.address ?? raw.primary_ip?.address ?? null
  };
}

export async function getDevices(filters?: DeviceFilters): Promise<Device[]> {
  const qs = filters ? new URLSearchParams(filters as Record<string, string>).toString() : '';
  const url = qs ? `/api/dcim/devices?${qs}` : '/api/dcim/devices';
  const data = await apiClient<NetBoxDeviceRaw[]>(url);
  return data.map(toDevice);
}

export async function getDevice(id: number): Promise<Device> {
  const data = await apiClient<NetBoxDeviceRaw>(`/api/dcim/devices/${id}`);
  return toDevice(data);
}

export async function createDevice(body: Record<string, unknown>): Promise<Device> {
  const data = await apiClient<NetBoxDeviceRaw>('/api/dcim/devices', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  return toDevice(data);
}

export async function updateDevice(id: number, body: Record<string, unknown>): Promise<Device> {
  const data = await apiClient<NetBoxDeviceRaw>(`/api/dcim/devices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
  return toDevice(data);
}

export async function deleteDevice(id: number): Promise<void> {
  await apiClient<null>(`/api/dcim/devices/${id}`, { method: 'DELETE' });
}
