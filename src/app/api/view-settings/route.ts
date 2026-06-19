import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { success, failure } from '@/lib/api-response';
import { getMergedViewSettings } from '@/modules/view-settings/api/get-view-settings-handler';

export async function GET() {
  const start = Date.now();
  const op = 'getViewSettings';
  try {
    const merged = await getMergedViewSettings();
    logger.info({ op, durationMs: Date.now() - start }, 'Fetched merged view settings');
    return NextResponse.json(success(merged));
  } catch (err) {
    logger.error({ err, op, durationMs: Date.now() - start }, 'Failed to fetch view settings');
    return NextResponse.json(failure('뷰 설정 조회 실패'), { status: 500 });
  }
}
