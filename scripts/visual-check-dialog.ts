// محاكاة سيناريو: تشغيل آية → إيقاف تام → ضغط ▶ → ظهور حوار المتابعة.
import { firefox } from 'playwright-core';

async function run() {
  const browser = await firefox.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'ar-SA',
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('pageerror:', e.message));
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('.app-shell', { timeout: 30000 });
  await page.waitForTimeout(2000);

  // امسح أي حالة محفوظة لجعل الحالة نظيفة.
  await page.evaluate(() => localStorage.removeItem('gt-quranreader:prefs'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.app-shell', { timeout: 30000 });
  await page.waitForTimeout(3000);

  // 1. اضغط زر التشغيل الكبير (▶) في الـ floating controls — يبدأ من بداية السورة.
  console.log('Clicking play...');
  await page.locator('.floating-btn-main').click();
  await page.waitForTimeout(2500); // انتظر بدء التشغيل + ظهور Banner

  // 2. اضغط زر الإيقاف التام (■) لإيقاف القراءة لكن إبقاء التظليل كنقطة استئناف.
  console.log('Clicking stop...');
  const stopBtn = page.locator('.floating-btn-stop');
  if ((await stopBtn.count()) > 0) {
    await stopBtn.click();
    await page.waitForTimeout(800);
  } else {
    console.log('Stop button not visible — may have started fresh.');
  }

  // 3. اضغط ▶ مرة أخرى → يجب أن يظهر ConfirmDialog.
  console.log('Clicking play again to trigger dialog...');
  await page.locator('.floating-btn-main').click();
  await page.waitForTimeout(800);

  const dialogVisible = await page.locator('.confirm-dialog').count();
  console.log('ConfirmDialog visible?', dialogVisible > 0);

  await page.screenshot({ path: '/tmp/quran-resume-dialog.png', fullPage: false });
  console.log('✓ /tmp/quran-resume-dialog.png');
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
