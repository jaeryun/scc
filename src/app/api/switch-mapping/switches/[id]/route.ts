import { NextRequest, NextResponse } from 'next/server';
import { success, failure } from '@/lib/api-response';
import { netboxGet } from '@/modules/switch-mapping/api/netbox';
import type {
  NetBoxDevice,
  NetBoxInterface,
  NetBoxPaginatedResponse
} from '@/modules/switch-mapping/api/types';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const device = await netboxGet<NetBoxDevice>(`/dcim/devices/${id}/`);

    const interfaces = await netboxGet<NetBoxPaginatedResponse<NetBoxInterface>>(
      `/dcim/interfaces/?device_id=${id}&limit=0`
    );

    return NextResponse.json(success({ device, interfaces: interfaces.results }));
  } catch (error) {
    return NextResponse.json(
      failure(error instanceof Error ? error.message : 'NetBox fetch failed'),
      { status: 500 }
    );
  }
}
