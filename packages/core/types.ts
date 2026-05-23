// النواة المشتركة — أنواع بيانات GT-QURANREADER v4
// لا يستورد هذا الملف أي شيء من React / DOM / Node.

export type RiwayaId = 'hafs' | 'warsh' | 'qaloon' | 'aldoori';

export interface RiwayaInfo {
  id: RiwayaId;
  name: { ar: string; en: string };
  fullName: { ar: string; en: string };
  apiSlug: string; // alquran.cloud edition slug
  defaultFont: string;
}

export interface SurahInfo {
  number: number;
  name: { ar: string; en: string };
  versesCount: number;
  revelationPlace: 'مكية' | 'مدنية';
  startPage: number;
  aliases?: string[]; // أسماء بديلة شهيرة
}

export interface JuzInfo {
  number: number;
  startPage: number;
  startSurah: number;
  startVerse: number;
}

export interface SajdaInfo {
  surah: number;
  ayah: number;
  page: number;
  type: 'واجبة' | 'مستحبة';
}

export interface Verse {
  number: number; // رقم الآية ضمن السورة
  text: string;
  page: number;
  juz: number;
  sajda?: boolean;
}

export interface Surah {
  number: number;
  name: { ar: string; en: string };
  versesCount: number;
  revelationPlace: 'مكية' | 'مدنية';
  verses: Verse[];
}

export interface QuranData {
  riwaya: RiwayaId;
  surahs: Surah[];
}

export interface Reciter {
  id: string;
  name: { ar: string; en: string };
  style: 'مجود' | 'حدر' | 'ترتيل';
  riwaya: RiwayaId;
  sources: {
    everyayah?: string; // اسم المجلد في everyayah.com/data/
    mp3quran?: string; // اسم المجلد في mp3quran.net (للسور الكاملة)
  };
  /**
   * URL خاص للبسملة إن كان القارئ لا يحوي بسملة في ملف الفاتحة 001001.
   * عند تحديده، التطبيق يتجاهل ملف الفاتحة 001001 كمصدر للبسملة.
   */
  basmalaUrl?: string;
  /**
   * إذا كانت ملفات السور (002001, 003001, ...) **تحتوي البسملة بالفعل** ضمن آية 1،
   * يُستخدم `basmalaUrl` فقط لسورة الفاتحة (لأن ملفها 001001 لا يحوي البسملة).
   */
  surahFilesIncludeBasmala?: boolean;
  /**
   * لا تُدرج أي بسملة قبل أي سورة لهذا القارئ — ملفاته تحوي ما يلزم بالفعل.
   */
  noBasmala?: boolean;
  /**
   * عدد الثواني التي يجب تخطّيها من بداية ملف الآية الأولى من السور (≠ الفاتحة، ≠ التوبة).
   * مفيد للقراء الذين تتضمّن ملفات `SSS001.mp3` بسملةً مدمجة قبل الآية الفعلية — نشغّل
   * بسملة خارجية ثم نقفز إلى موضع الآية في الملف. تطبيقياً ~5 ثوان لعبد الباسط الورشي.
   */
  firstAyahOffsetSeconds?: number;
}

export interface FontInfo {
  id: string;
  name: string;
  family: string; // CSS font-family
  file?: string; // مسار الملف داخل /fonts/
  riwayaPreference?: RiwayaId[]; // الروايات المناسبة لهذا الخط
}

export type ViewMode = 'image' | 'text';

export interface SearchResult {
  type: 'verse' | 'surah' | 'juz' | 'page' | 'sajda';
  surahNumber?: number;
  surahName?: string;
  verseNumber?: number;
  verseText?: string;
  juzNumber?: number;
  page: number;
  matchedText?: string;
  score?: number;
}

export interface VerseRef {
  surah: number;
  ayah: number;
}

export interface UserPreferences {
  riwaya: RiwayaId;
  reciterId: string;
  fontId: string;
  fontSize: number; // 80-200 (نسبة %)
  viewMode: ViewMode;
  theme: 'dark' | 'light' | 'sepia' | 'gold' | 'auto';
  enableVerseHighlight: boolean;
  autoPlayNext: boolean;
  currentPage: number;
  bookmarks: Bookmark[];
  /** آخر آية كانت مظللة/متوقفة عندها القراءة (يُسترد عند فتح التطبيق). */
  lastStoppedAt: VerseRef | null;
  /** يُستخدم لإجبار تطبيق الإعدادات الافتراضية الجديدة عند ترقية schema. */
  schemaVersion: number;
}

export interface Bookmark {
  id: string;
  surah: number;
  ayah?: number;
  page: number;
  label?: string;
  createdAt: number;
}

export interface DownloadJob {
  id: string;
  type: 'riwaya-text' | 'reciter-audio' | 'images-all';
  payload: {
    riwaya?: RiwayaId;
    reciterId?: string;
    surahs?: number[]; // إذا فارغة = كل السور
  };
}

export interface DownloadProgress {
  jobId: string;
  current: number;
  total: number;
  bytesDownloaded: number;
  totalBytes?: number;
  status: 'pending' | 'downloading' | 'completed' | 'cancelled' | 'error';
  error?: string;
}
