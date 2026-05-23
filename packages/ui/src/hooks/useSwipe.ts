import { useEffect, useRef } from 'react';

interface Options {
  onSwipeLeft?: () => void; // سحب لليسار → الصفحة التالية (في rtl)
  onSwipeRight?: () => void; // سحب لليمين → الصفحة السابقة
  threshold?: number; // الحد الأدنى للمسافة (px)
  maxVertical?: number; // أقصى انحراف عمودي للقبول
}

/**
 * تتبّع touch gestures على عنصر. يعيد ref يُربط بـ container.
 * يستثني العناصر التي يمكن تمريرها (input/textarea/scroll).
 */
export function useSwipe<T extends HTMLElement = HTMLElement>(options: Options) {
  const ref = useRef<T | null>(null);
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const optsRef = useRef(options);
  optsRef.current = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const threshold = options.threshold ?? 60;
    const maxVertical = options.maxVertical ?? 80;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      startRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    };

    const onEnd = (e: TouchEvent) => {
      const start = startRef.current;
      if (!start) return;
      const end = e.changedTouches[0];
      if (!end) return;
      const dx = end.clientX - start.x;
      const dy = end.clientY - start.y;
      const dt = Date.now() - start.t;
      startRef.current = null;

      if (dt > 700) return; // سحب بطيء = scroll
      if (Math.abs(dy) > maxVertical) return; // انحراف عمودي
      if (Math.abs(dx) < threshold) return;

      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, button, a, .modal-card, .search-results-card')) return;

      if (dx < 0) optsRef.current.onSwipeLeft?.();
      else optsRef.current.onSwipeRight?.();
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend', onEnd);
    };
  }, [options.threshold, options.maxVertical]);

  return ref;
}
