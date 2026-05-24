import { useEffect, useState, type ReactNode } from 'react';
import type { BookmarkAction } from '../modals/ToolsMenuModal';

interface Props {
  onPrev: () => void;
  onNext: () => void;
  onPlay: () => void;
  onStop: () => void;
  onToggleFullscreen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onOpenToolsMenu: () => void;
  bookmarkAction: BookmarkAction;
  onBookmarkAction: () => void;
  isPlaying: boolean;
  hasActiveSession: boolean;
  isFullscreen: boolean;
  /** عند الخمول في ملء الشاشة — يخفي اللوحات المنبثقة تلقائياً. */
  isIdle: boolean;
  canPlay: boolean;
  canZoom: boolean;
}

const BOOKMARK_LABEL: Record<NonNullable<BookmarkAction>, { icon: string; title: string }> = {
  save:   { icon: '🔖', title: 'احفظ موضع القراءة' },
  goto:   { icon: '📖', title: 'اذهب إلى موضع القراءة المحفوظ' },
  remove: { icon: '🗑️', title: 'إزالة علامة موضع القراءة' },
};

/**
 * Hook عام لإغلاق popover عند tap خارجها أو خمول/استبعاد.
 */
function useDismissPopover(
  isOpen: boolean,
  onClose: () => void,
  ignoreSelector: string,
  isIdle: boolean
) {
  useEffect(() => {
    if (!isOpen) return;
    if (isIdle) { onClose(); return; }
    const close = (e: MouseEvent | TouchEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest(ignoreSelector)) return;
      onClose();
    };
    const id = window.setTimeout(() => {
      document.addEventListener('click', close, true);
      document.addEventListener('touchstart', close, true);
    }, 100);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('click', close, true);
      document.removeEventListener('touchstart', close, true);
    };
  }, [isOpen, isIdle, onClose, ignoreSelector]);
}

// شريط تحكم عائم.
// أزرار inline: [📄] [⛶] [⏸/▶] [■?] [🔖/📖/🗑️] [خخ?] [⋯]
// زر 📄 على الموبايل يفتح popover ‹/›. على سطح المكتب الأزرار مرئية inline دائماً.
export function FloatingControls({
  onPrev,
  onNext,
  onPlay,
  onStop,
  onToggleFullscreen,
  onZoomIn,
  onZoomOut,
  onOpenToolsMenu,
  bookmarkAction,
  onBookmarkAction,
  isPlaying,
  hasActiveSession,
  isFullscreen,
  isIdle,
  canPlay,
  canZoom,
}: Props) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [pageNavOpen, setPageNavOpen] = useState(false);

  // إخفاء تلقائي للوحات المنبثقة عند الخمول/تعطيل.
  useEffect(() => {
    if (!canZoom) setZoomOpen(false);
  }, [canZoom]);

  useDismissPopover(
    zoomOpen,
    () => setZoomOpen(false),
    '.floating-zoom-popover, .floating-btn-zoom-toggle',
    isIdle
  );
  useDismissPopover(
    pageNavOpen,
    () => setPageNavOpen(false),
    '.floating-pagenav-popover, .floating-btn-pagenav-toggle',
    isIdle
  );

  return (
    <>
      {zoomOpen && canZoom && (
        <div className="floating-zoom-popover" role="group" aria-label="حجم الخط">
          <button type="button" className="floating-popover-btn" onClick={onZoomIn} aria-label="تكبير الخط" title="تكبير">＋</button>
          <button type="button" className="floating-popover-btn" onClick={onZoomOut} aria-label="تصغير الخط" title="تصغير">－</button>
        </div>
      )}

      {pageNavOpen && (
        <div className="floating-pagenav-popover" role="group" aria-label="تنقل الصفحات">
          <button
            type="button"
            className="floating-popover-btn"
            onClick={() => { onPrev(); }}
            aria-label="الصفحة السابقة"
            title="السابقة"
          >
            ‹
          </button>
          <button
            type="button"
            className="floating-popover-btn"
            onClick={() => { onNext(); }}
            aria-label="الصفحة التالية"
            title="التالية"
          >
            ›
          </button>
        </div>
      )}

      <div className="floating-controls" role="toolbar" aria-label="أدوات التحكم العائمة">
        {/* أزرار ‹/› inline لسطح المكتب فقط — على الموبايل تختفي ويظهر زر 📄 */}
        <FloatingBtn
          className="floating-btn-pagenav floating-btn-desktop-only"
          onClick={onPrev}
          ariaLabel="الصفحة السابقة"
          title="السابقة"
        >
          ‹
        </FloatingBtn>

        <FloatingBtn
          className={isFullscreen ? 'floating-btn-active' : ''}
          onClick={onToggleFullscreen}
          ariaLabel={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}
          title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}
        >
          ⛶
        </FloatingBtn>

        <FloatingBtn
          className="floating-btn-main"
          onClick={onPlay}
          disabled={!canPlay}
          ariaLabel={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
        >
          {isPlaying ? '⏸' : '▶'}
        </FloatingBtn>

        {hasActiveSession && (
          <FloatingBtn
            className="floating-btn-stop"
            onClick={onStop}
            ariaLabel="إيقاف تام"
            title="إيقاف تام"
          >
            ■
          </FloatingBtn>
        )}

        {bookmarkAction && (
          <FloatingBtn
            className={`floating-btn-bookmark floating-btn-bookmark-${bookmarkAction}`}
            onClick={onBookmarkAction}
            ariaLabel={BOOKMARK_LABEL[bookmarkAction].title}
            title={BOOKMARK_LABEL[bookmarkAction].title}
          >
            {BOOKMARK_LABEL[bookmarkAction].icon}
          </FloatingBtn>
        )}

        {canZoom && (
          <FloatingBtn
            className={`floating-btn-zoom-toggle ${zoomOpen ? 'floating-btn-active' : ''}`}
            onClick={() => setZoomOpen((v) => !v)}
            ariaLabel="ضبط حجم الخط"
            title="حجم الخط"
          >
            <span className="zoom-icon" aria-hidden="true">
              <span className="zoom-icon-big">خ</span>
              <span className="zoom-icon-small">خ</span>
            </span>
          </FloatingBtn>
        )}

        {/* زر 📄 للتنقل بين الصفحات — موبايل فقط (احتياط للسحب). */}
        <FloatingBtn
          className={`floating-btn-pagenav-toggle floating-btn-mobile-only ${pageNavOpen ? 'floating-btn-active' : ''}`}
          onClick={() => setPageNavOpen((v) => !v)}
          ariaLabel="تنقل الصفحات"
          title="تنقل الصفحات (احتياط)"
        >
          📄
        </FloatingBtn>

        <FloatingBtn
          className="floating-btn-more"
          onClick={onOpenToolsMenu}
          ariaLabel="المزيد"
          title="المزيد (السور والبحث والإعدادات السريعة)"
        >
          ⋯
        </FloatingBtn>

        <FloatingBtn
          className="floating-btn-pagenav floating-btn-desktop-only"
          onClick={onNext}
          ariaLabel="الصفحة التالية"
          title="التالية"
        >
          ›
        </FloatingBtn>
      </div>
    </>
  );
}

function FloatingBtn({
  className = '',
  onClick,
  disabled,
  ariaLabel,
  title,
  children,
}: {
  className?: string;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`floating-btn ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  );
}
