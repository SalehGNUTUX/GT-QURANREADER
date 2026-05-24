import type { Bookmark, UserPreferences } from '../types';

const STORAGE_KEY = 'gt-quranreader:prefs';

/**
 * إصدار schema التفضيلات. زدها بـ +1 كل مرة تُغيَّر القيم الافتراضية أو
 * تُضاف حقول جديدة تريد أن تأخذ قيمتها الجديدة لكل المستخدمين تلقائياً.
 *
 * إصدار 1: حفص + العفاسي افتراضياً، enableVerseHighlight=false.
 * إصدار 2: ورش + عبد الباسط الورشي، enableVerseHighlight=true.
 * إصدار 3: viewMode='text' افتراضياً + lastStoppedAt لاستعادة الموضع.
 * إصدار 4: theme='auto' افتراضياً + إضافة وضع 'gold'.
 * إصدار 5: theme='gold' افتراضياً.
 * إصدار 6: ibrahim-aldosary-warsh افتراضياً (عبد الباسط حُذف لترقيمه غير القياسي).
 * إصدار 7: إضافة lastReadAt — علامة موضع القراءة اليدوية (مستقلة عن lastStoppedAt للصوت).
 * إصدار 8: إضافة lastReadPage — صفحة آخر قراءة (تلقائية، تُحفَظ عند التنقل بلا صوت).
 * إصدار 9: إضافة volume (0..1) — مستوى صوت القارئ.
 */
export const PREFS_SCHEMA_VERSION = 9;

export const DEFAULT_PREFERENCES: UserPreferences = {
  riwaya: 'warsh',
  reciterId: 'ibrahim-aldosary-warsh',
  fontId: 'AmiriQuran',
  fontSize: 100,
  viewMode: 'text',
  theme: 'gold',
  enableVerseHighlight: true,
  autoPlayNext: true,
  currentPage: 1,
  bookmarks: [],
  lastStoppedAt: null,
  lastReadAt: null,
  lastReadPage: 1,
  volume: 1.0,
  schemaVersion: PREFS_SCHEMA_VERSION,
};

/**
 * واجهة موحدة لتخزين التفضيلات.
 * - في المتصفح/Web: تستخدم localStorage مباشرة.
 * - في Electron: يمكن للـ main process تمرير adapter مختلف لاحقاً.
 */
export interface PreferencesStorage {
  load(): Promise<UserPreferences>;
  save(prefs: UserPreferences): Promise<void>;
  reset(): Promise<UserPreferences>;
}

export class LocalStoragePreferences implements PreferencesStorage {
  async load(): Promise<UserPreferences> {
    if (typeof localStorage === 'undefined') return DEFAULT_PREFERENCES;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_PREFERENCES;
      const parsed = JSON.parse(raw) as Partial<UserPreferences>;
      // إذا اختلف إصدار الـ schema، نتجاهل القديم ونستخدم الافتراضيات الجديدة.
      // هذا يضمن أن تحديثات الافتراضيات تظهر للمستخدمين دون أن يضطروا للمسح يدوياً.
      if (parsed.schemaVersion !== PREFS_SCHEMA_VERSION) {
        const fresh = { ...DEFAULT_PREFERENCES };
        // نحتفظ بـ bookmarks لأنها بيانات المستخدم، لا قيم افتراضية.
        if (Array.isArray(parsed.bookmarks)) fresh.bookmarks = parsed.bookmarks;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        return fresh;
      }
      return { ...DEFAULT_PREFERENCES, ...parsed };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  async save(prefs: UserPreferences): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }

  async reset(): Promise<UserPreferences> {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    return DEFAULT_PREFERENCES;
  }
}

export function makeBookmark(surah: number, page: number, ayah?: number, label?: string): Bookmark {
  return {
    id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    surah,
    ...(ayah !== undefined ? { ayah } : {}),
    page,
    ...(label ? { label } : {}),
    createdAt: Date.now(),
  };
}
