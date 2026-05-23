import type { QuranData, SearchResult, SurahInfo } from '../types';
import { SURAHS, getSurahByName, getSurahByNumber, TOTAL_PAGES, TOTAL_SURAHS } from '../data/surahs';
import { JUZ_DATA, getJuzByNumber, TOTAL_JUZ } from '../data/juz-pages';
import { findWordMatches, normalizeForSearch } from './normalize';

// أنماط البحث المخصصة (آية الكرسي، آية الدين، ...).
const FAMOUS_VERSE_ALIASES: Record<string, { surah: number; ayah: number }> = {
  'اية الكرسي': { surah: 2, ayah: 255 },
  'آية الكرسي': { surah: 2, ayah: 255 },
  'الكرسي': { surah: 2, ayah: 255 },
  'اية الدين': { surah: 2, ayah: 282 },
  'آية الدين': { surah: 2, ayah: 282 },
  'الفاتحه': { surah: 1, ayah: 1 },
  'الفاتحة': { surah: 1, ayah: 1 },
};

/**
 * استخراج "سورة:آية" أو "س:آ" أو "2:255" من النص.
 */
function tryParseVerseRef(query: string): { surah: number; ayah: number } | null {
  const m = query.match(/^\s*(\d+)\s*[:\-،]\s*(\d+)\s*$/);
  if (m) return { surah: parseInt(m[1], 10), ayah: parseInt(m[2], 10) };
  return null;
}

function tryParsePageRef(query: string): number | null {
  const m = query.match(/^\s*(?:ص|صفحة|page|p)\s*[.:\s]*(\d+)\s*$/i);
  if (m) {
    const p = parseInt(m[1], 10);
    if (p >= 1 && p <= TOTAL_PAGES) return p;
  }
  return null;
}

function tryParseJuzRef(query: string): number | null {
  const m = query.match(/^\s*(?:جزء|الجزء|juz)\s*[.:\s]*(\d+)\s*$/i);
  if (m) {
    const j = parseInt(m[1], 10);
    if (j >= 1 && j <= TOTAL_JUZ) return j;
  }
  return null;
}

function searchSurahsByName(normalizedQuery: string): SurahInfo[] {
  const results: SurahInfo[] = [];
  for (const surah of SURAHS) {
    const arNorm = normalizeForSearch(surah.name.ar);
    const enNorm = surah.name.en.toLowerCase();
    if (arNorm === normalizedQuery || enNorm === normalizedQuery) {
      results.push(surah);
      continue;
    }
    if (arNorm.includes(normalizedQuery) || enNorm.includes(normalizedQuery)) {
      results.push(surah);
      continue;
    }
    if (surah.aliases) {
      for (const alias of surah.aliases) {
        if (normalizeForSearch(alias).includes(normalizedQuery)) {
          results.push(surah);
          break;
        }
      }
    }
  }
  return results;
}

/**
 * البحث الموحَّد. يفهم:
 * - أرقام آيات (2:255 / 2-255 / 2،255)
 * - "صفحة 100" / "ص 100" / "page 100"
 * - "جزء 30" / "الجزء 30"
 * - أسماء سور بالعربية والإنجليزية والكنى (الكرسي/آية الكرسي/...)
 * - كلمات/عبارات في النص (مع التطبيع)
 */
export function searchQuran(query: string, quranData: QuranData | null): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const results: SearchResult[] = [];

  // 1. مرجع آية (2:255)
  const verseRef = tryParseVerseRef(trimmed);
  if (verseRef) {
    const surah = getSurahByNumber(verseRef.surah);
    if (surah && verseRef.ayah <= surah.versesCount) {
      const verseText = quranData?.surahs
        .find((s) => s.number === surah.number)
        ?.verses.find((v) => v.number === verseRef.ayah);
      results.push({
        type: 'verse',
        surahNumber: surah.number,
        surahName: surah.name.ar,
        verseNumber: verseRef.ayah,
        verseText: verseText?.text,
        page: verseText?.page ?? surah.startPage,
        score: 100,
      });
      return results;
    }
  }

  // 2. مرجع صفحة
  const pageRef = tryParsePageRef(trimmed);
  if (pageRef) {
    results.push({ type: 'page', page: pageRef, score: 100 });
    return results;
  }

  // 3. مرجع جزء
  const juzRef = tryParseJuzRef(trimmed);
  if (juzRef) {
    const juz = getJuzByNumber(juzRef);
    if (juz) {
      results.push({ type: 'juz', juzNumber: juz.number, page: juz.startPage, score: 100 });
      return results;
    }
  }

  const normalizedQuery = normalizeForSearch(trimmed);
  if (!normalizedQuery) return results;

  // 4. كنية آية شهيرة
  const aliasMatch = FAMOUS_VERSE_ALIASES[trimmed] ?? FAMOUS_VERSE_ALIASES[normalizedQuery];
  if (aliasMatch) {
    const surah = getSurahByNumber(aliasMatch.surah);
    const verseText = quranData?.surahs
      .find((s) => s.number === aliasMatch.surah)
      ?.verses.find((v) => v.number === aliasMatch.ayah);
    if (surah) {
      results.push({
        type: 'verse',
        surahNumber: aliasMatch.surah,
        surahName: surah.name.ar,
        verseNumber: aliasMatch.ayah,
        verseText: verseText?.text,
        page: verseText?.page ?? surah.startPage,
        score: 95,
      });
    }
  }

  // 5. مطابقة أسماء السور
  const surahMatches = searchSurahsByName(normalizedQuery);
  for (const surah of surahMatches) {
    results.push({
      type: 'surah',
      surahNumber: surah.number,
      surahName: surah.name.ar,
      page: surah.startPage,
      score: 90,
    });
  }

  // 6. البحث في النص (إذا توفر)
  if (quranData) {
    for (const surah of quranData.surahs) {
      for (const verse of surah.verses) {
        const normalizedText = normalizeForSearch(verse.text);
        const positions = findWordMatches(normalizedText, normalizedQuery);
        if (positions.length > 0) {
          results.push({
            type: 'verse',
            surahNumber: surah.number,
            surahName: surah.name.ar,
            verseNumber: verse.number,
            verseText: verse.text,
            page: verse.page,
            matchedText: normalizedQuery,
            score: 50 + Math.min(positions.length * 5, 30),
          });
        }
      }
    }
  }

  // ترتيب بالأولوية: score تنازلياً ثم رقم السورة تصاعدياً
  results.sort((a, b) => {
    if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
    if ((a.surahNumber ?? 0) !== (b.surahNumber ?? 0)) {
      return (a.surahNumber ?? 0) - (b.surahNumber ?? 0);
    }
    return (a.verseNumber ?? 0) - (b.verseNumber ?? 0);
  });

  return results;
}

export { getSurahByName };
