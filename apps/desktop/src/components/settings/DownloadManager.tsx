import { useEffect, useState } from 'react';
import { RIWAYAT, RECITERS, getReciter, SURAHS } from '@gt-quranreader/core';
import type { RiwayaId } from '@gt-quranreader/core';
import { ConfirmDialog } from '@gt-quranreader/ui';
import { gtQuran, isElectron } from '../../platform/runtime';

type PendingConfirm = {
  title: string;
  message: string;
  confirmLabel: string;
  icon: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
} | null;

interface Progress {
  jobId: string;
  current: number;
  total: number;
  bytesDownloaded: number;
  status: 'pending' | 'downloading' | 'completed' | 'cancelled' | 'error';
  error?: string;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function DownloadManager() {
  const [storage, setStorage] = useState<Record<string, number>>({});
  const [progress, setProgress] = useState<Progress | null>(null);
  const [storagePath, setStoragePath] = useState('');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);

  const refreshStorage = async () => {
    if (!gtQuran) return;
    const stats = await gtQuran.storage.list();
    setStorage(stats);
    const p = await gtQuran.storage.getPath();
    setStoragePath(p);
  };

  useEffect(() => {
    void refreshStorage();
  }, []);

  useEffect(() => {
    if (!gtQuran) return;
    const off = gtQuran.download.onProgress((p) => {
      setProgress(p as Progress);
      if ((p as Progress).status === 'completed' || (p as Progress).status === 'error' || (p as Progress).status === 'cancelled') {
        setActiveJobId(null);
        void refreshStorage();
      }
    });
    return off;
  }, []);

  // إخفاء تلقائي لـ progress بعد 3.5s من الانتهاء — يجعل القائمة قابلة للاستخدام مجدداً.
  useEffect(() => {
    if (progress && (progress.status === 'completed' || progress.status === 'cancelled' || progress.status === 'error')) {
      const t = window.setTimeout(() => {
        setProgress(null);
        void refreshStorage();
      }, 3500);
      return () => window.clearTimeout(t);
    }
  }, [progress?.status]);

  if (!isElectron) {
    return (
      <div className="settings-section">
        <p className="settings-info">
          ميزة التنزيل المحلي متاحة في نسخة سطح المكتب فقط. في نسخة الويب، الملفات تُحمَّل تلقائياً من الإنترنت عند الحاجة.
        </p>
      </div>
    );
  }

  const startRiwayaDownload = async (riwaya: RiwayaId) => {
    if (!gtQuran || activeJobId) return;
    const res = await gtQuran.download.start({ type: 'riwaya-text', items: { riwaya } });
    if ((res as { ok: boolean; jobId?: string }).ok) {
      setActiveJobId((res as { jobId: string }).jobId);
    }
  };

  const startReciterDownload = async (reciterId: string) => {
    if (!gtQuran || activeJobId) return;
    const reciter = getReciter(reciterId);
    if (!reciter?.sources.everyayah) return;
    const surahs = SURAHS.map((s) => ({ number: s.number, versesCount: s.versesCount }));
    const res = await gtQuran.download.start({
      type: 'reciter-audio',
      items: {
        reciterId,
        everyayahFolder: reciter.sources.everyayah,
        surahs,
      },
    });
    if ((res as { ok: boolean; jobId?: string }).ok) {
      setActiveJobId((res as { jobId: string }).jobId);
    }
  };

  const startImagesDownload = async () => {
    if (!gtQuran || activeJobId) return;
    const res = await gtQuran.download.start({ type: 'images-all', items: {} });
    if ((res as { ok: boolean; jobId?: string }).ok) {
      setActiveJobId((res as { jobId: string }).jobId);
    }
  };

  const cancelJob = async () => {
    if (!gtQuran || !activeJobId) return;
    await gtQuran.download.cancel(activeJobId);
  };

  const deleteSection = (section: string) => {
    if (!gtQuran) return;
    setPendingConfirm({
      title: `حذف ${section}`,
      message: `سيُحذف كل ما تم تنزيله في قسم "${section}". يمكن إعادة التنزيل لاحقاً.`,
      confirmLabel: 'حذف',
      icon: '🗑️',
      variant: 'danger',
      onConfirm: async () => {
        setPendingConfirm(null);
        await gtQuran!.storage.delete(section);
        void refreshStorage();
      },
    });
  };

