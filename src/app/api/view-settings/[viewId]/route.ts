import { NextResponse } from 'next/server';
import { success, failure } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ viewId: string }> }) {
  try {
    const { viewId } = await params;
    const body = await req.json();
    const { icon } = body;

    if (!icon || typeof icon !== 'string') {
      return NextResponse.json(failure('icon 필드가 필요합니다'), { status: 400 });
    }

    const updated = await prisma.viewSetting.upsert({
      where: { viewId },
      update: { icon },
      create: { viewId, icon }
    });

    return NextResponse.json(success(updated));
  } catch (error) {
    return NextResponse.json(failure('뷰 설정 업데이트 실패'), { status: 500 });
  }
}
