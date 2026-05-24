import { NextResponse } from 'next/server';
import { success, failure } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { views } from '@/config/views';

export async function GET() {
  try {
    const dbSettings = await prisma.viewSetting.findMany();
    const settingMap = new Map(dbSettings.map((s) => [s.viewId, s.icon]));

    const merged = views.map((view) => ({
      viewId: view.id,
      label: view.label,
      icon: settingMap.get(view.id) || view.icon
    }));

    return NextResponse.json(success(merged));
  } catch (error) {
    return NextResponse.json(failure('뷰 설정 조회 실패'), { status: 500 });
  }
}
