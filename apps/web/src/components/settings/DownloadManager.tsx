import { useEffect, useState } from 'react';
import {
  RIWAYAT,
  RECITERS,
  getReciter,
  SURAHS,
  TOTAL_PAGES,
  fetchQuranByRiwaya,
  getVerseAudioUrl,
  getQuranPngUrl,
} from '@gt-quranreader/core';
import type { RiwayaId } from '@gt-quranreader/core';
import { ConfirmDialog } from '@gt-quranreader/ui';
import { idbDelete, idbGet, idbKeys, idbPut, STORE_RIWAYA_TEXTS } from '../../storage/indexeddb';

type PendingConfirm = {
  title: string;
  message: string;
  confirmLabel: string;
  icon: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
} | null;

interface ActiveJob {
  label: string;
  current: number;
  total: number;
  status: 'downloading' | 'completed' | 'cancelled' | 'error';
  cancelFlag: { cancelled: boolean };
}

async function estimateStorage(): Promise<{ used: number; quota: number } | null> {
  if (!navigator.storage?.estimate) return null;
  const e = await navigator.storage.estimate();
  return { used: e.usage ?? 0, quota: e.quota ?? 0 };
}

interface CacheSummary {
  name: string;
  label: string;
  count: number;
  approxBytes: number;
}

/**
 * يحسب حجم كل cache مُسجَّل لدى Workbox.
 * يستخدم Response.headers['content-length'] إن توفّر — بدونه يُقدِّر بـ bytes الـ blob (مكلف).
 * نختار النهج السريع: content-length فقط، نتجاهل ما يفتقدها.
 */
async function summarizeCaches(): Promise<CacheSummary[]> {
  if (typeof caches === 'undefined' || !caches.keys) return [];
  const names = await caches.keys();
  const out: CacheSummary[] = [];
  for (const name of names) {
    const cache = await caches.open(name);
    const requests = await cache.keys();
    let bytes = 0;
    let missingLen = 0;
    let sampledBytes = 0;
    const SAMPLE_LIMIT = 8;

    for (const req of requests) {
      const res = await cache.match(req);
      const len = res?.headers.get('content-length');
      if (len) {
        bytes += Number(len) || 0;
      } else if (missingLen < SAMPLE_LIMIT && res) {
        // أخذ عيّنة من 8 ملفات بدون content-length (نقيس حجم blob) ثم نُقدِّر الإجمالي.
        try {
          const blob = await res.clone().blob();
          sampledBytes += blob.size;
          missingLen++;
        } catch { /* تجاهل */ }
      }
    }

    // إن وجدت ملفات بدون content-length: نُقدِّر الإجمالي بالعيّنة × عدد الملفات.
    if (missingLen > 0 && requests.length > 0) {
      const avgSampled = sampledBytes / missingLen;
      const remaining = requests.length - (requests.length - missingLen); // # of all with missing len (approx)
      // نضيف تقدير: متوسط حجم العيّنة × عدد الملفات بدون content-length.
      // ملاحظة: لا نعرف تماماً كم منها بدون header؛ نفترض جميعها لو bytes==0.
      if (bytes === 0) {
        bytes = Math.round(avgSampled * requests.length);
      } else {
        bytes += Math.round(avgSampled * remaining);
      }
    }

    out.push({ name, label: friendlyCacheLabel(name), count: requests.length, approxBytes: bytes });
  }
  return out;
}

// يطلب من المتصفح/النظام حفظ التخزين بشكل دائم (لا تُحذف cache تلقائياً عند ضغط الذاكرة).
// مهم خاصة على الجوال حيث Android قد يمسح بيانات WebView.
async function ensurePersistentStorage() {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return;
  try {
    const already = await navigator.storage.persisted?.();
    if (already) return;
    await navigator.storage.persist();
  } catch { /* تجاهل */ }
}

