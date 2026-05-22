import { NextResponse } from 'next/server'
import { success, failure } from '@/lib/api-response'
import {
  getDashboardById,
  updateDashboard,
  deleteDashboard,
} from '@/modules/san-dashboard/api/service'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const dashboard = await getDashboardById(id)
    if (!dashboard) {
      return NextResponse.json(failure('대시보드를 찾을 수 없습니다'), { status: 404 })
    }
    return NextResponse.json(success(dashboard))
  } catch {
    return NextResponse.json(failure('대시보드 조회 실패'), { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim() === '')) {
      return NextResponse.json(failure('이름은 비워둘 수 없습니다'), { status: 400 })
    }
    const dashboard = await updateDashboard(id, body)
    if (!dashboard) {
      return NextResponse.json(failure('대시보드를 찾을 수 없습니다'), { status: 404 })
    }
    return NextResponse.json(success(dashboard))
  } catch {
    return NextResponse.json(failure('대시보드 수정 실패'), { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const dashboard = await deleteDashboard(id)
    if (!dashboard) {
      return NextResponse.json(failure('대시보드를 찾을 수 없습니다'), { status: 404 })
    }
    return NextResponse.json(success(dashboard))
  } catch {
    return NextResponse.json(failure('대시보드 삭제 실패'), { status: 500 })
  }
}
