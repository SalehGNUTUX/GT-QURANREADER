// تطبيع نص عربي قوي للبحث.
// الهدف: يتطابق "الرحمن" / "الرحمان" / "ٱلرَّحْمَٰنِ" / "الرحمٰن" بعد التطبيع.

const ARABIC_INDIC_DIGITS: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

/**
 * تطبيع كامل للبحث: يزيل الهمزات والتشكيل والتطويل،
 * ويوحّد الياء/التاء المربوطة/الألف المقصورة،
 * ويحوّل الأرقام العربية إلى لاتينية.
 */
export function normalizeForSearch(text: string): string {
  if (!text) return '';
  let out = text;

  // 1. توحيد كل أشكال الألف والهمزة → إزالتها
  // U+0621 ء, U+0622 آ, U+0623 أ, U+0625 إ, U+0671 ٱ, U+0627 ا, U+0670 ٰ
  out = out.replace(/[ءآأإٱاٰ]/g, '');

  // 2. إزالة التشكيل (حركات + تنوين + شدة + سكون)
  // U+064B إلى U+0652
  out = out.normalize('NFD').replace(/[ً-ْ]/g, '');

  // 3. توحيد الياء (ى → ي) والتاء المربوطة (ة → ه)
  out = out.replace(/ى/g, 'ي'); // ى → ي
  out = out.replace(/ة/g, 'ه'); // ة → ه

  // 4. إزالة الواو/الياء الصغرى (U+06E5/U+06E6)
  out = out.replace(/[ۥۦ]/g, '');

  // 5. إزالة التطويل (ـ)
  out = out.replace(/ـ/g, '');

  // 6. الأرقام العربية → لاتينية
  out = out.replace(/[٠-٩]/g, (d) => ARABIC_INDIC_DIGITS[d] ?? d);

  // 7. توحيد المسافات
  out = out.replace(/\s+/g, ' ').trim().toLowerCase();

  return out;
}

/** نسخة خفيفة للتطابق الجزئي (لا تزيل الهمزة، فقط التشكيل والتطويل). */
export function normalizeLight(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** فاصل كلمات عربي. */
const ARABIC_WORD_CHAR = /[؀-ۿݐ-ݿࢠ-ࣿ0-9]/;

export function isWordBoundary(ch: string | undefined): boolean {
  if (!ch) return true;
  return !ARABIC_WORD_CHAR.test(ch);
}

/** إيجاد جميع مواقع التطابق في نص بحدود كلمة. */
export function findWordMatches(haystack: string, needle: string): number[] {
  if (!needle) return [];
  const positions: number[] = [];
  let idx = haystack.indexOf(needle);
  while (idx !== -1) {
    const before = idx > 0 ? haystack[idx - 1] : undefined;
    const after = idx + needle.length < haystack.length ? haystack[idx + needle.length] : undefined;
    if (isWordBoundary(before) && isWordBoundary(after)) {
      positions.push(idx);
    }
    idx = haystack.indexOf(needle, idx + 1);
  }
  return positions;
}

const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};

export function escapeHtml(text: string): string {
  return String(text).replace(/[&<>"']/g, (c) => HTML_ESCAPE[c] ?? c);
}

/** يبني RegExp يطابق الكلمة مع السماح بالتشكيل/التطويل بين أحرفها. */
export function buildLoosePattern(query: string): string {
  const DIACRITICS = '[\\u064b-\\u0652\\u0670\\u0640]';
  const chars = Array.from(query).map((ch) => {
    if (ch === ' ') return '\\s+';
    return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });
  return chars.join(`${DIACRITICS}*`);
}

/** تظليل المطابقات في النص الأصلي (يحتفظ بالتشكيل). */
export function highlightMatches(text: string, query: string): string {
  const safeText = escapeHtml(text);
  if (!query.trim()) return safeText;

  const wordChar = '[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF0-9]';
  const pattern = buildLoosePattern(query.trim());
  try {
    const re = new RegExp(`(^|[^${wordChar}])(${pattern})(?=[^${wordChar}]|$)`, 'giu');
    return safeText.replace(re, (_full, pre, match) => `${pre}<mark>${match}</mark>`);
  } catch {
    return safeText;
  }
}
