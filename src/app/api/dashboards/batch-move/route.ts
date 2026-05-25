import { NextResponse } from 'next/server';
import { success, failure } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const moves: { type: 'dashboard' | 'folder'; id: string; targetFolderId: string | null }[] =
      body.moves;
    if (!Array.isArray(moves) || moves.length === 0) {
      return NextResponse.json(failure('이동할 항목이 없습니다'), { status: 400 });
    }

    await prisma.$transaction(
      moves.map((m) => {
        if (m.type === 'dashboard') {
          return prisma.gridDashboard.update({
            where: { id: m.id },
            data: { folderId: m.targetFolderId }
          });
        }
        return prisma.gridDashboardFolder.update({
          where: { id: m.id },
          data: { parentId: m.targetFolderId }
        });
      })
    );

    return NextResponse.json(success({ moved: moves.length }));
  } catch (err) {
    console.error('[POST /api/dashboards/batch-move]', err);
    return NextResponse.json(failure('일괄 이동 실패'), { status: 500 });
  }
}
