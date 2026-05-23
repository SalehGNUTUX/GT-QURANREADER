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
import { idbDelete, idbGet, idbKeys, idbPut, STORE_RIWAYA_TEXTS } from '../../storage/indexeddb';

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

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

async function fetchAllConcurrent(
  urls: string[],
  concurrency: number,
  cancelFlag: { cancelled: boolean },
  onProgress: (done: number) => void
): Promise<void> {
  let done = 0;
  let i = 0;
  const total = urls.length;
  const workers: Promise<void>[] = [];
  for (let w = 0; w < concurrency; w++) {
    workers.push(
      (async () => {
        while (i < total && !cancelFlag.cancelled) {
          const idx = i++;
          try {
            await fetch(urls[idx], { cache: 'force-cache' });
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
  const [job, setJob] = useState<ActiveJob | null>(null);

  const refresh = async () => {
    const keys = await idbKeys(STORE_RIWAYA_TEXTS);
    setCachedRiwayat(keys);
    setStorageInfo(await estimateStorage());
  };

  useEffect(() => {
    void refresh();
  }, []);

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
    });
    setJob((j) =>
      j ? { ...j, status: cancelFlag.cancelled ? 'cancelled' : 'completed' } : j
    );
    await refresh();
  };

  const downloadImages = async () => {
    if (job) return;
    const urls: string[] = [];
    for (let p = 1; p <= TOTAL_PAGES; p++) urls.push(getQuranPngUrl(p));
    const cancelFlag = { cancelled: false };
    setJob({ label: 'صور المصاحف', current: 0, total: urls.length, status: 'downloading', cancelFlag });
    await fetchAllConcurrent(urls, 6, cancelFlag, (done) => {
      setJob((j) => (j ? { ...j, current: done } : j));
    });
    setJob((j) =>
      j ? { ...j, status: cancelFlag.cancelled ? 'cancelled' : 'completed' } : j
    );
    await refresh();
  };

  const cancelJob = () => {
    if (!job) return;
    job.cancelFlag.cancelled = true;
  };

  const deleteRiwaya = async (riwaya: string) => {
    if (!confirm(`حذف نص رواية ${riwaya}؟`)) return;
    await idbDelete(STORE_RIWAYA_TEXTS, riwaya);
    await refresh();
  };

  const clearAllCaches = async () => {
    if (!confirm('حذف كل البيانات المُنزَّلة (نصوص + صوت + صور)؟')) return;
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    for (const r of cachedRiwayat) await idbDelete(STORE_RIWAYA_TEXTS, r);
    await refresh();
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
        <p className="settings-info">
          الروايات المحفوظة: {cachedRiwayat.length === 0 ? 'لا شيء' : cachedRiwayat.join(', ')}
        </p>
        <button onClick={clearAllCaches}>🗑️ حذف كل البيانات المحفوظة</button>
      </section>

      {job && (
        <section className="settings-section">
          <h4>⏳ {job.label}</h4>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="progress-info">
            {job.current} / {job.total} ({pct}%) — {job.status}
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
          {RECITERS.map((r) => (
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
    </div>
  );
}
