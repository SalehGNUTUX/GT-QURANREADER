import { useCallback, useEffect, useState } from 'react';

/**
 * يدير وضع "ملء الشاشة" مع:
 * - تفعيل/تعطيل Fullscreen API على عنصر document.documentElement.
 * - تتبّع حالة "خامل" (idle) لإخفاء الأدوات تدريجياً بعد فترة من عدم النشاط.
 * - أي حركة (mousemove/touch/key) تُعيد ظهور الأدوات.
 */
const IDLE_TIMEOUT_MS = 3000;

export function useFullscreen() {
  const [active, setActive] = useState(false);
  const [idle, setIdle] = useState(false);

  // التزامن مع تغيّرات Fullscreen API الخارجية (مثلاً المستخدم ضغط Esc).
  useEffect(() => {
    const sync = () => {
      const fsActive = Boolean(document.fullscreenElement);
      setActive(fsActive);
      if (!fsActive) setIdle(false);
    };
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  // مؤقّت الخمول: فقط أثناء fullscreen.
  useEffect(() => {
    if (!active) return;
    let timer: number | undefined;

    const wake = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), IDLE_TIMEOUT_MS);
    };

    wake();
    const events: (keyof DocumentEventMap)[] = ['mousemove', 'touchstart', 'touchmove', 'keydown', 'click'];
    for (const e of events) document.addEventListener(e, wake, { passive: true });

    return () => {
      window.clearTimeout(timer);
      for (const e of events) document.removeEventListener(e, wake);
    };
  }, [active]);

  const enter = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // قد ترفض بعض المتصفحات الـ fullscreen خارج user gesture — نتعامل مع UI كأنه مُفعّل.
      setActive(true);
    }
  }, []);

  const exit = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* تجاهل */
    }
    setActive(false);
  }, []);

  const toggle = useCallback(() => {
    if (active) void exit();
    else void enter();
  }, [active, enter, exit]);

  return { active, idle, enter, exit, toggle };
}
