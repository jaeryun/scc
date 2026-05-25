import { apiClient } from '@/lib/api-client';
import type { Site, Rack, DeviceRole, Platform } from './types';

export async function getSites(): Promise<Site[]> {
  return apiClient<Site[]>('/api/sites');
}

export async function getRacks(siteId?: string): Promise<Rack[]> {
  const url = siteId
    ? `/api/sites/racks?site_id=${encodeURIComponent(siteId)}`
    : '/api/sites/racks';
  return apiClient<Rack[]>(url);
}

export async function getRoles(): Promise<DeviceRole[]> {
  return apiClient<DeviceRole[]>('/api/sites/roles');
}

export async function getPlatforms(): Promise<Platform[]> {
  return apiClient<Platform[]>('/api/sites/platforms');
}
