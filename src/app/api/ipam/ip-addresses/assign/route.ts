import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { success, failure } from '@/lib/api-response';
import { invalidateCache } from '@/lib/netbox/cache';
import { envSchema } from '@/lib/netbox/env';
import { NetBoxHttpError } from '@/lib/netbox/errors';
import { z, ZodError } from 'zod';

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

const assignIpSchema = z.object({
  prefixId: z.number().or(z.string())
});

export async function POST(req: NextRequest) {
  const start = Date.now();
  const op = 'assignIpAddress';
  try {
    const { prefixId } = assignIpSchema.parse(await req.json());
    const { baseUrl, headers } = netboxClient();

    const res = await fetch(`${baseUrl}/api/ipam/prefixes/${prefixId}/available-ips/?limit=1`, {
      method: 'POST',
      headers
    });

    const resBody = await res.json().catch(() => null);

    if (!res.ok) {
      throw new NetBoxHttpError(res.status, resBody);
    }

    const created = Array.isArray(resBody) ? resBody[0] : resBody;

    if (!created) {
      logger.warn(
        { op, prefixId, durationMs: Date.now() - start },
        'No available IP addresses in prefix'
      );
      return NextResponse.json(failure('No available IP addresses in prefix'), {
        status: 409
      });
    }

    await invalidateCache('netbox:ip-addresses:');

    logger.info({ op, prefixId, durationMs: Date.now() - start }, 'Assigned IP address');
    return NextResponse.json(success(created), { status: 201 });
  } catch (error) {
    logger.error(
      { err: error, op, durationMs: Date.now() - start, url: req.url },
      'Failed to assign IP address'
    );
    if (error instanceof ZodError) {
      return NextResponse.json(
        failure(error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')),
        { status: 400 }
      );
    }
    if (error instanceof NetBoxHttpError) {
      return NextResponse.json(failure(error.sanitizedMessage), {
        status: error.status
      });
    }
    return NextResponse.json(failure('Failed to assign IP address'), { status: 500 });
  }
}
