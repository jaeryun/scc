import { NextResponse } from 'next/server';
import { success, failure } from '@/lib/api-response';
import {
  getFolderById,
  updateFolder,
  deleteFolder,
  isFolderTitleTaken
} from '@/modules/dashboard/api/service';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const folder = await getFolderById(id);
    if (!folder) {
      return NextResponse.json(failure('폴더를 찾을 수 없습니다'), { status: 404 });
    }
    return NextResponse.json(success(folder));
  } catch {
    return NextResponse.json(failure('폴더 조회 실패'), { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim() === '')) {
      return NextResponse.json(failure('폴더 이름은 비워둘 수 없습니다'), { status: 400 });
    }
    if (body.parentId === '__root__') {
      body.parentId = null;
    }
    if (body.title !== undefined || body.parentId !== undefined) {
      const existing = await getFolderById(id);
      const titleToCheck = body.title?.trim() ?? existing?.title ?? '';
      const parentToCheck =
        body.parentId !== undefined ? (body.parentId ?? null) : (existing?.parentId ?? null);
      const titleTaken = await isFolderTitleTaken(titleToCheck, parentToCheck, id);
      if (titleTaken) {
        return NextResponse.json(failure('같은 폴더에 동일한 이름의 폴더가 이미 존재합니다'), {
          status: 409
        });
      }
    }
    const folder = await updateFolder(id, body);
    if (!folder) {
      return NextResponse.json(failure('폴더를 찾을 수 없습니다'), { status: 404 });
    }
    return NextResponse.json(success(folder));
  } catch {
    return NextResponse.json(failure('폴더 수정 실패'), { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const folder = await deleteFolder(id);
    if (!folder) {
      return NextResponse.json(failure('폴더를 찾을 수 없습니다'), { status: 404 });
    }
    return NextResponse.json(success(folder));
  } catch {
    return NextResponse.json(failure('폴더 삭제 실패'), { status: 500 });
  }
}
