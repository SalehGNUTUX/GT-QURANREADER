import { contextBridge, ipcRenderer } from 'electron';

const api = {
  data: {
    getPageText: (page: number, riwaya: string) =>
      ipcRenderer.invoke('data:get-page-text', page, riwaya),
    getRiwayaText: (riwaya: string) => ipcRenderer.invoke('data:get-riwaya-text', riwaya),
    hasRiwaya: (riwaya: string) => ipcRenderer.invoke('data:has-riwaya', riwaya),
    getVerseAudioPath: (reciter: string, surah: number, ayah: number) =>
      ipcRenderer.invoke('data:get-verse-audio-path', reciter, surah, ayah),
    getPageImagePath: (page: number) => ipcRenderer.invoke('data:get-page-image-path', page),
  },
  download: {
    start: (job: { type: string; items: unknown }) => ipcRenderer.invoke('download:start', job),
    cancel: (jobId: string) => ipcRenderer.invoke('download:cancel', jobId),
    onProgress: (cb: (e: unknown) => void): (() => void) => {
      const listener = (_evt: unknown, payload: unknown) => cb(payload);
      ipcRenderer.on('download:progress', listener);
      return () => {
        ipcRenderer.removeListener('download:progress', listener);
      };
    },
  },
  storage: {
    list: () => ipcRenderer.invoke('storage:list'),
    delete: (key: string) => ipcRenderer.invoke('storage:delete', key),
    getPath: () => ipcRenderer.invoke('storage:get-path'),
  },
  app: {
    platform: process.platform,
    isElectron: true,
  },
};

contextBridge.exposeInMainWorld('gtQuran', api);

export type GtQuranApi = typeof api;
