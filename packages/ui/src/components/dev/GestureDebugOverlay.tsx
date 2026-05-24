import { useEffect, useRef, useState } from 'react';

interface LogEntry {
  ts: number;
  text: string;
  type: 'start' | 'move' | 'end' | 'cancel' | 'detect' | 'reject';
}

// Overlay تصحيح بصري للإيماءات — يظهر فقط عند ?debug=gestures في URL.
// مفيد على الهاتف الحقيقي حيث console غير متاح بسهولة.
export function GestureDebugOverlay() {
  const [active, setActive] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') !== 'gestures') return;
    setActive(true);

    const push = (text: string, type: LogEntry['type']) => {
      setLogs((prev) => {
        const next = [...prev, { ts: Date.now(), text, type }];
        return next.slice(-12); // أبقِ آخر 12 entry فقط
      });
    };

    const onStart = (e: TouchEvent) => {
      const n = e.touches.length;
      const t = e.touches[0];
      if (!t) { push(`start: no touches`, 'start'); return; }
      const w = window.innerWidth;
      const edge = t.clientX < 18 || t.clientX > w - 18;
      startRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
      push(`start n=${n} x=${Math.round(t.clientX)} y=${Math.round(t.clientY)}${edge ? ' EDGE!' : ''}`, 'start');
    };

    const onMove = (e: TouchEvent) => {
      // لا نُسجّل كل move (كثير) — فقط الأول
      const start = startRef.current;
      if (!start) return;
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
        // نُسجل عند تجاوز عتبة قراءة فقط (لتقليل التكرار)
        if (Math.abs(dx) > 30 && Math.abs(dy) < 160 && (logs[logs.length - 1]?.type !== 'detect')) {
          push(`detect: dx=${Math.round(dx)} dy=${Math.round(dy)} ⇨ SHOULD SWIPE`, 'detect');
        }
      }
    };

    const onEnd = (e: TouchEvent) => {
      const start = startRef.current;
      startRef.current = null;
      if (!start) return;
      const end = e.changedTouches[0];
      if (!end) { push('end: no changedTouches', 'end'); return; }
      const dx = Math.round(end.clientX - start.x);
      const dy = Math.round(end.clientY - start.y);
      const dt = Date.now() - start.t;
      const swiped = Math.abs(dx) >= 30 && Math.abs(dy) <= 160 && dt <= 1200;
      push(`end dx=${dx} dy=${dy} dt=${dt}ms ${swiped ? '✓ SWIPE' : '✗ no swipe'}`, swiped ? 'detect' : 'reject');
    };

    const onCancel = () => {
      push('cancel', 'cancel');
      startRef.current = null;
    };

    // أحداث مُخصَّصة من useSwipe / usePinchZoom للتأكيد البصري
    const onSwipeFired = (e: Event) => {
      const d = (e as CustomEvent).detail as { direction: string; dx: number; dy: number; dt: number };
      push(`🔥 SWIPE FIRED: ${d.direction} (dx=${d.dx} dy=${d.dy})`, 'detect');
    };
    const onPinchStart = (e: Event) => {
      const d = (e as CustomEvent).detail as { distance: number; baseSize: number };
      push(`👌 pinch-start: d=${Math.round(d.distance)} base=${d.baseSize}`, 'start');
    };
    const onPinchFired = (e: Event) => {
      const d = (e as CustomEvent).detail as { size: number; ratio: string };
      push(`🔥 PINCH FIRED: size=${d.size} ratio=${d.ratio}`, 'detect');
    };

    document.addEventListener('touchstart', onStart, { passive: true, capture: true });
    document.addEventListener('touchmove', onMove, { passive: true, capture: true });
    document.addEventListener('touchend', onEnd, { passive: true, capture: true });
    document.addEventListener('touchcancel', onCancel, { passive: true, capture: true });
    window.addEventListener('gtqr:swipe-fired', onSwipeFired);
    window.addEventListener('gtqr:pinch-start', onPinchStart);
    window.addEventListener('gtqr:pinch-fired', onPinchFired);

    return () => {
      document.removeEventListener('touchstart', onStart, true);
      document.removeEventListener('touchmove', onMove, true);
      document.removeEventListener('touchend', onEnd, true);
      document.removeEventListener('touchcancel', onCancel, true);
      window.removeEventListener('gtqr:swipe-fired', onSwipeFired);
      window.removeEventListener('gtqr:pinch-start', onPinchStart);
      window.removeEventListener('gtqr:pinch-fired', onPinchFired);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!active) return null;

  return (
    <div className="gesture-debug-overlay" aria-hidden="true">
      <div className="gesture-debug-header">
        🐛 Gesture Debug
        <button
          type="button"
          className="gesture-debug-close"
          onClick={() => setActive(false)}
        >
          ✕
        </button>
      </div>
      <div className="gesture-debug-log">
        {logs.length === 0 && <div className="gesture-debug-empty">touch the screen…</div>}
        {logs.slice().reverse().map((e, i) => (
          <div key={`${e.ts}-${i}`} className={`gesture-debug-entry gesture-debug-entry-${e.type}`}>
            {e.text}
          </div>
        ))}
      </div>
    </div>
  );
}
