import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';

export function getUserDataPath(): string {
  return path.join(app.getPath('userData'), 'data');
}

export function getTextPath(riwaya: string): string {
  return path.join(getUserDataPath(), 'text', `${riwaya}.json`);
}

export function getAudioPath(reciter: string, surah: number, ayah: number): string {
  const s = String(surah).padStart(3, '0');
  const a = String(ayah).padStart(3, '0');
  return path.join(getUserDataPath(), 'audio', reciter, `${s}${a}.mp3`);
}

export function getImagePath(page: number): string {
  const p = String(page).padStart(3, '0');
  return path.join(getUserDataPath(), 'images', `${p}.png`);
}

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
