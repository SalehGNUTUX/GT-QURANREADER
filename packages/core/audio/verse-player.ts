// VersePlayer — يدير تشغيل الآيات المتتابع مع callback عند كل تغيير آية.
// لا يعتمد على DOM إلا عبر HTMLAudioElement (متوفر في المتصفح و Electron).
import { getVerseAudioUrl } from '../api/everyayah';
import { getReciter } from './reciter-catalog';
import { getSurahByNumber } from '../data/surahs';

export interface VersePosition {
  surah: number;
  ayah: number;
}

export interface VersePlayerOptions {
  reciterId: string;
  autoNextVerse?: boolean; // تابع التتابع داخل السورة (افتراضياً نعم)
  autoNextSurah?: boolean; // عند انتهاء السورة انتقل للتالية (افتراضياً نعم)
  resolveLocalUrl?: (reciterId: string, surah: number, ayah: number) => Promise<string | null>;
}

export interface VersePlayerCallbacks {
  onVerseChange?: (pos: VersePosition) => void;
  onPlayStateChange?: (playing: boolean) => void;
  onSurahChange?: (surah: number) => void;
  onEnd?: () => void;
  onError?: (err: Error) => void;
}

// أخطاء طبيعية يجب تجاهلها (تحدث عند مقاطعة play() بـ pause() أو تغيير src).
function isBenignAudioError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.name === 'AbortError' || /interrupted|aborted/i.test(err.message);
}

// نحضّر آيتين قادمتين لتقليل الفجوة بين الآيات إلى أدنى حد.
const PRELOAD_COUNT = 2;

// السور التي لا تبدأ بالبسملة:
// 1 = الفاتحة (البسملة هي آيتها الأولى أصلاً).
// 9 = التوبة (لا تبدأ بالبسملة شرعاً).
const SURAHS_WITHOUT_BASMALA = new Set([1, 9]);

export class VersePlayer {
  private audio: HTMLAudioElement;
  private current: VersePosition | null = null;
  private preloadAudios: HTMLAudioElement[] = [];
  private opts: VersePlayerOptions;
  private cb: VersePlayerCallbacks;
  private playToken = 0; // يحدّد إصدار play لكشف المقاطعات
  // عند تشغيل البسملة، نحفظ الآية التي ستُشغَّل بعدها.
  private pendingAfterBasmala: VersePosition | null = null;

  constructor(opts: VersePlayerOptions, cb: VersePlayerCallbacks = {}) {
    this.opts = { autoNextVerse: true, autoNextSurah: true, ...opts };
    this.cb = cb;
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.addEventListener('ended', this.handleEnded);
    this.audio.addEventListener('play', () => this.cb.onPlayStateChange?.(true));
    this.audio.addEventListener('pause', () => this.cb.onPlayStateChange?.(false));
    this.audio.addEventListener('error', () => {
      // تجاهل أخطاء الـ media element عندما يكون السبب تغيير src.
      const code = this.audio.error?.code;
      if (code === MediaError.MEDIA_ERR_ABORTED) return;
      if (this.current) {
        this.cb.onError?.(new Error(`Audio error for ${this.current.surah}:${this.current.ayah}`));
      }
    });
  }

  setReciter(reciterId: string): void {
    this.opts = { ...this.opts, reciterId };
  }

  setAutoNext(verse: boolean, surah: boolean): void {
    this.opts = { ...this.opts, autoNextVerse: verse, autoNextSurah: surah };
  }

  get position(): VersePosition | null {
    return this.current;
  }

  async playVerse(surah: number, ayah: number, opts?: { skipBasmala?: boolean }): Promise<void> {
    const token = ++this.playToken;
    this.current = { surah, ayah };
    this.cb.onVerseChange?.(this.current);

    // أوقف أي تشغيل سابق قبل تغيير src — يمنع AbortError.
    if (!this.audio.paused) this.audio.pause();

    // قرار تشغيل البسملة قبل آية 1:
    // - قارئ عادي: السور عدا الفاتحة (1) والتوبة (9) → نشغل 001001 كبسملة.
    // - قارئ له basmalaUrl + surahFilesIncludeBasmala=false: كل السور عدا التوبة → نشغل bismillah.mp3.
    // - قارئ له basmalaUrl + surahFilesIncludeBasmala=true: الفاتحة فقط (ملفات السور الأخرى تحوي البسملة).
    const reciter = getReciter(this.opts.reciterId);
    const needsBasmala = (() => {
      if (opts?.skipBasmala || ayah !== 1) return false;
      if (surah === 9) return false; // التوبة دائماً بدون بسملة
      if (reciter?.noBasmala) return false; // قارئ ملفاته تحوي البسملة بنفسها
      if (reciter?.basmalaUrl) {
        if (reciter.surahFilesIncludeBasmala) {
          return surah === 1;
        }
        return true;
      }
      return !SURAHS_WITHOUT_BASMALA.has(surah);
    })();

    let url: string | null;
    if (needsBasmala) {
      this.pendingAfterBasmala = { surah, ayah };
      url = await this.resolveBasmalaUrl();
      if (typeof console !== 'undefined') {
        console.log(`[VersePlayer] basmala before ${surah}:${ayah} →`, url);
      }
    } else {
      this.pendingAfterBasmala = null;
      url = await this.resolveUrl(surah, ayah);
      if (typeof console !== 'undefined') {
        console.log(`[VersePlayer] play ${surah}:${ayah} →`, url);
      }
    }

    if (token !== this.playToken) return; // قُوطعنا أثناء جلب URL.
    if (!url) {
      this.cb.onError?.(new Error(`تعذر جلب صوت الآية ${surah}:${ayah}`));
      return;
    }
    this.audio.src = url;
    this.audio.load();

    // إذا هذه الآية = 1 من سورة (ليست الفاتحة/التوبة) لقارئ مع firstAyahOffsetSeconds،
    // نقفز لتخطّي البسملة المدمجة في الملف (تم تشغيلها كبسملة منفصلة قبل لحظات).
    const shouldOffset =
      opts?.skipBasmala &&
      ayah === 1 &&
      !SURAHS_WITHOUT_BASMALA.has(surah) &&
      reciter?.firstAyahOffsetSeconds &&
      reciter.firstAyahOffsetSeconds > 0;
    if (shouldOffset) {
      const offset = reciter!.firstAyahOffsetSeconds!;
      const applyOffset = () => {
        try { this.audio.currentTime = offset; } catch { /* ignore */ }
      };
      // إذا كانت metadata جاهزة بالفعل (preload)، نطبّق فوراً، وإلا ننتظر.
      if (this.audio.readyState >= 1) applyOffset();
      else this.audio.addEventListener('loadedmetadata', applyOffset, { once: true });
    }

    try {
      await this.audio.play();
    } catch (err) {
      if (token !== this.playToken || isBenignAudioError(err)) return;
      this.cb.onError?.(err as Error);
      return;
    }
    void this.preloadNext();
  }

