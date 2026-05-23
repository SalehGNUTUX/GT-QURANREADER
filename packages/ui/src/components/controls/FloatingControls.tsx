interface Props {
  onPrev: () => void;
  onNext: () => void;
  onPlay: () => void;
  onStop: () => void;
  onSearch: () => void;
  onMenu: () => void;
  onToggleFullscreen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isPlaying: boolean;
  hasActiveSession: boolean;
  isFullscreen: boolean;
  canPlay: boolean;
  /** يفعّل أزرار الزوم — يكون false عند وضع الصورة (لا فائدة). */
  canZoom: boolean;
}

// شريط تحكم عائم في أسفل الشاشة.
// - الوضع العادي:    [›] [☰] [⛶] [▶] [🔍] [‹]
// - أثناء القراءة:  [›] [☰] [⛶] [⏸/▶] [■] [🔍] [‹]
// - ملء الشاشة: زر البحث يُستبدل بـ stack عمودي [➕/➖] للتكبير/التصغير.
export function FloatingControls({
  onPrev,
  onNext,
  onPlay,
  onStop,
  onSearch,
  onMenu,
  onToggleFullscreen,
  onZoomIn,
  onZoomOut,
  isPlaying,
  hasActiveSession,
  isFullscreen,
  canPlay,
  canZoom,
}: Props) {
  return (
    <div className="floating-controls" role="toolbar" aria-label="أدوات التحكم العائمة">
      <button
        type="button"
        className="floating-btn floating-btn-pagenav"
        onClick={onPrev}
        aria-label="الصفحة السابقة"
        title="السابقة"
      >
        ›
      </button>
      <button
        type="button"
        className="floating-btn"
        onClick={onMenu}
        aria-label="القائمة"
        title="القائمة"
      >
        ☰
      </button>
      <button
        type="button"
        className={`floating-btn ${isFullscreen ? 'floating-btn-active' : ''}`}
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}
        title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}
      >
        ⛶
      </button>
      <button
        type="button"
        className="floating-btn floating-btn-main"
        onClick={onPlay}
        disabled={!canPlay}
        aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
        title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
      {hasActiveSession && (
        <button
          type="button"
          className="floating-btn floating-btn-stop"
          onClick={onStop}
          aria-label="إيقاف تام"
          title="إيقاف تام"
        >
          ■
        </button>
      )}

      {/* في الوضع العادي: زر البحث. في ملء الشاشة: stack عمودي للتكبير/التصغير. */}
      {!isFullscreen ? (
        <button
          type="button"
          className="floating-btn floating-btn-search"
          onClick={onSearch}
          aria-label="البحث"
          title="بحث"
        >
          🔍
        </button>
      ) : (
        <div className="floating-zoom-stack" role="group" aria-label="حجم الخط">
          <button
            type="button"
            className="floating-btn floating-btn-zoom"
            onClick={onZoomIn}
            disabled={!canZoom}
            aria-label="تكبير الخط"
            title="تكبير الخط"
          >
            ＋
          </button>
          <button
            type="button"
            className="floating-btn floating-btn-zoom"
            onClick={onZoomOut}
            disabled={!canZoom}
            aria-label="تصغير الخط"
            title="تصغير الخط"
          >
            －
          </button>
        </div>
      )}

      <button
        type="button"
        className="floating-btn floating-btn-pagenav"
        onClick={onNext}
        aria-label="الصفحة التالية"
        title="التالية"
      >
        ‹
      </button>
    </div>
  );
}
