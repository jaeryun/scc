import { NextRequest, NextResponse } from 'next/server';
import { success, failure } from '@/lib/api-response';
import { invalidateCache } from '@/lib/netbox/cache';
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

export async function POST(req: NextRequest) {
  try {
    const { prefixId } = await req.json();
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
      return NextResponse.json(failure('No available IP addresses in prefix'), {
        status: 409
      });
    }

    await invalidateCache('netbox:ip-addresses:');

    return NextResponse.json(success(created), { status: 201 });
  } catch (error) {
    if (error instanceof NetBoxHttpError) {
      return NextResponse.json(failure(error.sanitizedMessage), {
        status: error.status
      });
    }
    return NextResponse.json(failure('Failed to assign IP address'), { status: 500 });
  }
}
