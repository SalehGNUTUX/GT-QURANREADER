import { Modal } from './Modal';

export type BookmarkAction = 'save' | 'goto' | 'remove' | null;

interface Props {
  onClose: () => void;
  onSearch: () => void;
  onOpenSurahList: () => void;
  onOpenRiwaya: () => void;
  onOpenReciter: () => void;
  onOpenFontPicker: () => void;
  /** الأسماء المعروضة للحالة الحالية (للظهور في تسمية الأزرار). */
  currentRiwayaName: string;
  currentReciterName: string;
  currentFontName: string;
  onSaveReadingBookmark: () => void;
  onGoToReadingBookmark: () => void;
  onRemoveReadingBookmark: () => void;
  hasReadingBookmark: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canZoom: boolean;
  /** مستوى الصوت 0..1. */
  volume: number;
  onVolumeChange: (v: number) => void;
}

// قائمة الأدوات الشاملة — تُفتح من زر ⋯.
// تحوي: السور، البحث، كل أزرار العلامة، وضبط الخط.
export function ToolsMenuModal({
  onClose,
  onSearch,
  onOpenSurahList,
  onOpenRiwaya,
  onOpenReciter,
  onOpenFontPicker,
  currentRiwayaName,
  currentReciterName,
  currentFontName,
  onSaveReadingBookmark,
  onGoToReadingBookmark,
  onRemoveReadingBookmark,
  hasReadingBookmark,
  onZoomIn,
  onZoomOut,
  canZoom,
  volume,
  onVolumeChange,
}: Props) {
  const close = (fn: () => void) => () => { fn(); onClose(); };
  // الزوم لا يُغلق القائمة — يسمح بنقرات متعددة لضبط الحجم.
  const keepOpen = (fn: () => void) => () => fn();

  return (
    <Modal title="أدوات" onClose={onClose}>
      <div className="tools-menu">
        <button type="button" className="tools-menu-item" onClick={close(onOpenSurahList)}>
          <span className="tools-menu-icon">☰</span>
          <span className="tools-menu-text">قائمة السور</span>
        </button>

        <button type="button" className="tools-menu-item" onClick={close(onSearch)}>
          <span className="tools-menu-icon">🔍</span>
          <span className="tools-menu-text">البحث</span>
        </button>

        <div className="tools-menu-separator">تخصيص القراءة</div>

        <button type="button" className="tools-menu-item" onClick={close(onOpenRiwaya)}>
          <span className="tools-menu-icon">📜</span>
          <span className="tools-menu-text">الرواية</span>
          <span className="tools-menu-meta">{currentRiwayaName}</span>
        </button>

        <button type="button" className="tools-menu-item" onClick={close(onOpenReciter)}>
          <span className="tools-menu-icon">🎤</span>
          <span className="tools-menu-text">القارئ</span>
          <span className="tools-menu-meta">{currentReciterName}</span>
        </button>

        <button type="button" className="tools-menu-item" onClick={close(onOpenFontPicker)}>
          <span className="tools-menu-icon">🔤</span>
          <span className="tools-menu-text">الخط القرآني</span>
          <span className="tools-menu-meta">{currentFontName}</span>
        </button>

        <div className="tools-menu-separator">علامة موضع القراءة</div>

        <button type="button" className="tools-menu-item" onClick={close(onSaveReadingBookmark)}>
          <span className="tools-menu-icon">🔖</span>
          <span className="tools-menu-text">
            {hasReadingBookmark ? 'احفظ هنا (يستبدل العلامة)' : 'احفظ موضع القراءة'}
          </span>
        </button>

        {hasReadingBookmark && (
          <button type="button" className="tools-menu-item" onClick={close(onGoToReadingBookmark)}>
            <span className="tools-menu-icon">📖</span>
            <span className="tools-menu-text">اذهب إلى الموضع المحفوظ</span>
          </button>
        )}

        {hasReadingBookmark && (
          <button
            type="button"
            className="tools-menu-item tools-menu-item-bookmark-remove"
            onClick={close(onRemoveReadingBookmark)}
          >
            <span className="tools-menu-icon">🗑️</span>
            <span className="tools-menu-text">إزالة العلامة</span>
          </button>
        )}

        {canZoom && (
          <>
            <div className="tools-menu-separator">حجم الخط</div>
            <div className="tools-menu-row">
              <button
                type="button"
                className="tools-menu-item tools-menu-item-half"
                onClick={keepOpen(onZoomIn)}
              >
                <span className="tools-menu-icon">＋</span>
                <span className="tools-menu-text">تكبير</span>
              </button>
              <button
                type="button"
                className="tools-menu-item tools-menu-item-half"
                onClick={keepOpen(onZoomOut)}
              >
                <span className="tools-menu-icon">－</span>
                <span className="tools-menu-text">تصغير</span>
              </button>
            </div>
          </>
        )}

        <div className="tools-menu-separator">مستوى الصوت</div>
        <div className="tools-menu-volume">
          <button
            type="button"
            className="tools-menu-volume-btn"
            onClick={() => onVolumeChange(Math.max(0, volume - 0.1))}
            aria-label="خفض الصوت"
          >
            🔉
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="tools-menu-volume-slider"
            aria-label="مستوى الصوت"
          />
          <button
            type="button"
            className="tools-menu-volume-btn"
            onClick={() => onVolumeChange(Math.min(1, volume + 0.1))}
            aria-label="رفع الصوت"
          >
            🔊
          </button>
          <span className="tools-menu-volume-pct">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </Modal>
  );
}
