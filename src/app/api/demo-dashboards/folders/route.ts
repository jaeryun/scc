import { NextResponse } from 'next/server';
import { success, failure } from '@/lib/api-response';
import {
  getFolders,
  createFolder,
  getFolderById,
  isFolderTitleTaken
} from '@/modules/demo-dashboard/api/service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parentIdParam = searchParams.get('parentId');
    const parentId =
      parentIdParam === null ? undefined : parentIdParam === '__root__' ? null : parentIdParam;
    const folders = await getFolders(parentId);
    return NextResponse.json(success(folders));
  } catch (err) {
    console.error('[GET /api/demo-dashboards/folders]', err);
    return NextResponse.json(failure('폴더 목록 조회 실패'), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json(failure('폴더 이름은 필수입니다'), { status: 400 });
    }
    if (body.parentId === '__root__') {
      body.parentId = null;
    }
    if (body.parentId != null) {
      const parent = await getFolderById(body.parentId);
      if (!parent) {
        return NextResponse.json(failure('상위 폴더가 존재하지 않습니다'), { status: 400 });
      }
    }
    const titleTaken = await isFolderTitleTaken(body.title.trim(), body.parentId ?? null);
    if (titleTaken) {
      return NextResponse.json(failure('같은 폴더에 동일한 이름의 폴더가 이미 존재합니다'), {
        status: 409
      });
    }
    const folder = await createFolder(body);
    return NextResponse.json(success(folder), { status: 201 });
  } catch (err) {
    console.error('[POST /api/demo-dashboards/folders]', err);
    return NextResponse.json(failure('폴더 생성 실패'), { status: 500 });
  }
}
