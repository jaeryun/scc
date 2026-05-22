import { NextResponse } from 'next/server'
import { success, failure } from '@/lib/api-response'
import {
  getDashboards,
  createDashboard,
} from '@/modules/san-dashboard/api/service'

export async function GET() {
  try {
    const dashboards = await getDashboards()
    return NextResponse.json(success(dashboards))
  } catch {
    return NextResponse.json(failure('대시보드 목록 조회 실패'), { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(failure('이름은 필수입니다'), { status: 400 })
    }
    const dashboard = await createDashboard(body)
    return NextResponse.json(success(dashboard), { status: 201 })
  } catch {
    return NextResponse.json(failure('대시보드 생성 실패'), { status: 500 })
  }
}
