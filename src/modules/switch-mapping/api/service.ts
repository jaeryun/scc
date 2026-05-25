import { apiClient } from '@/lib/api-client';
import type { NetBoxDevice } from './types';
import type { SwitchPortsData, PortMapping } from '../types';

export async function getSwitchesByRole(role: string): Promise<NetBoxDevice[]> {
  return apiClient<NetBoxDevice[]>(`/api/devices?role=${encodeURIComponent(role)}`);
}

export async function getSwitchPorts(deviceId: string): Promise<SwitchPortsData> {
  const [device, interfaces] = await Promise.all([
    apiClient<any>(`/api/devices/${deviceId}`),
    apiClient<any[]>(`/api/interfaces?device_id=${encodeURIComponent(deviceId)}`)
  ]);

  const ports: PortMapping[] = interfaces.map(
    (iface: any): PortMapping => ({
      id: String(iface.id),
      switchName: device.name ?? '(unnamed)',
      switchPortName: iface.name,
      hostName:
        iface.link_peers
          ?.map((p: any) => p.device?.name)
          .filter(Boolean)
          .join(', ') ?? null,
      hostPortName:
        iface.link_peers
          ?.map((p: any) => p.name)
          .filter(Boolean)
          .join(', ') ?? null,
      status: iface.enabled ? 'up' : 'down',
      values: {
        speed: iface.speed ?? 0,
        mtu: iface.mtu ?? 0,
        type: iface.type?.value ?? ''
      }
    })
  );

  return {
    switchId: deviceId,
    switchType: (device.role?.slug?.includes('ib')
      ? 'ib'
      : device.role?.slug?.includes('san')
        ? 'san'
        : 'utp') as 'ib' | 'san' | 'utp',
    switchName: device.name ?? '(unnamed)',
    ports
  };
}
