import type { IpcMain } from 'electron';
import { BrowserWindow } from 'electron';
import { DownloadJob, type JobItem, downloadWithRetry } from '../services/downloader.js';
import {
  getAudioPath,
  getImagePath,
  getTextPath,
  ensureDir,
  getUserDataPath,
} from '../services/data-manager.js';
import path from 'node:path';
import fs from 'node:fs/promises';

interface JobRequest {
  type: 'riwaya-text' | 'reciter-audio' | 'images-all';
  payload: {
    riwaya?: string;
    reciterId?: string;
    everyayahFolder?: string;
    surahs?: { number: number; versesCount: number }[];
    pages?: number[];
  };
}

const activeJobs = new Map<string, DownloadJob>();

function broadcast(channel: string, payload: unknown) {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(channel, payload);
  }
}

async function buildItems(req: JobRequest): Promise<JobItem[]> {
  const items: JobItem[] = [];
  if (req.type === 'reciter-audio' && req.payload.everyayahFolder && req.payload.surahs) {
    const folder = req.payload.everyayahFolder;
    for (const s of req.payload.surahs) {
      for (let a = 1; a <= s.versesCount; a++) {
        const surahStr = String(s.number).padStart(3, '0');
        const ayahStr = String(a).padStart(3, '0');
        items.push({
          url: `https://everyayah.com/data/${folder}/${surahStr}${ayahStr}.mp3`,
          dest: getAudioPath(req.payload.reciterId ?? folder, s.number, a),
          skipIfExists: true,
        });
      }
    }
  } else if (req.type === 'images-all') {
    const pages = req.payload.pages ?? Array.from({ length: 604 }, (_, i) => i + 1);
    for (const p of pages) {
      const pageStr = String(p).padStart(3, '0');
      items.push({
        url: `https://raw.githubusercontent.com/SalehGNUTUX/Quran-PNG/master/${pageStr}.png`,
        dest: getImagePath(p),
        skipIfExists: true,
      });
    }
  }
  return items;
}

async function downloadRiwayaText(riwayaApiSlug: string, riwayaId: string): Promise<void> {
  const destPath = getTextPath(riwayaId);
  await ensureDir(path.dirname(destPath));
  // alquran.cloud يعيد JSON كاملاً.
  await downloadWithRetry(`https://api.alquran.cloud/v1/quran/${riwayaApiSlug}`, destPath);
}

export function registerDownloadIpc(ipcMain: IpcMain): void {
  ipcMain.handle('download:start', async (_e, req: JobRequest) => {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // النص: استدعاء واحد فقط، نتعامل معه خاصاً.
    if (req.type === 'riwaya-text') {
      if (!req.payload.riwaya) return { ok: false, error: 'Missing riwaya' };
      try {
        // يحتاج apiSlug — نمرره عبر payload.riwaya مباشرة.
        // ولكن payload.riwaya هو الـ id فقط، نحتاج apiSlug. سنفترض أن الطالب يمرر apiSlug عبر حقل خاص.
        // نقرأ من payload.riwaya كـ id ثم نبني slug.
        const apiSlugMap: Record<string, string> = {
          hafs: 'quran-uthmani',
          warsh: 'quran-warsh',
          qaloon: 'quran-qaloon',
          aldoori: 'quran-aldoori',
        };
        const slug = apiSlugMap[req.payload.riwaya];
        if (!slug) return { ok: false, error: `Unknown riwaya: ${req.payload.riwaya}` };
        broadcast('download:progress', {
          jobId,
          current: 0,
          total: 1,
          bytesDownloaded: 0,
          status: 'downloading',
        });
        await downloadRiwayaText(slug, req.payload.riwaya);
        const stat = await fs.stat(getTextPath(req.payload.riwaya));
        broadcast('download:progress', {
          jobId,
          current: 1,
          total: 1,
          bytesDownloaded: stat.size,
          status: 'completed',
        });
        return { ok: true, jobId };
      } catch (err) {
        const msg = (err as Error).message;
        broadcast('download:progress', {
          jobId,
          current: 0,
          total: 1,
          bytesDownloaded: 0,
          status: 'error',
          error: msg,
        });
        return { ok: false, error: msg };
      }
    }

    // باقي الأنواع: مهام متوازية.
    const items = await buildItems(req);
    if (items.length === 0) return { ok: false, error: 'No items to download' };

    const job = new DownloadJob(jobId, items);
    activeJobs.set(jobId, job);

    // تشغيل في الخلفية. الـ progress يُبث عبر `download:progress`.
    void job
      .run(5, (p) => broadcast('download:progress', p))
      .finally(() => activeJobs.delete(jobId));

    return { ok: true, jobId, total: items.length };
  });

  ipcMain.handle('download:cancel', (_e, jobId: string) => {
    const job = activeJobs.get(jobId);
    if (job) {
      job.cancel();
      return { ok: true };
    }
    return { ok: false, error: 'Job not found' };
  });

  // مفيد لاستعراض حجم الـ userData.
  ipcMain.handle('download:user-data-path', () => getUserDataPath());
}
