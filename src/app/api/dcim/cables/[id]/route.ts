import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
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
  const start = Date.now();
  const op = 'getCable';
  const { id } = await params;
  const cacheKey = buildCacheKey('cables', 'detail');

  const cached = await checkCache(cacheKey);
  if (cached?.fresh) {
    logger.info(
      { op, id, cached: true, durationMs: Date.now() - start },
      'Fetched cable (cache hit)'
    );
    return NextResponse.json(success(cached.data));
  }

  try {
    const { baseUrl, headers } = netboxClient();
    const res = await withRetry(() => fetch(`${baseUrl}/api/dcim/cables/${id}/`, { headers }));

    if (!res.ok) {
      logger.warn(
        { op, id, status: res.status, durationMs: Date.now() - start },
        'Cable not found or upstream error'
      );
      return NextResponse.json(failure('Cable not found'), {
        status: res.status === 404 ? 404 : 502
      });
    }

    const data = await res.json();
    await fetchAndCache(cacheKey, data);
    logger.info({ op, id, durationMs: Date.now() - start }, 'Fetched cable');
    return NextResponse.json(success(data));
  } catch (err) {
    logger.error(
      { err, op, id, durationMs: Date.now() - start, url: _req.url },
      'Failed to fetch cable'
    );
    if (cached?.data) return NextResponse.json(success(cached.data));
    return NextResponse.json(failure('NetBox service temporarily unavailable'), {
      status: 502
    });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const start = Date.now();
  const op = 'deleteCable';
  try {
    const { id } = await params;
    const { baseUrl, headers } = netboxClient();

    const res = await fetch(`${baseUrl}/api/dcim/cables/${id}/`, {
      method: 'DELETE',
      headers
    });

    if (!res.ok) {
      const resBody = await res.json().catch(() => null);
      throw new NetBoxHttpError(res.status, resBody);
    }

    await invalidateCache('netbox:cables:');
    await invalidateCache('netbox:interfaces:');

    logger.info({ op, id, durationMs: Date.now() - start }, 'Deleted cable');
    return NextResponse.json(success(null));
  } catch (error) {
    logger.error(
      { err: error, op, durationMs: Date.now() - start, url: _req.url },
      'Failed to delete cable'
    );
    if (error instanceof NetBoxHttpError) {
      return NextResponse.json(failure(error.sanitizedMessage), {
        status: error.status
      });
    }
    return NextResponse.json(failure('Failed to delete cable'), {
      status: 500
    });
  }
}
