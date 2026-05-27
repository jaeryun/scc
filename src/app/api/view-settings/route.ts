import { NextResponse } from 'next/server';
import { success, failure } from '@/lib/api-response';
import { getMergedViewSettings } from '@/modules/view-settings/api/get-view-settings-handler';

export async function GET() {
  try {
    const merged = await getMergedViewSettings();
    return NextResponse.json(success(merged));
  } catch {
    return NextResponse.json(failure('뷰 설정 조회 실패'), { status: 500 });
  }
}
