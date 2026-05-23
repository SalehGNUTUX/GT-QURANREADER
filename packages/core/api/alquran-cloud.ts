// عميل لـ api.alquran.cloud (مصدر النصوص حسب الرواية)
// docs: https://alquran.cloud/api
import type { QuranData, RiwayaId, Surah, Verse } from '../types';
import { getRiwaya } from '../data/riwayat';

const BASE_URL = 'https://api.alquran.cloud/v1';

interface ACAyah {
  number: number; // global
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  sajda?: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

interface ACSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation?: string;
  numberOfAyahs?: number;
  revelationType: 'Meccan' | 'Medinan';
  ayahs: ACAyah[];
}

interface ACResponse {
  code: number;
  status: string;
  data: {
    surahs: ACSurah[];
    edition: { identifier: string; language: string; name: string };
  };
}

/**
 * جلب النص الكامل لرواية. يعيد QuranData موحدة الشكل.
 */
export async function fetchQuranByRiwaya(riwayaId: RiwayaId, signal?: AbortSignal): Promise<QuranData> {
  const riwaya = getRiwaya(riwayaId);
  if (!riwaya) throw new Error(`Unknown riwaya: ${riwayaId}`);

  const url = `${BASE_URL}/quran/${riwaya.apiSlug}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`alquran.cloud HTTP ${res.status}`);

  const json = (await res.json()) as ACResponse;
  if (json.code !== 200) throw new Error(`alquran.cloud error: ${json.status}`);

  // alquran.cloud يُعيد الاسم بصيغة "سُورَةُ الفاتحة" — نزيل البادئة لتجنّب التكرار في الواجهة.
  const stripSurahPrefix = (name: string): string => {
    // إزالة "سُورَةُ " مع التشكيل، ثم "سورة " العادية، من بداية النص.
    return name
      .replace(/^\s*سُورَةُ\s+/, '')
      .replace(/^\s*سورة\s+/, '')
      .trim();
  };

  const surahs: Surah[] = json.data.surahs.map((s) => {
    const verses: Verse[] = s.ayahs.map((a) => {
      const isSajda = typeof a.sajda === 'object' ? Boolean(a.sajda) : Boolean(a.sajda);
      return {
        number: a.numberInSurah,
        text: a.text,
        page: a.page,
        juz: a.juz,
        ...(isSajda ? { sajda: true } : {}),
      };
    });
    return {
      number: s.number,
      name: { ar: stripSurahPrefix(s.name), en: s.englishName },
      versesCount: s.numberOfAyahs ?? s.ayahs.length,
      revelationPlace: s.revelationType === 'Meccan' ? 'مكية' : 'مدنية',
      verses,
    };
  });

  return { riwaya: riwayaId, surahs };
}

/**
 * جلب ترجمة بسلج محدد (مثل en.sahih, ar.muyassar).
 */
export async function fetchTranslation(editionSlug: string, signal?: AbortSignal): Promise<ACResponse> {
  const url = `${BASE_URL}/quran/${editionSlug}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`alquran.cloud HTTP ${res.status}`);
  return (await res.json()) as ACResponse;
}
