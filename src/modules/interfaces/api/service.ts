import { apiClient } from '@/lib/api-client';
import type { Interface, NetBoxInterfaceRaw } from './types';

function toInterface(raw: NetBoxInterfaceRaw): Interface {
  return {
    id: raw.id,
    name: raw.name,
    type: typeof raw.type === 'string' ? raw.type : (raw.type.value ?? ''),
    enabled: raw.enabled ?? true,
    speed: raw.speed,
    mtu: raw.mtu,
    deviceName: raw.device?.name ?? '',
    cableId: raw.cable ?? null,
    linkPeers: (raw.link_peers ?? []).map((p) => ({
      device: p.device?.name ?? '',
      name: p.name
    }))
  };
}

export async function getInterfaces(deviceId?: string): Promise<Interface[]> {
  const qs = deviceId ? new URLSearchParams({ device_id: deviceId }).toString() : '';
  const url = qs ? `/api/dcim/interfaces?${qs}` : '/api/dcim/interfaces';
  const data = await apiClient<NetBoxInterfaceRaw[]>(url);
  return data.map(toInterface);
}
