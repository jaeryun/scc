import { apiClient } from '@/lib/api-client';
import type { Cable, NetBoxCableRaw } from './types';

function toCable(raw: NetBoxCableRaw): Cable {
  const a = raw.a_terminations?.[0];
  const b = raw.b_terminations?.[0];
  return {
    id: raw.id,
    type: typeof raw.type === 'string' ? raw.type : (raw.type?.value ?? null),
    status: typeof raw.status === 'string' ? raw.status : (raw.status.value ?? 'connected'),
    label: raw.label ?? '',
    aDevice: a?.device?.name ?? '',
    aInterface: a?.name ?? '',
    bDevice: b?.device?.name ?? '',
    bInterface: b?.name ?? ''
  };
}

export async function getCables(params?: Record<string, string>): Promise<Cable[]> {
  const qs = params ? new URLSearchParams(params).toString() : '';
  const url = qs ? `/api/dcim/cables?${qs}` : '/api/dcim/cables';
  const data = await apiClient<NetBoxCableRaw[]>(url);
  return data.map(toCable);
}

export async function getCable(id: number): Promise<Cable> {
  const data = await apiClient<NetBoxCableRaw>(`/api/dcim/cables/${id}`);
  return toCable(data);
}

export async function createCable(body: Record<string, unknown>): Promise<Cable> {
  const data = await apiClient<NetBoxCableRaw>('/api/dcim/cables', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  return toCable(data);
}

export async function deleteCable(id: number): Promise<void> {
  await apiClient<null>(`/api/dcim/cables/${id}`, { method: 'DELETE' });
}
