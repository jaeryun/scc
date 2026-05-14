const { spawn } = require('child_process');
const { chromium } = require('playwright');

async function main() {
  console.log('Starting Next.js dev server...');
  const server = spawn('npm', ['run', 'dev'], {
    cwd: '/home/jerry/scc',
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  let serverReady = false;
  server.stdout.on('data', (data) => {
    const text = data.toString();
    if (text.includes('Ready in') || text.includes('Local:')) {
      serverReady = true;
      console.log('[server ready]');
    }
  });
  server.stderr.on('data', (data) => {
    const text = data.toString();
    if (text.includes('ERROR')) console.error('[server err]', text.trim());
  });

  console.log('Waiting for server...');
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    if (serverReady) break;
  }
  if (!serverReady) {
    console.error('Server failed to start');
    server.kill();
    process.exit(1);
  }

  await new Promise(r => setTimeout(r, 5000));

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    
    console.log('Navigating...');
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: '/home/jerry/scc/screenshot-home.png', fullPage: true });
    console.log('Saved: screenshot-home.png');

    // Click select and wait for dropdown
    const selectTrigger = page.locator('[role="combobox"]').first();
    if (await selectTrigger.isVisible().catch(() => false)) {
      await selectTrigger.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: '/home/jerry/scc/screenshot-select-open.png', fullPage: true });
      console.log('Saved: screenshot-select-open.png');
      
      // Try to find options
      const options = await page.locator('[role="option"]').all();
      console.log(`Found ${options.length} options`);
      
      if (options.length > 1) {
        await options[1].click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '/home/jerry/scc/screenshot-switched.png', fullPage: true });
        console.log('Saved: screenshot-switched.png');
      }
    } else {
      console.log('Select not found');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
    server.kill();
    console.log('Done');
  }
}

main().catch(console.error);
