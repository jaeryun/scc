import { apiClient } from '@/lib/api-client';
import type { Prefix, IpAddress } from './types';

function toPrefix(raw: any): Prefix {
  return {
    id: raw.id,
    prefix: raw.prefix,
    description: raw.description ?? '',
    vlan: raw.vlan?.name ?? null,
    site: raw.site?.name ?? null,
    role: raw.role?.name ?? null
  };
}

function toIp(raw: any): IpAddress {
  return {
    id: raw.id,
    address: raw.address,
    status: raw.status?.value ?? raw.status ?? 'active',
    dnsName: raw.dns_name ?? '',
    description: raw.description ?? '',
    assignedObject: raw.assigned_object_type
      ? `${raw.assigned_object_type}:${raw.assigned_object_id}`
      : null
  };
}

export async function getPrefixes(params?: Record<string, string>): Promise<Prefix[]> {
  const qs = params ? new URLSearchParams(params).toString() : '';
  const url = qs ? `/api/ipam/prefixes?${qs}` : '/api/ipam/prefixes';
  const data = await apiClient<any[]>(url);
  return data.map(toPrefix);
}

export async function getIpAddresses(params?: Record<string, string>): Promise<IpAddress[]> {
  const qs = params ? new URLSearchParams(params).toString() : '';
  const url = qs ? `/api/ipam/ip-addresses?${qs}` : '/api/ipam/ip-addresses';
  const data = await apiClient<any[]>(url);
  return data.map(toIp);
}

export async function assignIp(prefixId: number): Promise<IpAddress> {
  const data = await apiClient<any>('/api/ipam/ip-addresses/assign', {
    method: 'POST',
    body: JSON.stringify({ prefixId })
  });
  return toIp(data);
}

export async function releaseIp(id: number): Promise<void> {
  await apiClient<null>(`/api/ipam/ip-addresses/${id}/release`, { method: 'POST' });
}

export async function createPrefix(body: Record<string, unknown>): Promise<Prefix> {
  const data = await apiClient<any>('/api/ipam/prefixes', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  return toPrefix(data);
}
