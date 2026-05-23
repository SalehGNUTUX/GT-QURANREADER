import { isCapacitor, capacitorPlatform } from './runtime';

/**
 * تهيئة Capacitor (status bar + back button + إلخ).
 * استدعَ هذه الدالة مرة واحدة عند بدء التطبيق.
 * يعيد دالة cleanup إن وُجدت.
 */
export async function initCapacitor(onBackButton?: () => boolean): Promise<() => void> {
  if (!isCapacitor) return () => {};

  const cleanups: Array<() => void> = [];

  // ====== Status Bar ======
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    if (capacitorPlatform === 'android') {
      await StatusBar.setBackgroundColor({ color: '#1a1a2e' });
    }
  } catch (err) {
    console.warn('StatusBar init failed:', err);
  }

  // ====== Hardware Back Button (Android) ======
  try {
    const { App } = await import('@capacitor/app');
    const handle = await App.addListener('backButton', ({ canGoBack }) => {
      // إذا كان onBackButton يُعالج (أرجع true)، نمنع السلوك الافتراضي.
      const handled = onBackButton?.() ?? false;
      if (!handled && !canGoBack) {
        App.exitApp();
      } else if (!handled) {
        window.history.back();
      }
    });
    cleanups.push(() => handle.remove());
  } catch (err) {
    console.warn('Back button init failed:', err);
  }

  return () => {
    for (const fn of cleanups) {
      try {
        fn();
      } catch {
        /* ignore */
      }
    }
  };
}