  pause(): void {
    this.audio.pause();
  }

  /** يضبط مستوى الصوت على كل العناصر الصوتية (الحالي + المعزوفات المحضَّرة). */
  setVolume(v: number): void {
    const clamped = Math.max(0, Math.min(1, v));
    this.audio.volume = clamped;
    for (const a of this.preloadAudios) {
      if (a) a.volume = clamped;
    }
  }

  async resume(): Promise<void> {
    const token = ++this.playToken;
    try {
      await this.audio.play();
    } catch (err) {
      if (token !== this.playToken || isBenignAudioError(err)) return;
      this.cb.onError?.(err as Error);
    }
  }

  stop(): void {
    this.playToken++;
    this.audio.pause();
    this.audio.currentTime = 0;
    this.current = null;
    this.pendingAfterBasmala = null;
    this.cb.onPlayStateChange?.(false);
  }

  destroy(): void {
    this.playToken++;
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.audio.removeEventListener('ended', this.handleEnded);
    for (const a of this.preloadAudios) a.removeAttribute('src');
    this.preloadAudios = [];
  }

  private handleEnded = async () => {
    if (!this.current) return;
    // إذا كنا نشغّل البسملة، الآن نشغّل الآية المعلَّقة.
    if (this.pendingAfterBasmala) {
      const target = this.pendingAfterBasmala;
      this.pendingAfterBasmala = null;
      if (typeof console !== 'undefined') {
        console.log(`[VersePlayer] basmala ended → playing ${target.surah}:${target.ayah}`);
      }
      await this.playVerse(target.surah, target.ayah, { skipBasmala: true });
      return;
    }
    const next = this.nextVerse(this.current);
    if (next) {
      if (next.surah !== this.current.surah) this.cb.onSurahChange?.(next.surah);
      await this.playVerse(next.surah, next.ayah);
    } else {
      this.cb.onEnd?.();
      this.cb.onPlayStateChange?.(false);
    }
  };

  private nextVerse(pos: VersePosition): VersePosition | null {
    const surah = getSurahByNumber(pos.surah);
    if (!surah) return null;
    if (pos.ayah < surah.versesCount) {
      return this.opts.autoNextVerse ? { surah: pos.surah, ayah: pos.ayah + 1 } : null;
    }
    if (this.opts.autoNextSurah && pos.surah < 114) {
      return { surah: pos.surah + 1, ayah: 1 };
    }
    return null;
  }

  private async resolveUrl(surah: number, ayah: number): Promise<string | null> {
    if (this.opts.resolveLocalUrl) {
      const local = await this.opts.resolveLocalUrl(this.opts.reciterId, surah, ayah);
      if (local) return local;
    }
    const reciter = getReciter(this.opts.reciterId);
    if (!reciter?.sources.everyayah) return null;
    return getVerseAudioUrl(reciter.sources.everyayah, surah, ayah);
  }

  // البسملة: نُفضّل URL خاص بالقارئ إن وُجد (مثل bismillah.mp3 العام)،
  // وإلا fallback إلى ملف الفاتحة 001001 لنفس القارئ.
  private async resolveBasmalaUrl(): Promise<string | null> {
    const reciter = getReciter(this.opts.reciterId);
    if (reciter?.basmalaUrl) return reciter.basmalaUrl;
    return this.resolveUrl(1, 1);
  }

  // يحضّر الآيتين القادمتين لتقليل الفجوة عند الانتقال.
  private async preloadNext(): Promise<void> {
    if (!this.current) return;
    let cursor: VersePosition | null = this.current;
    for (let i = 0; i < PRELOAD_COUNT; i++) {
      cursor = cursor ? this.nextVerse(cursor) : null;
      if (!cursor) break;
      const url = await this.resolveUrl(cursor.surah, cursor.ayah);
      if (!url) continue;
      let slot = this.preloadAudios[i];
      if (!slot) {
        slot = new Audio();
        slot.preload = 'auto';
        this.preloadAudios[i] = slot;
      }
      if (slot.src !== url) slot.src = url;
    }
  }
}
