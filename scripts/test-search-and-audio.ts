// اختبار حقيقي: يجلب نص حفص الكامل من api.alquran.cloud،
// ثم يُشغّل الـ search engine الفعلي على البيانات،
// ثم يتحقق من توفر صوت الآية في everyayah.com.
// هذا يحاكي ما يفعله المتصفح بالضبط — بدون DOM.

import { fetchQuranByRiwaya } from '../packages/core/api/alquran-cloud';
import { searchQuran } from '../packages/core/search/search-engine';
import { normalizeForSearch } from '../packages/core/search/normalize';
import { getVerseAudioUrl } from '../packages/core/api/everyayah';
import { getReciter } from '../packages/core/audio/reciter-catalog';
import { getSurahByPage } from '../packages/core/data/surahs';

const pad = (n: number, w = 3) => String(n).padStart(w, '0');
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const ok = (s: string) => `\x1b[32m✓\x1b[0m ${s}`;
const fail = (s: string) => `\x1b[31m✗\x1b[0m ${s}`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

async function checkAudioUrl(url: string): Promise<{ ok: boolean; size?: string }> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (!res.ok) return { ok: false };
    const size = res.headers.get('content-length');
    return { ok: true, size: size ? `${(parseInt(size, 10) / 1024).toFixed(1)} KB` : undefined };
  } catch {
    return { ok: false };
  }
}

