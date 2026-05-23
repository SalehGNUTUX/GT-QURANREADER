// عميل لـ mp3quran.net — سور كاملة (للوضع التقليدي بدون تظليل).

const BASE = 'https://server8.mp3quran.net';

/**
 * يبني URL لسورة كاملة.
 */
export function getFullSurahUrl(reciterFolder: string, surah: number): string {
  const surahStr = String(surah).padStart(3, '0');
  return `${BASE}/${reciterFolder}/${surahStr}.mp3`;
}

export const MP3QURAN_RECITERS = {
  afs: { name: 'مشاري العفاسي' },
  husr: { name: 'محمود خليل الحصري' },
  minsh: { name: 'محمد صديق المنشاوي' },
  basit: { name: 'عبد الباسط عبد الصمد' },
  ghamdi: { name: 'سعد الغامدي' },
  ajm: { name: 'أبو بكر الشاطري' },
};

/** صور صفحات المصحف من Quran-PNG. */
export function getQuranPngUrl(page: number): string {
  const pageStr = String(page).padStart(3, '0');
  return `https://raw.githubusercontent.com/SalehGNUTUX/Quran-PNG/master/${pageStr}.png`;
}

export const ALTERNATIVE_IMAGE_SOURCES = (page: number): string[] => {
  const pageStr = String(page).padStart(3, '0');
  return [
    `https://quranpages.github.io/pages/page_${pageStr}.png`,
    `https://www.everyayah.com/data/images_png/${pageStr}.png`,
    `https://raw.githubusercontent.com/risan/quran-images/master/images/${pageStr}.png`,
  ];
};
