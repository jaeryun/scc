import { apiClient } from '@/lib/api-client';
import type { NetBoxDevice, NetBoxInterface } from './types';
import type { PortMapping, PortStatus, SwitchType, SwitchPortsData } from '../types';

function inferSwitchType(roleSlug: string): SwitchType {
  if (roleSlug.includes('ib')) return 'ib';
  if (roleSlug.includes('san')) return 'san';
  return 'utp';
}

function inferPortStatus(iface: NetBoxInterface): PortStatus {
  if (!iface.enabled) return 'down';
  if (
    iface.connected_endpoints &&
    iface.connected_endpoints.length > 0 &&
    iface.connected_endpoints_reachable
  ) {
    return 'up';
  }
  return 'unconnected';
}

function buildPortMapping(switchDevice: NetBoxDevice, iface: NetBoxInterface): PortMapping {
  const peer = iface.link_peers?.[0];
  const values: Record<string, string | number> = {};

  if (iface.speed != null) {
    const gbps = iface.speed / 1_000_000;
    values['speed'] = gbps >= 1 ? `${gbps}Gbps` : `${iface.speed / 1_000}Mbps`;
  }
  if (iface.wwn) values['wwn'] = iface.wwn;
  if (iface.mtu != null) values['mtu'] = iface.mtu;

  return {
    id: String(iface.id),
    switchName: switchDevice.name ?? `Device#${switchDevice.id}`,
    switchPortName: iface.name,
    hostName: peer?.device?.name ?? null,
    hostPortName: peer?.name ?? null,
    status: inferPortStatus(iface),
    values
  };
}

const VIRTUAL_IFACE_PREFIXES = ['virtual', 'bridge', 'lag'];

function isPhysicalInterface(iface: NetBoxInterface): boolean {
  if (iface.mgmt_only) return false;
  const typeValue = iface.type.value;
  return !VIRTUAL_IFACE_PREFIXES.some((pfx) => typeValue.startsWith(pfx));
}

export async function getSwitchesByRole(role: string): Promise<NetBoxDevice[]> {
  return apiClient<NetBoxDevice[]>(`/api/switch-mapping/switches?role=${encodeURIComponent(role)}`);
}

export async function getSwitchPorts(deviceId: string): Promise<SwitchPortsData> {
  const data = await apiClient<{
    device: NetBoxDevice;
    interfaces: NetBoxInterface[];
  }>(`/api/switch-mapping/switches/${deviceId}`);

  const switchType = inferSwitchType(data.device.role.slug);
  const ports = data.interfaces
    .filter(isPhysicalInterface)
    .map((iface) => buildPortMapping(data.device, iface));

  return {
    switchId: String(data.device.id),
    switchType,
    switchName: data.device.name ?? `Device#${data.device.id}`,
    ports
  };
}
