const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: '/home/jerry/scc/screenshot-home.png', fullPage: true });
    console.log('Screenshot saved: /home/jerry/scc/screenshot-home.png');

    // Check if Select dropdown exists and click it
    const selectTrigger = await page.locator('[role="combobox"]').first();
    if (await selectTrigger.isVisible().catch(() => false)) {
      console.log('Found Select dropdown, clicking...');
      await selectTrigger.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/home/jerry/scc/screenshot-select-open.png', fullPage: true });
      console.log('Screenshot saved: /home/jerry/scc/screenshot-select-open.png');

      // Try to click second option (demo-components)
      const options = await page.locator('[role="option"]').all();
      if (options.length > 1) {
        await options[1].click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '/home/jerry/scc/screenshot-switched.png', fullPage: true });
        console.log('Screenshot saved: /home/jerry/scc/screenshot-switched.png');
      }
    } else {
      console.log('Select dropdown NOT found');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (browser) await browser.close();
  }
})();
