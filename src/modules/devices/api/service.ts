import { apiClient } from '@/lib/api-client';
import type { Device, DeviceFilters } from './types';

function toDevice(raw: any): Device {
  return {
    id: raw.id,
    name: raw.name ?? '(unnamed)',
    deviceType: raw.device_type?.model ?? '',
    role: raw.role?.name ?? '',
    site: raw.site?.name ?? null,
    rack: raw.rack?.name ?? null,
    status: raw.status?.value ?? raw.status ?? '',
    serial: raw.serial ?? '',
    primaryIp: raw.primary_ip4?.address ?? raw.primary_ip?.address ?? null
  };
}

export async function getDevices(filters?: DeviceFilters): Promise<Device[]> {
  const qs = filters ? new URLSearchParams(filters as Record<string, string>).toString() : '';
  const url = qs ? `/api/devices?${qs}` : '/api/devices';
  const data = await apiClient<any[]>(url);
  return data.map(toDevice);
}

export async function getDevice(id: number): Promise<Device> {
  const data = await apiClient<any>(`/api/devices/${id}`);
  return toDevice(data);
}

export async function createDevice(body: Record<string, unknown>): Promise<Device> {
  const data = await apiClient<any>('/api/devices', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  return toDevice(data);
}

export async function updateDevice(id: number, body: Record<string, unknown>): Promise<Device> {
  const data = await apiClient<any>(`/api/devices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
  return toDevice(data);
}

export async function deleteDevice(id: number): Promise<void> {
  await apiClient<null>(`/api/devices/${id}`, { method: 'DELETE' });
}
