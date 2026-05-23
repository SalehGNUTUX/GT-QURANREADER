import type { SurahInfo } from '../types';

// 114 سورة مع صفحاتها (مصحف المدينة المنورة - 604 صفحة)
// مأخوذة من EMBEDDED_SURAHS_DATA في النسخة السابقة + إضافة aliases للآيات الشهيرة.
export const SURAHS: SurahInfo[] = [
  { number: 1, name: { ar: 'الفاتحة', en: 'Al-Fatiha' }, versesCount: 7, revelationPlace: 'مكية', startPage: 1, aliases: ['أم الكتاب', 'السبع المثاني'] },
  { number: 2, name: { ar: 'البقرة', en: 'Al-Baqarah' }, versesCount: 286, revelationPlace: 'مدنية', startPage: 2, aliases: ['آية الكرسي', 'سنام القرآن'] },
  { number: 3, name: { ar: 'آل عمران', en: 'Aal-Imran' }, versesCount: 200, revelationPlace: 'مدنية', startPage: 50 },
  { number: 4, name: { ar: 'النساء', en: 'An-Nisa' }, versesCount: 176, revelationPlace: 'مدنية', startPage: 77 },
  { number: 5, name: { ar: 'المائدة', en: "Al-Ma'idah" }, versesCount: 120, revelationPlace: 'مدنية', startPage: 106 },
  { number: 6, name: { ar: 'الأنعام', en: "Al-An'am" }, versesCount: 165, revelationPlace: 'مكية', startPage: 128 },
  { number: 7, name: { ar: 'الأعراف', en: "Al-A'raf" }, versesCount: 206, revelationPlace: 'مكية', startPage: 151 },
  { number: 8, name: { ar: 'الأنفال', en: 'Al-Anfal' }, versesCount: 75, revelationPlace: 'مدنية', startPage: 177 },
  { number: 9, name: { ar: 'التوبة', en: 'At-Tawbah' }, versesCount: 129, revelationPlace: 'مدنية', startPage: 187, aliases: ['براءة'] },
  { number: 10, name: { ar: 'يونس', en: 'Yunus' }, versesCount: 109, revelationPlace: 'مكية', startPage: 208 },
  { number: 11, name: { ar: 'هود', en: 'Hud' }, versesCount: 123, revelationPlace: 'مكية', startPage: 221 },
  { number: 12, name: { ar: 'يوسف', en: 'Yusuf' }, versesCount: 111, revelationPlace: 'مكية', startPage: 235 },
  { number: 13, name: { ar: 'الرعد', en: "Ar-Ra'd" }, versesCount: 43, revelationPlace: 'مدنية', startPage: 249 },
  { number: 14, name: { ar: 'إبراهيم', en: 'Ibrahim' }, versesCount: 52, revelationPlace: 'مكية', startPage: 255 },
  { number: 15, name: { ar: 'الحجر', en: 'Al-Hijr' }, versesCount: 99, revelationPlace: 'مكية', startPage: 262 },
  { number: 16, name: { ar: 'النحل', en: 'An-Nahl' }, versesCount: 128, revelationPlace: 'مكية', startPage: 267 },
  { number: 17, name: { ar: 'الإسراء', en: 'Al-Isra' }, versesCount: 111, revelationPlace: 'مكية', startPage: 282, aliases: ['بني إسرائيل'] },
  { number: 18, name: { ar: 'الكهف', en: 'Al-Kahf' }, versesCount: 110, revelationPlace: 'مكية', startPage: 293 },
  { number: 19, name: { ar: 'مريم', en: 'Maryam' }, versesCount: 98, revelationPlace: 'مكية', startPage: 305 },
  { number: 20, name: { ar: 'طه', en: 'Taha' }, versesCount: 135, revelationPlace: 'مكية', startPage: 312 },
  { number: 21, name: { ar: 'الأنبياء', en: 'Al-Anbiya' }, versesCount: 112, revelationPlace: 'مكية', startPage: 322 },
  { number: 22, name: { ar: 'الحج', en: 'Al-Hajj' }, versesCount: 78, revelationPlace: 'مدنية', startPage: 332 },
  { number: 23, name: { ar: 'المؤمنون', en: "Al-Mu'minun" }, versesCount: 118, revelationPlace: 'مكية', startPage: 342 },
  { number: 24, name: { ar: 'النور', en: 'An-Nur' }, versesCount: 64, revelationPlace: 'مدنية', startPage: 350 },
  { number: 25, name: { ar: 'الفرقان', en: 'Al-Furqan' }, versesCount: 77, revelationPlace: 'مكية', startPage: 359 },
  { number: 26, name: { ar: 'الشعراء', en: "Ash-Shu'ara" }, versesCount: 227, revelationPlace: 'مكية', startPage: 367 },
  { number: 27, name: { ar: 'النمل', en: 'An-Naml' }, versesCount: 93, revelationPlace: 'مكية', startPage: 377 },
  { number: 28, name: { ar: 'القصص', en: 'Al-Qasas' }, versesCount: 88, revelationPlace: 'مكية', startPage: 385 },
  { number: 29, name: { ar: 'العنكبوت', en: 'Al-Ankabut' }, versesCount: 69, revelationPlace: 'مكية', startPage: 396 },
  { number: 30, name: { ar: 'الروم', en: 'Ar-Rum' }, versesCount: 60, revelationPlace: 'مكية', startPage: 404 },
  { number: 31, name: { ar: 'لقمان', en: 'Luqman' }, versesCount: 34, revelationPlace: 'مكية', startPage: 411 },
  { number: 32, name: { ar: 'السجدة', en: 'As-Sajdah' }, versesCount: 30, revelationPlace: 'مكية', startPage: 415 },
  { number: 33, name: { ar: 'الأحزاب', en: 'Al-Ahzab' }, versesCount: 73, revelationPlace: 'مدنية', startPage: 418 },
  { number: 34, name: { ar: 'سبأ', en: 'Saba' }, versesCount: 54, revelationPlace: 'مكية', startPage: 428 },
  { number: 35, name: { ar: 'فاطر', en: 'Fatir' }, versesCount: 45, revelationPlace: 'مكية', startPage: 434 },
  { number: 36, name: { ar: 'يس', en: 'Ya-Sin' }, versesCount: 83, revelationPlace: 'مكية', startPage: 440, aliases: ['قلب القرآن'] },
  { number: 37, name: { ar: 'الصافات', en: 'As-Saffat' }, versesCount: 182, revelationPlace: 'مكية', startPage: 446 },
  { number: 38, name: { ar: 'ص', en: 'Sad' }, versesCount: 88, revelationPlace: 'مكية', startPage: 453 },
  { number: 39, name: { ar: 'الزمر', en: 'Az-Zumar' }, versesCount: 75, revelationPlace: 'مكية', startPage: 458 },
  { number: 40, name: { ar: 'غافر', en: 'Ghafir' }, versesCount: 85, revelationPlace: 'مكية', startPage: 467, aliases: ['المؤمن'] },
  { number: 41, name: { ar: 'فصلت', en: 'Fussilat' }, versesCount: 54, revelationPlace: 'مكية', startPage: 477, aliases: ['حم السجدة'] },
  { number: 42, name: { ar: 'الشورى', en: 'Ash-Shura' }, versesCount: 53, revelationPlace: 'مكية', startPage: 483 },
  { number: 43, name: { ar: 'الزخرف', en: 'Az-Zukhruf' }, versesCount: 89, revelationPlace: 'مكية', startPage: 489 },
  { number: 44, name: { ar: 'الدخان', en: 'Ad-Dukhan' }, versesCount: 59, revelationPlace: 'مكية', startPage: 496 },
  { number: 45, name: { ar: 'الجاثية', en: 'Al-Jathiyah' }, versesCount: 37, revelationPlace: 'مكية', startPage: 499 },
  { number: 46, name: { ar: 'الأحقاف', en: 'Al-Ahqaf' }, versesCount: 35, revelationPlace: 'مكية', startPage: 502 },
  { number: 47, name: { ar: 'محمد', en: 'Muhammad' }, versesCount: 38, revelationPlace: 'مدنية', startPage: 507, aliases: ['القتال'] },
  { number: 48, name: { ar: 'الفتح', en: 'Al-Fath' }, versesCount: 29, revelationPlace: 'مدنية', startPage: 511 },
  { number: 49, name: { ar: 'الحجرات', en: 'Al-Hujurat' }, versesCount: 18, revelationPlace: 'مدنية', startPage: 515 },
  { number: 50, name: { ar: 'ق', en: 'Qaf' }, versesCount: 45, revelationPlace: 'مكية', startPage: 518 },
  { number: 51, name: { ar: 'الذاريات', en: 'Adh-Dhariyat' }, versesCount: 60, revelationPlace: 'مكية', startPage: 520 },
  { number: 52, name: { ar: 'الطور', en: 'At-Tur' }, versesCount: 49, revelationPlace: 'مكية', startPage: 523 },
  { number: 53, name: { ar: 'النجم', en: 'An-Najm' }, versesCount: 62, revelationPlace: 'مكية', startPage: 526 },
  { number: 54, name: { ar: 'القمر', en: 'Al-Qamar' }, versesCount: 55, revelationPlace: 'مكية', startPage: 528 },
  { number: 55, name: { ar: 'الرحمن', en: 'Ar-Rahman' }, versesCount: 78, revelationPlace: 'مدنية', startPage: 531, aliases: ['عروس القرآن'] },
  { number: 56, name: { ar: 'الواقعة', en: "Al-Waqi'ah" }, versesCount: 96, revelationPlace: 'مكية', startPage: 534 },
  { number: 57, name: { ar: 'الحديد', en: 'Al-Hadid' }, versesCount: 29, revelationPlace: 'مدنية', startPage: 537 },
  { number: 58, name: { ar: 'المجادلة', en: 'Al-Mujadilah' }, versesCount: 22, revelationPlace: 'مدنية', startPage: 542 },
  { number: 59, name: { ar: 'الحشر', en: 'Al-Hashr' }, versesCount: 24, revelationPlace: 'مدنية', startPage: 545 },
  { number: 60, name: { ar: 'الممتحنة', en: 'Al-Mumtahanah' }, versesCount: 13, revelationPlace: 'مدنية', startPage: 549 },
  { number: 61, name: { ar: 'الصف', en: 'As-Saff' }, versesCount: 14, revelationPlace: 'مدنية', startPage: 551 },
  { number: 62, name: { ar: 'الجمعة', en: "Al-Jumu'ah" }, versesCount: 11, revelationPlace: 'مدنية', startPage: 553 },
  { number: 63, name: { ar: 'المنافقون', en: 'Al-Munafiqun' }, versesCount: 11, revelationPlace: 'مدنية', startPage: 554 },
  { number: 64, name: { ar: 'التغابن', en: 'At-Taghabun' }, versesCount: 18, revelationPlace: 'مدنية', startPage: 556 },
  { number: 65, name: { ar: 'الطلاق', en: 'At-Talaq' }, versesCount: 12, revelationPlace: 'مدنية', startPage: 558 },
  { number: 66, name: { ar: 'التحريم', en: 'At-Tahrim' }, versesCount: 12, revelationPlace: 'مدنية', startPage: 560 },
  { number: 67, name: { ar: 'الملك', en: 'Al-Mulk' }, versesCount: 30, revelationPlace: 'مكية', startPage: 562, aliases: ['تبارك', 'المنجية'] },
  { number: 68, name: { ar: 'القلم', en: 'Al-Qalam' }, versesCount: 52, revelationPlace: 'مكية', startPage: 564 },
  { number: 69, name: { ar: 'الحاقة', en: 'Al-Haqqah' }, versesCount: 52, revelationPlace: 'مكية', startPage: 566 },
  { number: 70, name: { ar: 'المعارج', en: "Al-Ma'arij" }, versesCount: 44, revelationPlace: 'مكية', startPage: 568 },
  { number: 71, name: { ar: 'نوح', en: 'Nuh' }, versesCount: 28, revelationPlace: 'مكية', startPage: 570 },
  { number: 72, name: { ar: 'الجن', en: 'Al-Jinn' }, versesCount: 28, revelationPlace: 'مكية', startPage: 572 },
  { number: 73, name: { ar: 'المزمل', en: 'Al-Muzzammil' }, versesCount: 20, revelationPlace: 'مكية', startPage: 574 },
  { number: 74, name: { ar: 'المدثر', en: 'Al-Muddathir' }, versesCount: 56, revelationPlace: 'مكية', startPage: 575 },
  { number: 75, name: { ar: 'القيامة', en: 'Al-Qiyamah' }, versesCount: 40, revelationPlace: 'مكية', startPage: 577 },
  { number: 76, name: { ar: 'الإنسان', en: 'Al-Insan' }, versesCount: 31, revelationPlace: 'مدنية', startPage: 578, aliases: ['الدهر'] },
  { number: 77, name: { ar: 'المرسلات', en: 'Al-Mursalat' }, versesCount: 50, revelationPlace: 'مكية', startPage: 580 },
  { number: 78, name: { ar: 'النبأ', en: 'An-Naba' }, versesCount: 40, revelationPlace: 'مكية', startPage: 582, aliases: ['عم'] },
  { number: 79, name: { ar: 'النازعات', en: "An-Nazi'at" }, versesCount: 46, revelationPlace: 'مكية', startPage: 583 },
  { number: 80, name: { ar: 'عبس', en: 'Abasa' }, versesCount: 42, revelationPlace: 'مكية', startPage: 585 },
  { number: 81, name: { ar: 'التكوير', en: 'At-Takwir' }, versesCount: 29, revelationPlace: 'مكية', startPage: 586 },
  { number: 82, name: { ar: 'الإنفطار', en: 'Al-Infitar' }, versesCount: 19, revelationPlace: 'مكية', startPage: 587 },
  { number: 83, name: { ar: 'المطففين', en: 'Al-Mutaffifin' }, versesCount: 36, revelationPlace: 'مكية', startPage: 587 },
  { number: 84, name: { ar: 'الانشقاق', en: 'Al-Inshiqaq' }, versesCount: 25, revelationPlace: 'مكية', startPage: 589 },
  { number: 85, name: { ar: 'البروج', en: 'Al-Buruj' }, versesCount: 22, revelationPlace: 'مكية', startPage: 590 },
  { number: 86, name: { ar: 'الطارق', en: 'At-Tariq' }, versesCount: 17, revelationPlace: 'مكية', startPage: 591 },
  { number: 87, name: { ar: 'الأعلى', en: "Al-A'la" }, versesCount: 19, revelationPlace: 'مكية', startPage: 591 },
  { number: 88, name: { ar: 'الغاشية', en: 'Al-Ghashiyah' }, versesCount: 26, revelationPlace: 'مكية', startPage: 592 },
  { number: 89, name: { ar: 'الفجر', en: 'Al-Fajr' }, versesCount: 30, revelationPlace: 'مكية', startPage: 593 },
  { number: 90, name: { ar: 'البلد', en: 'Al-Balad' }, versesCount: 20, revelationPlace: 'مكية', startPage: 594 },
  { number: 91, name: { ar: 'الشمس', en: 'Ash-Shams' }, versesCount: 15, revelationPlace: 'مكية', startPage: 595 },
  { number: 92, name: { ar: 'الليل', en: 'Al-Layl' }, versesCount: 21, revelationPlace: 'مكية', startPage: 595 },
  { number: 93, name: { ar: 'الضحى', en: 'Ad-Duha' }, versesCount: 11, revelationPlace: 'مكية', startPage: 596 },
  { number: 94, name: { ar: 'الشرح', en: 'Ash-Sharh' }, versesCount: 8, revelationPlace: 'مكية', startPage: 596, aliases: ['الانشراح'] },
  { number: 95, name: { ar: 'التين', en: 'At-Tin' }, versesCount: 8, revelationPlace: 'مكية', startPage: 597 },
  { number: 96, name: { ar: 'العلق', en: 'Al-Alaq' }, versesCount: 19, revelationPlace: 'مكية', startPage: 597, aliases: ['اقرأ'] },
  { number: 97, name: { ar: 'القدر', en: 'Al-Qadr' }, versesCount: 5, revelationPlace: 'مكية', startPage: 598 },
  { number: 98, name: { ar: 'البينة', en: 'Al-Bayyinah' }, versesCount: 8, revelationPlace: 'مدنية', startPage: 598 },
  { number: 99, name: { ar: 'الزلزلة', en: 'Az-Zalzalah' }, versesCount: 8, revelationPlace: 'مدنية', startPage: 599 },
  { number: 100, name: { ar: 'العاديات', en: 'Al-Adiyat' }, versesCount: 11, revelationPlace: 'مكية', startPage: 599 },
  { number: 101, name: { ar: 'القارعة', en: "Al-Qari'ah" }, versesCount: 11, revelationPlace: 'مكية', startPage: 600 },
  { number: 102, name: { ar: 'التكاثر', en: 'At-Takathur' }, versesCount: 8, revelationPlace: 'مكية', startPage: 600, aliases: ['ألهاكم'] },
  { number: 103, name: { ar: 'العصر', en: 'Al-Asr' }, versesCount: 3, revelationPlace: 'مكية', startPage: 601 },
  { number: 104, name: { ar: 'الهمزة', en: 'Al-Humazah' }, versesCount: 9, revelationPlace: 'مكية', startPage: 601 },
  { number: 105, name: { ar: 'الفيل', en: 'Al-Fil' }, versesCount: 5, revelationPlace: 'مكية', startPage: 601 },
  { number: 106, name: { ar: 'قريش', en: 'Quraysh' }, versesCount: 4, revelationPlace: 'مكية', startPage: 602 },
  { number: 107, name: { ar: 'الماعون', en: "Al-Ma'un" }, versesCount: 7, revelationPlace: 'مكية', startPage: 602, aliases: ['الدين', 'أرأيت'] },
  { number: 108, name: { ar: 'الكوثر', en: 'Al-Kawthar' }, versesCount: 3, revelationPlace: 'مكية', startPage: 602 },
  { number: 109, name: { ar: 'الكافرون', en: 'Al-Kafirun' }, versesCount: 6, revelationPlace: 'مكية', startPage: 603 },
  { number: 110, name: { ar: 'النصر', en: 'An-Nasr' }, versesCount: 3, revelationPlace: 'مدنية', startPage: 603, aliases: ['التوديع'] },
  { number: 111, name: { ar: 'المسد', en: 'Al-Masad' }, versesCount: 5, revelationPlace: 'مكية', startPage: 603, aliases: ['تبت', 'اللهب'] },
  { number: 112, name: { ar: 'الإخلاص', en: 'Al-Ikhlas' }, versesCount: 4, revelationPlace: 'مكية', startPage: 604, aliases: ['التوحيد', 'الأساس'] },
  { number: 113, name: { ar: 'الفلق', en: 'Al-Falaq' }, versesCount: 5, revelationPlace: 'مكية', startPage: 604, aliases: ['المعوذة الأولى'] },
  { number: 114, name: { ar: 'الناس', en: 'An-Nas' }, versesCount: 6, revelationPlace: 'مكية', startPage: 604, aliases: ['المعوذة الثانية', 'المعوذتان'] },
];

export function getSurahByNumber(num: number): SurahInfo | undefined {
  return SURAHS.find((s) => s.number === num);
}

export function getSurahByPage(page: number): SurahInfo {
  for (let i = SURAHS.length - 1; i >= 0; i--) {
    if (SURAHS[i].startPage <= page) return SURAHS[i];
  }
  return SURAHS[0];
}

export function getSurahByName(name: string): SurahInfo | undefined {
  const trimmed = name.trim();
  return SURAHS.find(
    (s) =>
      s.name.ar === trimmed ||
      s.name.en.toLowerCase() === trimmed.toLowerCase() ||
      (s.aliases && s.aliases.some((a) => a === trimmed))
  );
}

export const TOTAL_PAGES = 604;
export const TOTAL_SURAHS = 114;