async function run() {
  console.log(bold('\n════════ اختبار محرّك البحث والصوت ════════\n'));

  // ============ 1. جلب نص حفص ============
  console.log(bold('1️⃣  جلب نص حفص من api.alquran.cloud'));
  const t0 = Date.now();
  const data = await fetchQuranByRiwaya('hafs');
  const dt = Date.now() - t0;
  console.log(
    ok(`تم الجلب في ${dt}ms — ${data.surahs.length} سورة، ${data.surahs.reduce((n, s) => n + s.verses.length, 0)} آية`)
  );

  // ============ 2. اختبار التطبيع ============
  console.log(bold('\n2️⃣  اختبار التطبيع العربي'));
  const variants = [
    ['ٱلرَّحْمَٰنِ', 'الرحمن'],
    ['الرَّحمان', 'الرحمن'],
    ['الرحمٰن', 'الرحمن'],
    ['اللَّـهُ', 'الله'],
    ['ٱللَّهِ', 'الله'],
  ];
  for (const [original, target] of variants) {
    const nOrig = normalizeForSearch(original);
    const nTarg = normalizeForSearch(target);
    const matches = nOrig === nTarg;
    console.log(
      (matches ? ok : fail)(`"${original}" → "${nOrig}" ${matches ? '===' : '≠'} "${nTarg}" ← "${target}"`)
    );
  }

  // ============ 3. أنماط البحث ============
  console.log(bold('\n3️⃣  أنماط البحث الذكي'));

  const queries: { q: string; desc: string; expect: (n: number) => boolean }[] = [
    { q: 'الرحمن', desc: 'كلمة (مع تطبيع، تطابق آية)', expect: (n) => n > 0 },
    { q: 'الرحمان', desc: 'كلمة مكتوبة بالألف (يجب أن يطابق "الرحمن")', expect: (n) => n > 0 },
    { q: '2:255', desc: 'مرجع آية الكرسي', expect: (n) => n === 1 },
    { q: 'الكرسي', desc: 'كنية آية الكرسي', expect: (n) => n >= 1 },
    { q: 'ص 100', desc: 'مرجع صفحة', expect: (n) => n === 1 },
    { q: 'جزء 30', desc: 'مرجع جزء', expect: (n) => n === 1 },
    { q: 'الفاتحة', desc: 'اسم سورة', expect: (n) => n >= 1 },
    { q: 'يس', desc: 'سورة قصيرة الاسم', expect: (n) => n >= 1 },
    { q: 'قلب القرآن', desc: 'كنية سورة (يس)', expect: (n) => n >= 1 },
    { q: 'بسم الله', desc: 'عبارة شائعة', expect: (n) => n > 10 },
    { q: 'محمد', desc: 'كلمة موجودة + سورة باسمها', expect: (n) => n > 1 },
  ];

  for (const { q, desc, expect } of queries) {
    const results = searchQuran(q, data);
    const pass = expect(results.length);
    console.log(
      (pass ? ok : fail)(`"${q}" — ${desc}: ${results.length} نتيجة` + (pass ? '' : ` ${dim('(غير متوقع)')}`))
    );
    if (results.length > 0 && results.length <= 3) {
      for (const r of results.slice(0, 2)) {
        const text = r.verseText ? `: ${r.verseText.slice(0, 60)}...` : '';
        console.log(
          dim(
            `      ↳ ${r.type} ` +
              (r.surahName ? `(${r.surahName} ${r.verseNumber ?? ''})` : '') +
              ` ص${r.page}${text}`
          )
        );
      }
    } else if (results.length > 3) {
      console.log(dim(`      ↳ أول نتيجة: ${results[0].surahName} ${results[0].verseNumber ?? ''} ص${results[0].page}`));
    }
  }

  // ============ 4. تحقق دقيق من آية الكرسي ============
  console.log(bold('\n4️⃣  تحقق دقيق من نتيجة "2:255"'));
  const kursi = searchQuran('2:255', data);
  if (kursi.length === 1 && kursi[0].surahNumber === 2 && kursi[0].verseNumber === 255) {
    console.log(ok(`آية الكرسي: سورة البقرة 255 → صفحة ${kursi[0].page}`));
    console.log(dim(`   النص: ${kursi[0].verseText?.slice(0, 80)}...`));
  } else {
    console.log(fail(`نتيجة غير متوقعة: ${JSON.stringify(kursi)}`));
  }

  // ============ 5. تحقق من صوت الآيات (التظليل) ============
  console.log(bold('\n5️⃣  تحقق من صوت الآية الواحدة عبر everyayah.com (للتظليل)'));
  const reciter = getReciter('alafasy');
  if (!reciter?.sources.everyayah) {
    console.log(fail('قارئ "alafasy" غير موجود'));
  } else {
    const folder = reciter.sources.everyayah;
    const testCases: [number, number, string][] = [
      [1, 1, 'الفاتحة آية 1 (بسم الله)'],
      [2, 255, 'البقرة 255 (الكرسي)'],
      [36, 1, 'يس آية 1'],
      [112, 1, 'الإخلاص آية 1'],
      [114, 6, 'الناس آية 6 (آخر آية)'],
    ];
    for (const [s, a, desc] of testCases) {
      const url = getVerseAudioUrl(folder, s, a);
      const res = await checkAudioUrl(url);
      console.log(
        (res.ok ? ok : fail)(`${desc}: ${pad(s)}${pad(a)}.mp3 ${res.size ? `(${res.size})` : ''}`)
      );
      if (!res.ok) console.log(dim(`      URL: ${url}`));
    }
  }

  // ============ 6. سيناريو نقرتين على آية (التظليل المتزامن) ============
  console.log(bold('\n6️⃣  محاكاة "نقرتان على آية" — استرداد متتابع'));
  console.log(dim('   المستخدم ينقر على الفاتحة آية 1، يجب أن نسترد الآيات 1-7 ثم البقرة 1'));
  const folder = getReciter('alafasy')!.sources.everyayah!;
  let nextSurah = 1;
  let nextAyah = 1;
  let played = 0;
  for (let i = 0; i < 10 && played < 8; i++) {
    const url = getVerseAudioUrl(folder, nextSurah, nextAyah);
    const res = await checkAudioUrl(url);
    if (res.ok) {
      played++;
      const surahInfo = getSurahByPage(1);
      console.log(
        ok(`الآية ${played}: سورة ${nextSurah} آية ${nextAyah} ${dim(`(${pad(nextSurah)}${pad(nextAyah)}.mp3, ${res.size ?? '?'})`)}`)
      );
    } else {
      console.log(fail(`فشل تحميل ${nextSurah}:${nextAyah}`));
      break;
    }
    // محاكاة nextVerse من VersePlayer
    const surah = data.surahs.find((s) => s.number === nextSurah);
    if (!surah) break;
    if (nextAyah < surah.versesCount) {
      nextAyah++;
    } else {
      nextSurah++;
      nextAyah = 1;
    }
  }

  // ============ 7. صور المصاحف ============
  console.log(bold('\n7️⃣  تحقق من صور المصاحف'));
  for (const page of [1, 50, 300, 604]) {
    const url = `https://raw.githubusercontent.com/SalehGNUTUX/Quran-PNG/master/${pad(page)}.png`;
    const res = await fetch(url, { method: 'HEAD' });
    const size = res.headers.get('content-length');
    console.log(
      (res.ok ? ok : fail)(
        `الصفحة ${page}: ${res.status}${size ? ` (${(parseInt(size, 10) / 1024).toFixed(0)} KB)` : ''}`
      )
    );
  }

  // ============ 8. تحقق من البسملة قبل السور ============
  console.log(bold('\n8️⃣  تحقق من البسملة قبل السور (عدا الفاتحة والتوبة)'));
  // البسملة دائماً = الفاتحة آية 1 لنفس القارئ.
  const basmalaUrl = getVerseAudioUrl(folder, 1, 1);
  const basmalaRes = await checkAudioUrl(basmalaUrl);
  console.log(
    (basmalaRes.ok ? ok : fail)(
      `ملف البسملة (001001.mp3): ${basmalaRes.size ?? 'unknown'} — يُستخدم قبل آية 1 من سور 2, 3, 4, ... 8, 10, ...`
    )
  );
  console.log(dim('   استثناءات: الفاتحة (1) لأن البسملة آيتها الأولى، التوبة (9) لا تبدأ بالبسملة.'));

  console.log(bold('\n════════ انتهى الاختبار ════════\n'));
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
