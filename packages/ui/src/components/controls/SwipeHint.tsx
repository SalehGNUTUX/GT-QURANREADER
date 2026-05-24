import { useEffect, useState } from 'react';

interface Props {
  /** عرض التلميح بحد ذاته — يأتي من App. */
  show: boolean;
  /** يخفي التلميح بعد المدة. */
  onDismiss: () => void;
  /** ms قبل الإخفاء التلقائي. الافتراضي 4 ثوان. */
  duration?: number;
}

// تلميح بصري يظهر عند دخول ملء الشاشة على الموبايل،
// يشرح للمستخدم أن السحب يميناً/يساراً يبدّل الصفحات (لأن الأزرار اختفت).
export function SwipeHint({ show, onDismiss, duration = 4000 }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = window.setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, duration);
    return () => window.clearTimeout(t);
  }, [show, duration, onDismiss]);

  if (!visible) return null;

  return (
    <div className="swipe-hint" role="status" aria-live="polite">
      <div className="swipe-hint-content">
        <span className="swipe-hint-arrow" aria-hidden="true">→</span>
        <span className="swipe-hint-text">اسحب يميناً أو يساراً لتغيير الصفحة</span>
        <span className="swipe-hint-arrow" aria-hidden="true">←</span>
      </div>
      <button
        type="button"
        className="swipe-hint-close"
        onClick={() => {
          setVisible(false);
          onDismiss();
        }}
        aria-label="إغلاق التلميح"
      >
        ✕
      </button>
    </div>
  );
}
