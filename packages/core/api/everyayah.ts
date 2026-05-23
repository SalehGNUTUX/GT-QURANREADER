// عميل لـ everyayah.com — صوت لكل آية.
// URL pattern: https://everyayah.com/data/{reciterFolder}/{SSSAAA}.mp3
// SSS = رقم السورة (3 أرقام)، AAA = رقم الآية (3 أرقام).
// مثلاً: https://everyayah.com/data/Alafasy_128kbps/001001.mp3 = الفاتحة آية 1.

const BASE = 'https://everyayah.com/data';

/**
 * يبني URL لصوت آية معينة.
 */
export function getVerseAudioUrl(reciterFolder: string, surah: number, ayah: number): string {
  const surahStr = String(surah).padStart(3, '0');
  const ayahStr = String(ayah).padStart(3, '0');
  return `${BASE}/${reciterFolder}/${surahStr}${ayahStr}.mp3`;
}

/**
 * URL البسملة المنفصلة (للسور بعد التوبة).
 */
export function getBasmalaUrl(reciterFolder: string): string {
  return `${BASE}/${reciterFolder}/001001.mp3`;
}

/**
 * مجلدات القراء المتاحة في everyayah.com (مجموعة منتقاة).
 * تُستخدم في reciter-catalog.
 */
export const EVERYAYAH_RECITERS = {
  // حفص عن عاصم
  Alafasy_128kbps: { name: 'مشاري العفاسي', bitrate: 128 },
  Husary_128kbps: { name: 'محمود خليل الحصري', bitrate: 128 },
  Husary_Mujawwad_128kbps: { name: 'محمود خليل الحصري (مجود)', bitrate: 128 },
  Minshawy_Murattal_128kbps: { name: 'محمد صديق المنشاوي (مرتل)', bitrate: 128 },
  Minshawy_Mujawwad_64kbps: { name: 'محمد صديق المنشاوي (مجود)', bitrate: 64 },
  Abdul_Basit_Murattal_128kbps: { name: 'عبد الباسط عبد الصمد (مرتل)', bitrate: 128 },
  Abdul_Basit_Mujawwad_128kbps: { name: 'عبد الباسط عبد الصمد (مجود)', bitrate: 128 },
  Ghamadi_40kbps: { name: 'سعد الغامدي', bitrate: 40 },
  'Yasser_Ad-Dussary_128kbps': { name: 'ياسر الدوسري', bitrate: 128 },
  'Abu_Bakr_Ash-Shaatree_128kbps': { name: 'أبو بكر الشاطري', bitrate: 128 },
  Muhammad_Ayyoub_128kbps: { name: 'محمد أيوب', bitrate: 128 },
  // ورش عن نافع
  warsh_ibrahim_alakhdar_32kbps: { name: 'إبراهيم الأخضر (ورش)', bitrate: 32 },
  // قالون عن نافع
  Abdul_Basit_Warsh_64kbps: { name: 'عبد الباسط (ورش)', bitrate: 64 },
} as const;
