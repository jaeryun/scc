import { NextRequest, NextResponse } from 'next/server';
import { success, failure } from '@/lib/api-response';
import { checkCache, fetchAndCache, invalidateCache } from '@/lib/netbox/cache';
import { buildCacheKey } from '@/lib/netbox/paths';
import { withRetry } from '@/lib/netbox/retry';
import { envSchema } from '@/lib/netbox/env';
import { NetBoxHttpError } from '@/lib/netbox/errors';

function netboxClient() {
  const env = envSchema.parse(process.env);
  return {
    baseUrl: env.NETBOX_BASE_URL,
    token: env.NETBOX_API_TOKEN,
    headers: {
      Authorization: `Token ${env.NETBOX_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cacheKey = buildCacheKey('devices', 'detail', { id });

  const cached = await checkCache(cacheKey);
  if (cached?.fresh) return NextResponse.json(success(cached.data));

  try {
    const { baseUrl, headers } = netboxClient();
    const res = await withRetry(() => fetch(`${baseUrl}/api/dcim/devices/${id}/`, { headers }));

    if (!res.ok) {
      return NextResponse.json(failure('Device not found'), {
        status: res.status === 404 ? 404 : 502
      });
    }

    const data = await res.json();
    await fetchAndCache(cacheKey, data);
    return NextResponse.json(success(data));
  } catch {
    if (cached?.data) return NextResponse.json(success(cached.data));
    return NextResponse.json(failure('NetBox service temporarily unavailable'), {
      status: 502
    });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { baseUrl, headers } = netboxClient();

    const res = await fetch(`${baseUrl}/api/dcim/devices/${id}/`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    const resBody = await res.json().catch(() => null);

    if (!res.ok) {
      throw new NetBoxHttpError(res.status, resBody);
    }

    await invalidateCache('netbox:devices:');
    await invalidateCache('netbox:interfaces:');
    await invalidateCache('netbox:cables:');

    return NextResponse.json(success(resBody));
  } catch (error) {
    if (error instanceof NetBoxHttpError) {
      return NextResponse.json(failure(error.sanitizedMessage), {
        status: error.status
      });
    }
    return NextResponse.json(failure('Failed to update device'), {
      status: 500
    });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { baseUrl, headers } = netboxClient();

    const res = await fetch(`${baseUrl}/api/dcim/devices/${id}/`, {
      method: 'DELETE',
      headers
    });

    if (!res.ok) {
      const resBody = await res.json().catch(() => null);
      throw new NetBoxHttpError(res.status, resBody);
    }

    await invalidateCache('netbox:devices:');
    await invalidateCache('netbox:interfaces:');
    await invalidateCache('netbox:cables:');

    return NextResponse.json(success(null));
  } catch (error) {
    if (error instanceof NetBoxHttpError) {
      return NextResponse.json(failure(error.sanitizedMessage), {
        status: error.status
      });
    }
    return NextResponse.json(failure('Failed to delete device'), {
      status: 500
    });
  }
}
