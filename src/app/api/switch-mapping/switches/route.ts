import { NextRequest, NextResponse } from 'next/server'
import { success, failure } from '@/lib/api-response'
import { netboxGet } from '@/modules/switch-mapping/api/netbox'
import type { NetBoxDevice, NetBoxPaginatedResponse } from '@/modules/switch-mapping/api/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    let path = '/dcim/devices/?limit=0&status=active'
    if (role) {
      path += `&role=${encodeURIComponent(role)}`
    }
    path += '&brief=true'

    const data = await netboxGet<NetBoxPaginatedResponse<NetBoxDevice>>(path)

    return NextResponse.json(success(data.results))
  } catch (error) {
    return NextResponse.json(
      failure(error instanceof Error ? error.message : 'NetBox fetch failed'),
      { status: 500 }
    )
  }
}