  const clearAllData = () => {
    if (!gtQuran) return;
    setPendingConfirm({
      title: 'حذف كل البيانات المحفوظة',
      message: 'سيُحذف كل ما تم تنزيله محلياً (النصوص + الصوت + الصور). يمكنك إعادة التنزيل لاحقاً.',
      confirmLabel: 'حذف الكل',
      icon: '🗑️',
      variant: 'danger',
      onConfirm: async () => {
        setPendingConfirm(null);
        for (const section of Object.keys(storage)) {
          if (storage[section] > 0) await gtQuran!.storage.delete(section);
        }
        void refreshStorage();
      },
    });
  };

  const startImagesDownloadConfirmed = () => {
    if (!gtQuran || activeJobId) return;
    setPendingConfirm({
      title: 'تنزيل صور كل الصفحات',
      message: 'سيُنزَّل ~604 صورة (حوالي 60-100 MB). يمكنك إلغاء التنزيل في أي وقت.',
      confirmLabel: 'ابدأ التنزيل',
      icon: '🖼️',
      onConfirm: async () => {
        setPendingConfirm(null);
        const res = await gtQuran!.download.start({ type: 'images-all', items: {} });
        if ((res as { ok: boolean; jobId?: string }).ok) {
          setActiveJobId((res as { jobId: string }).jobId);
        }
      },
    });
  };

  const pct = progress && progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="download-manager">
      <section className="settings-section">
        <h4>📂 المساحة المستخدمة</h4>
        <p className="storage-path">المسار: <code>{storagePath}</code></p>
        <table className="storage-table">
          <thead>
            <tr>
              <th>القسم</th>
              <th>الحجم</th>
              <th>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(storage).map(([section, bytes]) => (
              <tr key={section}>
                <td>{section}</td>
                <td>{formatBytes(bytes)}</td>
                <td>
                  <button onClick={() => deleteSection(section)} disabled={bytes === 0}>
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={clearAllData} disabled={!!activeJobId}>🗑️ حذف كل البيانات المحفوظة</button>
      </section>

      {progress && (
        <section className={`settings-section settings-section-job settings-section-job-${progress.status}`}>
          <h4>
            {progress.status === 'downloading' && '⏳ تنزيل جارٍ'}
            {progress.status === 'completed' && '✅ تم التنزيل'}
            {progress.status === 'cancelled' && '⛔ أُلغي التنزيل'}
            {progress.status === 'error' && '⚠️ خطأ في التنزيل'}
          </h4>
          {progress.status === 'downloading' && (
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          )}
          <p className="progress-info">
            {progress.status === 'downloading'
              ? `${progress.current} / ${progress.total} (${pct}%) — ${formatBytes(progress.bytesDownloaded)}`
              : progress.status === 'completed'
                ? `تم تنزيل ${progress.current} ملف (${formatBytes(progress.bytesDownloaded)}). سيختفي هذا التنبيه تلقائياً…`
                : progress.status === 'cancelled'
                  ? 'تم الإلغاء.'
                  : progress.error || 'حدث خطأ.'}
          </p>
          {progress.status === 'downloading' && (
            <button onClick={cancelJob}>إيقاف التنزيل</button>
          )}
        </section>
      )}

      <section className="settings-section">
        <h4>📜 تنزيل نصوص الروايات</h4>
        <div className="download-grid">
          {RIWAYAT.map((r) => (
            <button
              key={r.id}
              disabled={!!activeJobId}
              onClick={() => startRiwayaDownload(r.id)}
              className="download-item-btn"
            >
              {r.fullName.ar}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h4>🎙️ تنزيل صوت لكل آية (كل قارئ ~ 100-300 MB)</h4>
        <div className="download-grid">
          {[...RECITERS]
            .sort((a, b) => {
              // ورش أولاً، ثم الباقي بحسب ترتيبه الأصلي
              if (a.riwaya === 'warsh' && b.riwaya !== 'warsh') return -1;
              if (a.riwaya !== 'warsh' && b.riwaya === 'warsh') return 1;
              return 0;
            })
            .map((r) => (
            <button
              key={r.id}
              disabled={!!activeJobId || !r.sources.everyayah}
              onClick={() => startReciterDownload(r.id)}
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
        <h4>🖼️ صور المصحف (604 صفحة، ~50-100 MB)</h4>
        <button disabled={!!activeJobId} onClick={startImagesDownloadConfirmed}>
          تنزيل صور كل الصفحات
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