function friendlyCacheLabel(name: string): string {
  const n = name.toLowerCase();
  // caches اليدوية الصريحة (مُسبَّقة بـ gtqr-)
  if (n.startsWith('gtqr-images')) return '🖼️ صور المصاحف';
  if (n.startsWith('gtqr-audio-')) {
    // gtqr-audio-{reciterId}
    const reciterId = name.substring('gtqr-audio-'.length);
    return `🎙️ صوت ${reciterId}`;
  }
  // caches الـ Workbox التلقائية
  if (n.includes('everyayah') || n.includes('audio')) return '🎙️ صوت القرّاء';
  if (n.includes('mp3quran')) return '🎙️ سور كاملة';
  if (n.includes('quran-png') || n.includes('quran_png') || n.includes('image')) return '🖼️ صور المصاحف';
  if (n.includes('alquran') || n.includes('api')) return '📜 API نص القرآن';
  if (n.includes('precache') || n.includes('workbox')) return '⚙️ ملفات التطبيق';
  return `📦 ${name}`;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * يُنزِّل URLs بتزامن محدود ويخزّنها صراحةً في Cache API (caches.open()/.put()).
 *
 * هذا يضمن ظهورها في storage table حتى بدون SW (مهم لـ APK/Capacitor حيث
 * SW قد لا يكون مُسجَّلاً). كما يعمل في PWA المتصفح حيث Workbox سيلتقط نفس
 * المحتوى ويُخزّنه (لا تكرار — caches.put فقط تضيف entries جديدة).
 */
async function fetchAllConcurrent(
  urls: string[],
  concurrency: number,
  cancelFlag: { cancelled: boolean },
  onProgress: (done: number) => void,
  cacheName: string
): Promise<void> {
  let done = 0;
  let i = 0;
  const total = urls.length;
  // افتح cache مخصَّص للتنزيل الصريح. Workbox يستخدم أسماء مختلفة
  // (quran-pages-images, quran-verse-audio...) فلا تعارض.
  let cache: Cache | null = null;
  try {
    cache = typeof caches !== 'undefined' ? await caches.open(cacheName) : null;
  } catch { /* تجاهل — fetch بدون cache.put */ }

  const workers: Promise<void>[] = [];
  for (let w = 0; w < concurrency; w++) {
    workers.push(
      (async () => {
        while (i < total && !cancelFlag.cancelled) {
          const idx = i++;
          try {
            // إن كان موجوداً في cache، تخطَّ (لتسريع إعادة التنزيل).
            if (cache) {
              const existing = await cache.match(urls[idx]);
              if (existing) {
                done++;
                onProgress(done);
                continue;
              }
            }
            const res = await fetch(urls[idx]);
            if (res.ok && cache) {
              try { await cache.put(urls[idx], res.clone()); } catch { /* quota */ }
            }
          } catch {
            /* تجاهل الفشل الفردي */
          }
          done++;
          onProgress(done);
        }
      })()
    );
  }
  await Promise.all(workers);
}

export function DownloadManager() {
  const [cachedRiwayat, setCachedRiwayat] = useState<string[]>([]);
  const [storageInfo, setStorageInfo] = useState<{ used: number; quota: number } | null>(null);
  const [cacheSummaries, setCacheSummaries] = useState<CacheSummary[]>([]);
  const [job, setJob] = useState<ActiveJob | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);

  const refresh = async () => {
    const keys = await idbKeys(STORE_RIWAYA_TEXTS);
    setCachedRiwayat(keys);
    setStorageInfo(await estimateStorage());
    setCacheSummaries(await summarizeCaches());
  };

  // حذف cache مُحدَّد بعد التأكيد.
  const deleteCache = (cacheName: string, label: string) => {
    setPendingConfirm({
      title: `حذف ${label}`,
      message: `سيُحذف كل ما تم تخزينه في "${label}". يمكن إعادة التنزيل لاحقاً.`,
      confirmLabel: 'حذف',
      icon: '🗑️',
      variant: 'danger',
      onConfirm: async () => {
        setPendingConfirm(null);
        await caches.delete(cacheName);
        await refresh();
      },
    });
  };

  useEffect(() => {
    void refresh();
    void ensurePersistentStorage();
  }, []);

  // إخفاء تلقائي للـ job بعد 3.5s من اكتمال/إلغاء — يجعل القائمة قابلة للاستخدام مجدداً
  // وينقّي الواجهة بدون إجبار المستخدم على إعادة فتح modal الإعدادات.
  useEffect(() => {
    if (job && (job.status === 'completed' || job.status === 'cancelled' || job.status === 'error')) {
      const t = window.setTimeout(() => {
        setJob(null);
        void refresh();
      }, 3500);
      return () => window.clearTimeout(t);
    }
  }, [job?.status]);

  const downloadRiwaya = async (riwaya: RiwayaId, label: string) => {
    if (job) return;
    const cancelFlag = { cancelled: false };
    setJob({ label, current: 0, total: 1, status: 'downloading', cancelFlag });
    try {
      const existing = await idbGet(STORE_RIWAYA_TEXTS, riwaya);
      if (existing) {
        setJob({ label, current: 1, total: 1, status: 'completed', cancelFlag });
      } else {
        const data = await fetchQuranByRiwaya(riwaya);
        await idbPut(STORE_RIWAYA_TEXTS, riwaya, data);
        setJob({ label, current: 1, total: 1, status: 'completed', cancelFlag });
      }
    } catch (err) {
      setJob({ label, current: 0, total: 1, status: 'error', cancelFlag });
      console.error(err);
    }
    await refresh();
  };

  const downloadReciter = async (reciterId: string, label: string) => {
    if (job) return;
    const reciter = getReciter(reciterId);
    if (!reciter?.sources.everyayah) return;
    const urls: string[] = [];
    for (const s of SURAHS) {
      for (let a = 1; a <= s.versesCount; a++) {
        urls.push(getVerseAudioUrl(reciter.sources.everyayah, s.number, a));
      }
    }
    const cancelFlag = { cancelled: false };
    setJob({ label, current: 0, total: urls.length, status: 'downloading', cancelFlag });
    await fetchAllConcurrent(urls, 6, cancelFlag, (done) => {
      setJob((j) => (j ? { ...j, current: done } : j));
    }, `gtqr-audio-${reciterId}`);
    setJob((j) =>
      j ? { ...j, status: cancelFlag.cancelled ? 'cancelled' : 'completed' } : j
    );
    await refresh();
  };

  const downloadImagesActual = async () => {
    const urls: string[] = [];
    for (let p = 1; p <= TOTAL_PAGES; p++) urls.push(getQuranPngUrl(p));
    const cancelFlag = { cancelled: false };
    setJob({ label: 'صور المصاحف', current: 0, total: urls.length, status: 'downloading', cancelFlag });
    await fetchAllConcurrent(urls, 6, cancelFlag, (done) => {
      setJob((j) => (j ? { ...j, current: done } : j));
    }, 'gtqr-images');
    setJob((j) =>
      j ? { ...j, status: cancelFlag.cancelled ? 'cancelled' : 'completed' } : j
    );
    await refresh();
  };

  const downloadImages = () => {
    if (job) return;
    setPendingConfirm({
      title: 'تنزيل صور كل صفحات المصحف',
      message: `سيُنزَّل ~${TOTAL_PAGES} صورة (حوالي 60-100 MB). من الأفضل استخدام شبكة Wi-Fi. يمكنك إلغاء التنزيل في أي وقت.`,
      confirmLabel: 'ابدأ التنزيل',
      icon: '🖼️',
      onConfirm: () => {
        setPendingConfirm(null);
        void downloadImagesActual();
      },
    });
  };

  const cancelJob = () => {
    if (!job) return;
    job.cancelFlag.cancelled = true;
  };

  const deleteRiwaya = (riwaya: string) => {
    setPendingConfirm({
      title: 'حذف نص الرواية',
      message: `سيُحذف نص رواية ${riwaya} من الذاكرة المحلية. سيُعاد تنزيله من الإنترنت عند الحاجة.`,
      confirmLabel: 'حذف',
      icon: '🗑️',
      variant: 'danger',
      onConfirm: async () => {
        setPendingConfirm(null);
        await idbDelete(STORE_RIWAYA_TEXTS, riwaya);
        await refresh();
      },
    });
  };

  const clearAllCaches = () => {
    setPendingConfirm({
      title: 'حذف كل البيانات المحفوظة',
      message: 'سيُحذف كل ما تم تنزيله محلياً (النصوص + الصوت + الصور). يمكنك إعادة التنزيل لاحقاً.',
      confirmLabel: 'حذف الكل',
      icon: '🗑️',
      variant: 'danger',
      onConfirm: async () => {
        setPendingConfirm(null);
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        for (const r of cachedRiwayat) await idbDelete(STORE_RIWAYA_TEXTS, r);
        await refresh();
      },
    });
  };

  const pct = job && job.total > 0 ? Math.round((job.current / job.total) * 100) : 0;

  return (
    <div className="download-manager">
      <section className="settings-section">
        <h4>💾 التخزين على هذا الجهاز</h4>
        {storageInfo ? (
          <p className="storage-path">
            مستخدَم: <strong>{formatBytes(storageInfo.used)}</strong>
            {storageInfo.quota > 0 && (
              <> من أصل <strong>{formatBytes(storageInfo.quota)}</strong></>
            )}
          </p>
        ) : (
          <p className="storage-path">لم يتعرف المتصفح على معلومات التخزين.</p>
        )}

        {(cacheSummaries.length > 0 || cachedRiwayat.length > 0) && (
          <table className="storage-table">
            <thead>
              <tr>
                <th>القسم</th>
                <th>عدد الملفات</th>
                <th>الحجم</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {cachedRiwayat.map((r) => (
                <tr key={`idb-${r}`}>
                  <td>📜 نص رواية {r}</td>
                  <td>1</td>
                  <td>~5 MB</td>
                  <td>
                    <button onClick={() => deleteRiwaya(r)}>حذف</button>
                  </td>
                </tr>
              ))}
              {cacheSummaries.map((c) => (
                <tr key={`cache-${c.name}`}>
                  <td>{c.label}</td>
                  <td>{c.count}</td>
                  <td>{c.approxBytes > 0 ? formatBytes(c.approxBytes) : '—'}</td>
                  <td>
                    <button onClick={() => deleteCache(c.name, c.label)} disabled={c.count === 0}>
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {cacheSummaries.length === 0 && cachedRiwayat.length === 0 && (
          <p className="settings-info">لا توجد بيانات محفوظة محلياً بعد.</p>
        )}

        <button onClick={clearAllCaches} disabled={cacheSummaries.length === 0 && cachedRiwayat.length === 0}>
          🗑️ حذف كل البيانات المحفوظة
        </button>
      </section>

      {job && (
        <section className={`settings-section settings-section-job settings-section-job-${job.status}`}>
          <h4>
            {job.status === 'downloading' && '⏳ '}
            {job.status === 'completed' && '✅ '}
            {job.status === 'cancelled' && '⛔ '}
            {job.status === 'error' && '⚠️ '}
            {job.label}
          </h4>
          {job.status === 'downloading' && (
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          )}
          <p className="progress-info">
            {job.status === 'completed' && 'تم التنزيل بنجاح. سيختفي هذا التنبيه تلقائياً…'}
            {job.status === 'cancelled' && 'أُلغي التنزيل.'}
            {job.status === 'error' && 'حدث خطأ أثناء التنزيل.'}
            {job.status === 'downloading' && `${job.current} / ${job.total} (${pct}%)`}
          </p>
          {job.status === 'downloading' && <button onClick={cancelJob}>إيقاف</button>}
        </section>
      )}

      <section className="settings-section">
        <h4>📜 نصوص الروايات (~5MB لكل واحدة، في IndexedDB)</h4>
        <div className="download-grid">
          {RIWAYAT.map((r) => (
            <button
              key={r.id}
              disabled={!!job}
              onClick={() => downloadRiwaya(r.id, `نص ${r.name.ar}`)}
              className="download-item-btn"
            >
              {r.fullName.ar}
              {cachedRiwayat.includes(r.id) && <small>✅ محفوظ</small>}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h4>🎙️ صوت لكل آية (Workbox cache)</h4>
        <p className="settings-info">
          سيتم تنزيل ~6240 ملف لكل قارئ. المستحسن استخدام شبكة Wi-Fi.
        </p>
        <div className="download-grid">
          {[...RECITERS]
            .sort((a, b) => {
              if (a.riwaya === 'warsh' && b.riwaya !== 'warsh') return -1;
              if (a.riwaya !== 'warsh' && b.riwaya === 'warsh') return 1;
              return 0;
            })
            .map((r) => (
            <button
              key={r.id}
              disabled={!!job || !r.sources.everyayah}
              onClick={() => downloadReciter(r.id, `صوت ${r.name.ar}`)}
              className="download-item-btn"
              title={r.sources.everyayah ?? 'غير متوفر'}
            >
              {r.name.ar}
              <small>{r.style}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h4>🖼️ صور المصاحف (604 صفحة)</h4>
        <button disabled={!!job} onClick={downloadImages}>
          تنزيل كل الصور لاستخدامها بدون إنترنت
        </button>
      </section>

      {pendingConfirm && (
        <ConfirmDialog
          title={pendingConfirm.title}
          message={pendingConfirm.message}
          confirmLabel={pendingConfirm.confirmLabel}
          cancelLabel="إلغاء"
          icon={pendingConfirm.icon}
          variant={pendingConfirm.variant}
          onConfirm={pendingConfirm.onConfirm}
          onCancel={() => setPendingConfirm(null)}
        />
      )}
    </div>
  );
}
