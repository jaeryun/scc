const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/home/jerry/scc/screenshot-home.png', fullPage: true });
  console.log('Screenshot saved: /home/jerry/scc/screenshot-home.png');

  // Click on View Switcher if exists
  try {
    await page.click('text=데모 - 컴포넌트', { timeout: 2000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/home/jerry/scc/screenshot-components.png', fullPage: true });
    console.log('Screenshot saved: /home/jerry/scc/screenshot-components.png');
  } catch (e) {
    console.log('Could not switch view:', e.message);
  }

  await browser.close();
})();
