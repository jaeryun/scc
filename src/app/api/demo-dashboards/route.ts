import { NextResponse } from 'next/server';
import { success, failure } from '@/lib/api-response';
import {
  getDemoDashboards,
  createDemoDashboard,
  getFolderById,
  isDashboardTitleTaken
} from '@/modules/demo-dashboard/api/service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folderIdParam = searchParams.get('folderId');
    const folderId =
      folderIdParam === null ? undefined : folderIdParam === '__root__' ? null : folderIdParam;
    const dashboards = await getDemoDashboards(folderId);
    return NextResponse.json(success(dashboards));
  } catch (err) {
    console.error('[GET /api/demo-dashboards]', err);
    return NextResponse.json(failure('데모 대시보드 목록 조회 실패'), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json(failure('제목은 필수입니다'), { status: 400 });
    }
    if (body.folderId === '__root__') {
      body.folderId = null;
    }
    if (body.folderId != null) {
      const folder = await getFolderById(body.folderId);
      if (!folder) {
        return NextResponse.json(failure('대상 폴더가 존재하지 않습니다'), { status: 400 });
      }
    }
    const titleTaken = await isDashboardTitleTaken(body.title.trim(), body.folderId ?? null);
    if (titleTaken) {
      return NextResponse.json(failure('같은 폴더에 동일한 이름의 대시보드가 이미 존재합니다'), {
        status: 409
      });
    }
    const dashboard = await createDemoDashboard(body);
    return NextResponse.json(success(dashboard), { status: 201 });
  } catch (err) {
    console.error('[POST /api/demo-dashboards]', err);
    return NextResponse.json(failure('데모 대시보드 생성 실패'), { status: 500 });
  }
}
