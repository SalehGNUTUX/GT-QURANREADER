import type { GtQuranApi } from '../../electron/preload';

declare global {
  interface Window {
    gtQuran?: GtQuranApi;
  }
}

export const isElectron = typeof window !== 'undefined' && Boolean(window.gtQuran?.app.isElectron);
export const gtQuran = typeof window !== 'undefined' ? window.gtQuran : undefined;
