import { NextResponse } from 'next/server';
import { success, failure } from '@/lib/api-response';
import {
  getDashboardById,
  updateDashboard,
  deleteDashboard,
  isDashboardTitleTaken
} from '@/modules/dashboard/api/service';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dashboard = await getDashboardById(id);
    if (!dashboard) {
      return NextResponse.json(failure('대시보드를 찾을 수 없습니다'), { status: 404 });
    }
    return NextResponse.json(success(dashboard));
  } catch {
    return NextResponse.json(failure('대시보드 조회 실패'), { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim() === '')) {
      return NextResponse.json(failure('제목은 비워둘 수 없습니다'), { status: 400 });
    }
    if (body.folderId === '__root__') {
      body.folderId = null;
    }
    if (body.title !== undefined || body.folderId !== undefined) {
      const existing = await getDashboardById(id);
      const titleToCheck = body.title?.trim() ?? existing?.title ?? '';
      const folderToCheck =
        body.folderId !== undefined ? (body.folderId ?? null) : (existing?.folderId ?? null);
      const titleTaken = await isDashboardTitleTaken(titleToCheck, folderToCheck, id);
      if (titleTaken) {
        return NextResponse.json(failure('같은 폴더에 동일한 이름의 대시보드가 이미 존재합니다'), {
          status: 409
        });
      }
    }
    const dashboard = await updateDashboard(id, body);
    if (!dashboard) {
      return NextResponse.json(failure('대시보드를 찾을 수 없습니다'), { status: 404 });
    }
    return NextResponse.json(success(dashboard));
  } catch {
    return NextResponse.json(failure('대시보드 수정 실패'), { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dashboard = await deleteDashboard(id);
    if (!dashboard) {
      return NextResponse.json(failure('대시보드를 찾을 수 없습니다'), { status: 404 });
    }
    return NextResponse.json(success(dashboard));
  } catch {
    return NextResponse.json(failure('대시보드 삭제 실패'), { status: 500 });
  }
}
