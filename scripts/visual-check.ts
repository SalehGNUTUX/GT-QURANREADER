// التقاط لقطات بصرية للصفحة على شاشتين (هاتف + سطح مكتب)
// للتحقق من تراص toolbar والـ floating controls.
import { firefox } from 'playwright-core';

async function shot(width: number, height: number, name: string) {
  const browser = await firefox.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width, height },
    locale: 'ar-SA',
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  page.on('pageerror', (err) => console.error(`[${name}] pageerror:`, err.message));
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle', timeout: 60000 });
  // انتظر حتى تختفي شاشة التحميل وتظهر الترويسة.
  await page.waitForSelector('.app-shell', { timeout: 30000 });
  await page.waitForTimeout(2500); // انتظار إضافي للخطوط والـ react state
  await page.screenshot({ path: `/tmp/quran-${name}.png`, fullPage: false });
  console.log(`✓ ${name} (${width}x${height}) → /tmp/quran-${name}.png`);
  await browser.close();
}

async function run() {
  await shot(1280, 800, 'desktop');
  await shot(390, 844, 'mobile'); // iPhone 14 dimensions
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
