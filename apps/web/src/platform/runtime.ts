// كاشف البيئة الموحَّد: web (متصفح) | pwa (مثبَّت) | android | ios.
import { Capacitor } from '@capacitor/core';

interface GtQuranApi {
  data: {
    getPageText: (page: number, riwaya: string) => Promise<unknown>;
    getRiwayaText: (riwaya: string) => Promise<unknown>;
    hasRiwaya: (riwaya: string) => Promise<boolean>;
    getVerseAudioPath: (reciter: string, surah: number, ayah: number) => Promise<string | null>;
    getPageImagePath: (page: number) => Promise<string | null>;
  };
  download: {
    start: (job: unknown) => Promise<unknown>;
    cancel: (jobId: string) => Promise<unknown>;
    onProgress: (cb: (p: unknown) => void) => () => void;
  };
  storage: {
    list: () => Promise<Record<string, number>>;
    delete: (key: string) => Promise<unknown>;
    getPath: () => Promise<string>;
  };
  app: { platform: string; isElectron: boolean };
}

declare global {
  interface Window {
    gtQuran?: GtQuranApi;
  }
}

export const isElectron = false;
export const gtQuran: GtQuranApi | undefined = undefined;

export const isCapacitor = Capacitor.isNativePlatform();
export const capacitorPlatform = Capacitor.getPlatform(); // 'web' | 'android' | 'ios'

export type AppPlatform = 'web' | 'pwa' | 'android' | 'ios';

export const appPlatform: AppPlatform = (() => {
  if (capacitorPlatform === 'android') return 'android';
  if (capacitorPlatform === 'ios') return 'ios';
  if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
    return 'pwa';
  }
  return 'web';
})();

export const platformLabel: Record<AppPlatform, string> = {
  web: 'الويب',
  pwa: 'تطبيق ويب (PWA)',
  android: 'أندرويد',
  ios: 'iOS',
};
