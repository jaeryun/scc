import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { success, failure } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { ZodError, z } from 'zod';

const updateViewSettingSchema = z.object({
  icon: z.string().min(1, 'icon 필드가 필요합니다')
});

export async function PUT(req: Request, { params }: { params: Promise<{ viewId: string }> }) {
  const start = Date.now();
  const op = 'updateViewSetting';
  try {
    const { viewId } = await params;
    const body = await req.json();
    const { icon } = updateViewSettingSchema.parse(body);

    const updated = await prisma.viewSetting.upsert({
      where: { viewId },
      update: { icon },
      create: { viewId, icon }
    });

    logger.info({ op, viewId, durationMs: Date.now() - start }, 'Updated view setting');
    return NextResponse.json(success(updated));
  } catch (error) {
    logger.error(
      { err: error, op, durationMs: Date.now() - start, url: req.url },
      'Failed to update view setting'
    );
    if (error instanceof ZodError) {
      return NextResponse.json(failure(error.issues[0]?.message || '유효성 검사 실패'), {
        status: 400
      });
    }
    return NextResponse.json(failure('뷰 설정 업데이트 실패'), { status: 500 });
  }
}
