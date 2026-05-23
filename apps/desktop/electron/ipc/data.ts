import type { IpcMain } from 'electron';
import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';

const userData = () => app.getPath('userData');
const dataDir = () => path.join(userData(), 'data');

export function registerDataIpc(ipcMain: IpcMain): void {
  ipcMain.handle('data:has-riwaya', async (_e, riwaya: string) => {
    try {
      const filePath = path.join(dataDir(), 'text', `${riwaya}.json`);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('data:get-riwaya-text', async (_e, riwaya: string) => {
    const filePath = path.join(dataDir(), 'text', `${riwaya}.json`);
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  });

  ipcMain.handle('data:get-page-text', async (_e, page: number, riwaya: string) => {
    const filePath = path.join(dataDir(), 'text', `${riwaya}.json`);
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const json = JSON.parse(raw);
      // يعيد آيات الصفحة فقط.
      const surahs = (json.data?.surahs ?? []) as Array<{
        number: number;
        name: string;
        ayahs: Array<{ numberInSurah: number; text: string; page: number; juz: number }>;
      }>;
      const verses: { surah: number; surahName: string; ayah: number; text: string; page: number }[] = [];
      for (const s of surahs) {
        for (const a of s.ayahs) {
          if (a.page === page) {
            verses.push({ surah: s.number, surahName: s.name, ayah: a.numberInSurah, text: a.text, page: a.page });
          }
        }
      }
      return verses;
    } catch {
      return null;
    }
  });

  ipcMain.handle('data:get-verse-audio-path', async (_e, reciter: string, surah: number, ayah: number) => {
    const surahStr = String(surah).padStart(3, '0');
    const ayahStr = String(ayah).padStart(3, '0');
    const filePath = path.join(dataDir(), 'audio', reciter, `${surahStr}${ayahStr}.mp3`);
    try {
      await fs.access(filePath);
      return `file://${filePath}`;
    } catch {
      return null;
    }
  });

  ipcMain.handle('data:get-page-image-path', async (_e, page: number) => {
    const pageStr = String(page).padStart(3, '0');
    const filePath = path.join(dataDir(), 'images', `${pageStr}.png`);
    try {
      await fs.access(filePath);
      return `file://${filePath}`;
    } catch {
      return null;
    }
  });
}
