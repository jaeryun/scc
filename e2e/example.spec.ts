import { test, expect } from '@playwright/test';

test('메인 페이지 로드', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/SE Command Center/);
});

test('뷰 셀렉터 드롭다운 표시', async ({ page }) => {
  await page.goto('/');
  // 좌상단 Select 드롭다운이 렌더링되는지 확인
  await expect(page.getByRole('combobox').first()).toBeVisible();
});
