import { NextResponse } from 'next/server';
import { success, failure } from '@/lib/api-response';
import { duplicateDashboard } from '@/modules/san-dashboard/api/service';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dashboard = await duplicateDashboard(id);
    return NextResponse.json(success(dashboard), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Dashboard not found') {
      return NextResponse.json(failure('대시보드를 찾을 수 없습니다'), { status: 404 });
    }
    return NextResponse.json(failure('대시보드 복제 실패'), { status: 500 });
  }
}
