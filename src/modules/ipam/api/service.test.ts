import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api-client', () => ({
  apiClient: vi.fn()
}));

import { apiClient } from '@/lib/api-client';
import { createPrefix } from './service';

describe('createPrefix', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apiClient에 POST /api/ipam/prefixes 요청을 보냄', async () => {
    vi.mocked(apiClient).mockResolvedValue({
      id: 1,
      prefix: '10.0.0.0/24',
      description: '',
      vlan: null,
      site: null,
      role: null
    });

    await createPrefix({ prefix: '10.0.0.0/24' });

    expect(apiClient).toHaveBeenCalledTimes(1);
    const [url, options] = vi.mocked(apiClient).mock.calls[0];
    expect(url).toBe('/api/ipam/prefixes');
    expect(options?.method).toBe('POST');
    const body = options?.body;
    if (typeof body !== 'string') throw new Error('body should be a string');
    expect(JSON.parse(body)).toEqual({ prefix: '10.0.0.0/24' });
  });

  it('apiClient 응답을 그대로 반환', async () => {
    const rawResponse = {
      id: 42,
      prefix: '192.168.0.0/16',
      description: 'test',
      vlan: { name: 'vlan10' },
      site: { name: 'dc1' },
      role: { name: 'infra' }
    };
    const expected = {
      id: 42,
      prefix: '192.168.0.0/16',
      description: 'test',
      vlan: 'vlan10',
      site: 'dc1',
      role: 'infra'
    };
    vi.mocked(apiClient).mockResolvedValue(rawResponse);

    const result = await createPrefix({ prefix: '192.168.0.0/16' });
    expect(result).toEqual(expected);
  });
});
