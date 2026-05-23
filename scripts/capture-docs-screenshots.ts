// التقاط لقطات للوثائق (README + GitHub)
// نولّد:
// - desktop-text.png   (سطح المكتب، وضع النص)
// - desktop-image.png  (سطح المكتب، وضع الصورة)
// - mobile.png         (الهاتف)
// - resume-dialog.png  (حوار "متابعة")
// - playing.png        (أثناء القراءة + شريط عائم)
import { firefox } from 'playwright-core';
import { mkdir } from 'node:fs/promises';

const OUT_DIR = './docs/screenshots';

async function takeShot(viewport: { width: number; height: number }, name: string, ops?: (page: any) => Promise<void>) {
  const browser = await firefox.launch({ headless: true });
  const ctx = await browser.newContext({ viewport, locale: 'ar-SA' });
  const page = await ctx.newPage();
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('.app-shell', { timeout: 30000 });
  // إعادة ضبط الـ prefs لحالة نظيفة.
  await page.evaluate(() => localStorage.removeItem('gt-quranreader:prefs'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.app-shell', { timeout: 30000 });
  await page.waitForTimeout(3000);
  if (ops) await ops(page);
  await page.screenshot({ path: `${OUT_DIR}/${name}.png`, fullPage: false });
  console.log(`✓ ${OUT_DIR}/${name}.png  (${viewport.width}×${viewport.height})`);
  await browser.close();
}

async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  // 1. سطح المكتب — وضع النص (الافتراضي)
  await takeShot({ width: 1280, height: 800 }, 'desktop-text');

  // 2. سطح المكتب — وضع الصورة
  await takeShot({ width: 1280, height: 800 }, 'desktop-image', async (page) => {
    // اضغط زر "صورة المصحف" في ViewModeToggle
    await page.locator('.view-mode-btn').filter({ hasText: 'صورة المصحف' }).click();
    await page.waitForTimeout(2500);
  });

  // 3. الهاتف
  await takeShot({ width: 390, height: 844 }, 'mobile');

  // 4. أثناء القراءة (شريط عائم بـ ■)
  await takeShot({ width: 390, height: 844 }, 'mobile-playing', async (page) => {
    await page.locator('.floating-btn-main').click();
    await page.waitForTimeout(2000);
  });

  // 5. حوار "متابعة"
  await takeShot({ width: 1280, height: 800 }, 'resume-dialog', async (page) => {
    await page.locator('.floating-btn-main').click();
    await page.waitForTimeout(2500);
    const stopBtn = page.locator('.floating-btn-stop');
    if ((await stopBtn.count()) > 0) {
      await stopBtn.click();
      await page.waitForTimeout(800);
    }
    await page.locator('.floating-btn-main').click();
    await page.waitForTimeout(800);
  });

  console.log('\n✓ All screenshots captured.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
