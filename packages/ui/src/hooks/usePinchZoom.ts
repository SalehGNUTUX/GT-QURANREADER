import { useEffect, useRef } from 'react';

interface Options {
  onZoom: (newSize: number) => void;
  currentSize: number;
  min?: number;
  max?: number;
  enabled?: boolean;
}

/**
 * إيماءة pinch بإصبعين لتغيير حجم الخط.
 *
 * تستمع على document مباشرة (مرحلة capture) لتجنّب مشاكل ref/bubble.
 * touchmove non-passive يُسجَّل ديناميكياً فقط عند رصد إصبعين — لا يتدخّل في single-touch swipe.
 *
 * يبعث `gtqr:pinch-fired` و `gtqr:pinch-start` ليلتقطها GestureDebugOverlay.
 */
export function usePinchZoom<T extends HTMLElement = HTMLElement>(options: Options) {
  const ref = useRef<T | null>(null);
  const optsRef = useRef(options);
  optsRef.current = options;

  const startStateRef = useRef<{ distance: number; baseSize: number } | null>(null);
  const moveListenerRef = useRef<((e: TouchEvent) => void) | null>(null);

  useEffect(() => {
    const distance = (touches: TouchList): number => {
      const a = touches[0], b = touches[1];
      const dx = a.clientX - b.clientX;
      const dy = a.clientY - b.clientY;
      return Math.hypot(dx, dy);
    };

    const handleMove = (e: TouchEvent) => {
      if (!startStateRef.current) return;
      if (e.touches.length !== 2) return;
      // نمنع pinch المتصفح ليتجنّب تكبير الصفحة كلها
      try { e.preventDefault(); } catch { /* تجاهل */ }
      const currDist = distance(e.touches);
      const ratio = currDist / startStateRef.current.distance;
      const min = optsRef.current.min ?? 80;
      const max = optsRef.current.max ?? 200;
      const rawSize = startStateRef.current.baseSize * ratio;
      const rounded = Math.round(rawSize / 5) * 5;
      const clamped = Math.max(min, Math.min(max, rounded));
      if (clamped !== optsRef.current.currentSize) {
        optsRef.current.onZoom(clamped);
        try {
          window.dispatchEvent(new CustomEvent('gtqr:pinch-fired', {
            detail: { size: clamped, ratio: ratio.toFixed(2) },
          }));
        } catch { /* تجاهل */ }
      }
    };

    const removeMoveListener = () => {
      if (moveListenerRef.current) {
        document.removeEventListener('touchmove', moveListenerRef.current, true);
        moveListenerRef.current = null;
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!optsRef.current.enabled) return;
      if (e.touches.length !== 2) {
        removeMoveListener();
        startStateRef.current = null;
        return;
      }
      startStateRef.current = {
        distance: distance(e.touches),
        baseSize: optsRef.current.currentSize,
      };
      try {
        window.dispatchEvent(new CustomEvent('gtqr:pinch-start', {
          detail: { distance: startStateRef.current.distance, baseSize: optsRef.current.currentSize },
        }));
      } catch { /* تجاهل */ }
      // الآن نُسجل touchmove non-passive — يُلغى عند انخفاض عدد الأصابع.
      if (!moveListenerRef.current) {
        moveListenerRef.current = handleMove;
        document.addEventListener('touchmove', moveListenerRef.current, { passive: false, capture: true });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        startStateRef.current = null;
        removeMoveListener();
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true, capture: true });
    document.addEventListener('touchcancel', onTouchEnd, { passive: true, capture: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart, true);
      document.removeEventListener('touchend', onTouchEnd, true);
      document.removeEventListener('touchcancel', onTouchEnd, true);
      removeMoveListener();
    };
  }, []);

  return ref;
}
