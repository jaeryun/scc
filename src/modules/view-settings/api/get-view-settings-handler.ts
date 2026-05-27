import { prisma } from '@/lib/prisma';
import { views } from '@/config/views';
import type { ViewSettingItem } from './types';

export async function getMergedViewSettings(): Promise<ViewSettingItem[]> {
  const dbSettings = await prisma.viewSetting.findMany();
  const settingMap = new Map(dbSettings.map((s) => [s.viewId, s.icon]));

  return views.map((view) => ({
    viewId: view.id,
    label: view.label,
    icon: settingMap.get(view.id) || view.icon
  }));
}
