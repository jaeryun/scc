import { apiClient } from '@/lib/api-client';
import type { Interface } from './types';

function toInterface(raw: any): Interface {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type?.value ?? raw.type ?? '',
    enabled: raw.enabled ?? true,
    speed: raw.speed,
    mtu: raw.mtu,
    deviceName: raw.device?.name ?? '',
    cableId: raw.cable ?? null,
    linkPeers: (raw.link_peers ?? []).map((p: any) => ({
      device: p.device?.name ?? '',
      name: p.name
    }))
  };
}

export async function getInterfaces(deviceId?: string): Promise<Interface[]> {
  const qs = deviceId ? new URLSearchParams({ device_id: deviceId }).toString() : '';
  const url = qs ? `/api/interfaces?${qs}` : '/api/interfaces';
  const data = await apiClient<any[]>(url);
  return data.map(toInterface);
}
