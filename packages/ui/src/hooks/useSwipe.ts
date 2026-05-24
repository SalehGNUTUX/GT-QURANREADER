import { useEffect, useRef } from 'react';

interface Options {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  maxVertical?: number;
}

/**
 * تتبّع touch gestures على document مباشرة (مرحلة capture) دون فلاتر
 * بنية DOM. هذا يضمن أن أي سحب أفقي صالح يُطلق الـ callback.
 *
 * يُستثنى فقط: العناصر الواضحة التي يجب تركها (input/textarea/modal).
 * لا فلتر .app-shell — لو وصلت الحدث للـ document، نتعامل معها.
 *
 * يبعث custom event `gtqr:swipe-fired` عند الإطلاق ليلتقطه GestureDebugOverlay.
 */
export function useSwipe<T extends HTMLElement = HTMLElement>(options: Options) {
  const ref = useRef<T | null>(null);
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const optsRef = useRef(options);
  optsRef.current = options;

  useEffect(() => {
    const threshold = options.threshold ?? 30;
    const maxVertical = options.maxVertical ?? 160;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        startRef.current = null;
        return;
      }
      const t = e.touches[0];
      if (!t) return;
      const target = e.target as HTMLElement | null;
      // استثناء فقط العناصر التفاعلية المحتمَلة
      if (target?.closest('input, textarea, .modal-backdrop, .search-results-card')) {
        startRef.current = null;
        return;
      }
      startRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    };

    const onEnd = (e: TouchEvent) => {
      const start = startRef.current;
      startRef.current = null;
      if (!start) return;
      const end = e.changedTouches[0];
      if (!end) return;
      const dx = end.clientX - start.x;
      const dy = end.clientY - start.y;
      const dt = Date.now() - start.t;

      if (dt > 1200) return;
      if (Math.abs(dy) > maxVertical) return;
      if (Math.abs(dx) < threshold) return;

      // إشعار overlay (للتشخيص البصري) أن الـ callback تم إطلاقه فعلاً
      try {
        window.dispatchEvent(new CustomEvent('gtqr:swipe-fired', {
          detail: { direction: dx < 0 ? 'left' : 'right', dx, dy, dt },
        }));
      } catch { /* تجاهل */ }

      if (dx < 0) optsRef.current.onSwipeLeft?.();
      else optsRef.current.onSwipeRight?.();
    };

    const onCancel = () => {
      startRef.current = null;
    };

    document.addEventListener('touchstart', onStart, { passive: true, capture: true });
    document.addEventListener('touchend', onEnd, { passive: true, capture: true });
    document.addEventListener('touchcancel', onCancel, { passive: true, capture: true });

    return () => {
      document.removeEventListener('touchstart', onStart, true);
      document.removeEventListener('touchend', onEnd, true);
      document.removeEventListener('touchcancel', onCancel, true);
    };
  }, [options.threshold, options.maxVertical]);

  return ref;
}
