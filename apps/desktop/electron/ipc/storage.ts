import type { IpcMain } from 'electron';
import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';

async function dirSize(dir: string): Promise<number> {
  let total = 0;
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) total += await dirSize(full);
      else if (entry.isFile()) {
        const stat = await fs.stat(full);
        total += stat.size;
      }
    }
  } catch {
    /* path may not exist */
  }
  return total;
}

export function registerStorageIpc(ipcMain: IpcMain): void {
  ipcMain.handle('storage:get-path', async () => {
    return path.join(app.getPath('userData'), 'data');
  });

  ipcMain.handle('storage:list', async () => {
    const base = path.join(app.getPath('userData'), 'data');
    const sections = ['text', 'images', 'audio'];
    const result: Record<string, number> = {};
    for (const section of sections) {
      result[section] = await dirSize(path.join(base, section));
    }
    return result;
  });

  ipcMain.handle('storage:delete', async (_e, key: string) => {
    const base = path.join(app.getPath('userData'), 'data');
    const target = path.join(base, key);
    if (!target.startsWith(base)) {
      throw new Error('Refusing to delete path outside data dir');
    }
    await fs.rm(target, { recursive: true, force: true });
    return { ok: true };
  });
}
