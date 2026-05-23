import { useEffect, useRef } from 'react';

interface Props {
  title: string;
  message: string;
  /** نص زر الموافقة (اختياري، الافتراضي "موافق"). */
  confirmLabel?: string;
  /** نص زر الإلغاء (اختياري، الافتراضي "إلغاء"). */
  cancelLabel?: string;
  /** أيقونة في الأعلى (emoji أو نص). */
  icon?: string;
  /** نوع الحوار يحدد لون الزر الرئيسي. */
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * حوار تأكيد مخصّص بتصميم التطبيق — بديل عن window.confirm().
 * يظهر في وسط الشاشة فوق طبقة نصف شفافة.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'موافق',
  cancelLabel = 'إلغاء',
  icon,
  variant = 'default',
  onConfirm,
  onCancel,
}: Props) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // ركّز على زر الموافقة افتراضياً (Enter يقبل، Esc يلغي).
    confirmBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="modal-backdrop" onClick={onCancel} role="presentation">
      <div
        className="modal-card confirm-dialog"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        {icon && (
          <div className="confirm-dialog-icon" aria-hidden="true">
            {icon}
          </div>
        )}
        <h3 id="confirm-title" className="confirm-dialog-title">
          {title}
        </h3>
        <p id="confirm-message" className="confirm-dialog-message">
          {message}
        </p>
        <div className="confirm-dialog-actions">
          <button
            ref={confirmBtnRef}
            type="button"
            className={`confirm-dialog-btn ${
              variant === 'danger' ? 'confirm-dialog-btn-danger' : 'confirm-dialog-btn-primary'
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button type="button" className="confirm-dialog-btn confirm-dialog-btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
