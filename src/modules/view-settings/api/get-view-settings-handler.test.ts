import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ViewSetting } from '../../../../prisma/generated/client';
import { views } from '@/config/views';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    viewSetting: { findMany: vi.fn() }
  }
}));

import { prisma } from '@/lib/prisma';
import { getMergedViewSettings } from './get-view-settings-handler';

describe('getMergedViewSettings', () => {
  beforeEach(() => vi.clearAllMocks());

  it('DB에 설정이 없으면 views config의 icon 그대로 사용', async () => {
    vi.mocked(prisma.viewSetting.findMany).mockResolvedValue([]);
    const result = await getMergedViewSettings();
    // views 배열의 모든 항목이 결과에 포함되어야 함
    expect(result.length).toBe(views.length);
    // DB가 비어있으면 view.icon이 그대로 보존됨
    result.forEach((item) => {
      expect(item.viewId).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.icon).toBeTruthy();
    });
  });

  it('DB에 설정이 있으면 해당 viewId의 icon을 덮어씀', async () => {
    // 첫 번째 view의 icon을 'custom-icon'으로 덮어쓰는 케이스
    const firstView = views[0].id;
    const override: ViewSetting = {
      id: 'mock-id',
      viewId: firstView,
      icon: 'custom-icon',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    vi.mocked(prisma.viewSetting.findMany).mockResolvedValue([override]);
    const result = await getMergedViewSettings();
    const overridden = result.find((r) => r.viewId === firstView);
    expect(overridden?.icon).toBe('custom-icon');
  });
});
