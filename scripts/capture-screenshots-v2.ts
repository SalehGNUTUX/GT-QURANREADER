// التقاط لقطات متنوعة وحديثة للبرنامج
// يولّد ~15 لقطة تغطي السمات الأربع + كل المقاسات + الحالات المختلفة.
import { firefox, type Page } from 'playwright';
import { mkdir } from 'node:fs/promises';

const OUT = './docs/screenshots';
const URL = 'http://localhost:5174/';

type Viewport = { width: number; height: number };
type Theme = 'gold' | 'dark' | 'light' | 'sepia';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 820, height: 1180 },
  mobile: { width: 390, height: 844 },
};

async function setupPage(page: Page, theme: Theme = 'gold') {
  await page.addInitScript((t) => {
    // ضبط prefs نظيف بالسمة المطلوبة
    localStorage.setItem('gt-quranreader:prefs', JSON.stringify({
      schemaVersion: 6,
      currentPage: 1,
      fontSize: 110,
      fontId: 'AmiriQuran',
      viewMode: 'text',
      theme: t,
      riwaya: 'warsh',
      reciterId: 'ibrahim-aldosary-warsh',
      enableVerseHighlight: true,
      autoPlayNext: false,
      bookmarks: [],
      lastStoppedAt: null,
    }));
  }, theme);
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('.app-shell', { timeout: 30000 });
  await page.waitForTimeout(3500); // خطوط + نصوص
}

async function shot(
  name: string,
  viewport: Viewport,
  opts: { theme?: Theme; before?: (page: Page) => Promise<void> } = {}
) {
  const browser = await firefox.launch({ headless: true });
  const ctx = await browser.newContext({ viewport, locale: 'ar-SA', deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error(`[${name}]`, e.message));
  await setupPage(page, opts.theme ?? 'gold');
  if (opts.before) await opts.before(page);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`✓ ${name.padEnd(36)} (${viewport.width}×${viewport.height}, ${opts.theme ?? 'gold'})`);
  await browser.close();
}

async function run() {
  await mkdir(OUT, { recursive: true });

  // ─── السمات الأربع — سطح المكتب — وضع النص ─────────────────────────────────
  await shot('desktop-gold',   VIEWPORTS.desktop, { theme: 'gold' });
  await shot('desktop-dark',   VIEWPORTS.desktop, { theme: 'dark' });
  await shot('desktop-light',  VIEWPORTS.desktop, { theme: 'light' });
  await shot('desktop-sepia',  VIEWPORTS.desktop, { theme: 'sepia' });

  // ─── سطح المكتب — وضع صورة المصحف ─────────────────────────────────────────
  await shot('desktop-image-mode', VIEWPORTS.desktop, {
    theme: 'gold',
    before: async (page) => {
      const imgBtn = page.locator('.view-mode-btn').filter({ hasText: 'صورة' });
      if (await imgBtn.count() > 0) {
        await imgBtn.click();
        await page.waitForTimeout(3000); // تحميل الصورة من GitHub Raw
      }
    },
  });

  // ─── سطح المكتب — أثناء التشغيل (تظليل آية + شريط) ────────────────────────
  await shot('desktop-playing', VIEWPORTS.desktop, {
    theme: 'gold',
    before: async (page) => {
      // double-click على ثاني آية في الفاتحة لتشغيلها (الأولى = البسملة)
      const verses = page.locator('.verse');
      if (await verses.count() >= 2) {
        await verses.nth(1).dblclick();
        await page.waitForTimeout(2500);
      }
    },
  });

  // ─── سطح المكتب — modal اختيار السورة ─────────────────────────────────────
  await shot('desktop-surah-modal', VIEWPORTS.desktop, {
    theme: 'gold',
    before: async (page) => {
      const btn = page.locator('.quick-nav button').filter({ hasText: 'السور' });
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForTimeout(1500);
      }
    },
  });

  // ─── سطح المكتب — modal اختيار القارئ ─────────────────────────────────────
  await shot('desktop-reciter-modal', VIEWPORTS.desktop, {
    theme: 'gold',
    before: async (page) => {
      const btn = page.locator('.quick-nav button').filter({ hasText: 'القارئ' });
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForTimeout(1500);
      }
    },
  });

  // ─── سطح المكتب — البحث ────────────────────────────────────────────────────
  await shot('desktop-search', VIEWPORTS.desktop, {
    theme: 'gold',
    before: async (page) => {
      const input = page.locator('.search-input').first();
      await input.fill('الرحمن');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2500);
    },
  });

  // ─── سطح المكتب — modal الإعدادات ─────────────────────────────────────────
  await shot('desktop-settings', VIEWPORTS.desktop, {
    theme: 'gold',
    before: async (page) => {
      const btn = page.locator('button[title="الإعدادات"]').first();
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForTimeout(1500);
      }
    },
  });

  // ─── اللوحي ───────────────────────────────────────────────────────────────
  await shot('tablet-gold',  VIEWPORTS.tablet, { theme: 'gold' });
  await shot('tablet-dark',  VIEWPORTS.tablet, { theme: 'dark' });

  // ─── الهاتف ───────────────────────────────────────────────────────────────
  await shot('mobile-gold',  VIEWPORTS.mobile, { theme: 'gold' });
  await shot('mobile-dark',  VIEWPORTS.mobile, { theme: 'dark' });
  await shot('mobile-sepia', VIEWPORTS.mobile, { theme: 'sepia' });

  // ─── الهاتف — أثناء القراءة مع تظليل ──────────────────────────────────────
  await shot('mobile-playing', VIEWPORTS.mobile, {
    theme: 'gold',
    before: async (page) => {
      const verses = page.locator('.verse');
      if (await verses.count() >= 2) {
        await verses.nth(1).dblclick();
        await page.waitForTimeout(2500);
      }
    },
  });

  // ─── الهاتف — modal السورة ────────────────────────────────────────────────
  await shot('mobile-surah-modal', VIEWPORTS.mobile, {
    theme: 'gold',
    before: async (page) => {
      const btn = page.locator('.quick-nav button').filter({ hasText: 'السور' });
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForTimeout(1500);
      }
    },
  });

  console.log('\n✅ تم — لقطات في ' + OUT);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
