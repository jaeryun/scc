import type { NetBoxDevice } from './types';
import type { SwitchPortsData } from '../types';
import { MOCK_DEVICES_BY_ROLE, MOCK_SWITCH_PORTS } from './mock-data';

export async function getSwitchesByRole(role: string): Promise<NetBoxDevice[]> {
  return MOCK_DEVICES_BY_ROLE[role] ?? [];
}

export async function getSwitchPorts(deviceId: string): Promise<SwitchPortsData> {
  const data = MOCK_SWITCH_PORTS[deviceId];
  if (!data) throw new Error(`No mock data for device ${deviceId}`);
  return data;
}
