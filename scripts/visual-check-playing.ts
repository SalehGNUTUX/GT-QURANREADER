// التقاط لقطة بعد بدء التشغيل للتحقق من ظهور زر الإيقاف التام.
import { firefox } from 'playwright-core';

async function run() {
  const browser = await firefox.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'ar-SA',
  });
  const page = await ctx.newPage();
  page.on('pageerror', (err) => console.error('pageerror:', err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('console.error:', msg.text());
  });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('.app-shell', { timeout: 30000 });
  await page.waitForTimeout(3000);

  // ابحث عن زر "تشغيل" الكبير في floating controls (يحوي الكلاس floating-btn-main).
  const playBtn = page.locator('.floating-btn-main');
  console.log('قبل الضغط: عدد floating buttons =', await page.locator('.floating-btn').count());

  await playBtn.click({ timeout: 5000 });
  await page.waitForTimeout(1500);

  console.log('بعد الضغط: عدد floating buttons =', await page.locator('.floating-btn').count());
  console.log('زر الإيقاف التام موجود؟', await page.locator('.floating-btn-stop').count() > 0);
  console.log('banner ظاهر؟', await page.locator('.active-verse-banner').count() > 0);

  await page.screenshot({ path: '/tmp/quran-playing.png', fullPage: false });
  console.log('✓ /tmp/quran-playing.png');

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
