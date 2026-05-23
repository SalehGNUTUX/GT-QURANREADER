import fs from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import { URL } from 'node:url';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function fetchToFile(url: string, destPath: string): Promise<{ bytes: number }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'http:' ? http : https;
    const req = client.get(
      url,
      { headers: { 'User-Agent': 'GT-QURANREADER/4.0' } },
      async (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // متابعة التحويل (redirect).
          res.resume();
          try {
            const result = await fetchToFile(new URL(res.headers.location, url).toString(), destPath);
            resolve(result);
          } catch (err) {
            reject(err);
          }
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        const tmpPath = `${destPath}.tmp`;
        const chunks: Buffer[] = [];
        let bytes = 0;
        res.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
          bytes += chunk.length;
        });
        res.on('end', async () => {
          try {
            await fs.writeFile(tmpPath, Buffer.concat(chunks));
            await fs.rename(tmpPath, destPath);
            resolve({ bytes });
          } catch (err) {
            reject(err);
          }
        });
        res.on('error', reject);
      }
    );
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error(`Timeout on ${url}`)));
  });
}

export async function downloadWithRetry(url: string, destPath: string): Promise<{ bytes: number }> {
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fetchToFile(url, destPath);
    } catch (err) {
      lastErr = err as Error;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }
  throw lastErr ?? new Error('Download failed');
}

export interface JobItem {
  url: string;
  dest: string;
  skipIfExists?: boolean;
}

export interface JobProgress {
  jobId: string;
  current: number;
  total: number;
  bytesDownloaded: number;
  status: 'pending' | 'downloading' | 'completed' | 'cancelled' | 'error';
  error?: string;
}

export class DownloadJob {
  readonly id: string;
  private items: JobItem[];
  private cancelled = false;
  private bytesDownloaded = 0;
  private current = 0;

  constructor(id: string, items: JobItem[]) {
    this.id = id;
    this.items = items;
  }

  cancel(): void {
    this.cancelled = true;
  }

  async run(
    concurrency: number,
    onProgress: (p: JobProgress) => void
  ): Promise<JobProgress> {
    const total = this.items.length;
    let inFlight = 0;
    let index = 0;
    let lastError: Error | null = null;

    onProgress({ jobId: this.id, current: 0, total, bytesDownloaded: 0, status: 'downloading' });

    return new Promise<JobProgress>((resolve) => {
      const dispatch = () => {
        if (this.cancelled) {
          if (inFlight === 0) {
            resolve({ jobId: this.id, current: this.current, total, bytesDownloaded: this.bytesDownloaded, status: 'cancelled' });
          }
          return;
        }
        while (inFlight < concurrency && index < total && !this.cancelled) {
          const item = this.items[index++];
          inFlight++;
          (async () => {
            try {
              if (item.skipIfExists) {
                try {
                  await fs.access(item.dest);
                  this.current++;
                  return;
                } catch {
                  /* not exists, continue */
                }
              }
              const result = await downloadWithRetry(item.url, item.dest);
              this.bytesDownloaded += result.bytes;
              this.current++;
            } catch (err) {
              lastError = err as Error;
            } finally {
              inFlight--;
              onProgress({
                jobId: this.id,
                current: this.current,
                total,
                bytesDownloaded: this.bytesDownloaded,
                status: 'downloading',
              });
              dispatch();
            }
          })();
        }
        if (inFlight === 0 && (index >= total || this.cancelled)) {
          const status = this.cancelled ? 'cancelled' : lastError ? 'error' : 'completed';
          const final: JobProgress = {
            jobId: this.id,
            current: this.current,
            total,
            bytesDownloaded: this.bytesDownloaded,
            status,
            ...(lastError ? { error: lastError.message } : {}),
          };
          onProgress(final);
          resolve(final);
        }
      };
      dispatch();
    });
  }
}
