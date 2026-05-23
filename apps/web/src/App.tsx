import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ImagePage,
  TextPage,
  PageNav,
  PageInfo,
  ZoomControls,
  ThemeToggle,
  ViewModeToggle,
  FloatingControls,
  SearchBar,
  SearchResults,
  SurahListModal,
  JuzListModal,
  SajdaListModal,
  ReciterModal,
  RiwayaModal,
  SettingsModal,
  ConfirmDialog,
  usePreferences,
  useSearch,
  useSwipe,
  useFullscreen,
} from '@gt-quranreader/ui';
import {
  TOTAL_PAGES,
  getSurahByNumber,
  getSurahByPage,
  getRiwaya,
  getReciter,
  getFirstReciterForRiwaya,
} from '@gt-quranreader/core';
import type { RiwayaId } from '@gt-quranreader/core';
import type { SearchResult } from '@gt-quranreader/core';
import { useQuranData } from './hooks/useQuranData';
import { useVersePlayer } from './hooks/useVersePlayer';
import { DownloadManager } from './components/settings/DownloadManager';
import { isCapacitor } from './platform/runtime';
import { initCapacitor } from './platform/capacitor-init';

type VerseRef = { surah: number; ayah: number };
type OpenModal = null | 'surah' | 'juz' | 'sajda' | 'reciter' | 'riwaya' | 'settings';

export function App() {
  const { prefs, update, updateMany, reset, loaded } = usePreferences();
  const quran = useQuranData(prefs.riwaya);
  const player = useVersePlayer({
    reciterId: prefs.reciterId,
    autoNextVerse: true,
    autoNextSurah: prefs.autoPlayNext,
  });
  const search = useSearch(quran.data);
  const fullscreen = useFullscreen();

  const [highlightedVerse, setHighlightedVerse] = useState<VerseRef | null>(null);
  // عند التحميل أو بعد إيقاف تام، نضع علماً يدل على أن التظليل "مسترَدّ" — يُسأل المستخدم
  // قبل التشغيل: متابعة من هنا أم بدء السورة من جديد؟
  const [highlightFromStop, setHighlightFromStop] = useState(false);
  // حوار "متابعة / بدء جديد" — لو وُضع، يُعرض ConfirmDialog.
  const [resumeAsk, setResumeAsk] = useState<VerseRef | null>(null);
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // استعادة آخر آية مظللة من التفضيلات عند أول تحميل.
  useEffect(() => {
    if (loaded && prefs.lastStoppedAt && !highlightedVerse) {
      setHighlightedVerse(prefs.lastStoppedAt);
      setHighlightFromStop(true);
    }
    // إخفاء التحذير: نريد تشغيل الـ effect عند `loaded` فقط.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // حفظ كل تغيير للآية النشطة في prefs لاستعادتها في الجلسة التالية.
  useEffect(() => {
    if (loaded && player.activeVerse) {
      update('lastStoppedAt', player.activeVerse);
    }
  }, [player.activeVerse, loaded, update]);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // زر "العودة" في Android: يغلق modal أو يوقف الصوت.
  useEffect(() => {
    if (!isCapacitor) return;
    const cleanupPromise = initCapacitor(() => {
      if (openModal) {
        setOpenModal(null);
        return true;
      }
      if (search.open) {
        search.close();
        return true;
      }
      if (player.activeVerse) {
        player.stop();
        return true;
      }
      return false;
    });
    return () => {
      void cleanupPromise.then((fn) => fn());
    };
  }, [openModal, search, player]);

  // متابعة الصوت للصفحة فقط عندما تتغير الآية النشطة (وليس عند تغيير المستخدم للصفحة).
  const lastTrackedVerse = useRef<string | null>(null);
  useEffect(() => {
    if (!player.activeVerse || !quran.data) {
      lastTrackedVerse.current = null;
      return;
    }
    const key = `${player.activeVerse.surah}:${player.activeVerse.ayah}`;
    if (lastTrackedVerse.current === key) return; // لم تتغير الآية فعلياً
    lastTrackedVerse.current = key;
    const surah = quran.data.surahs.find((s) => s.number === player.activeVerse!.surah);
    const verse = surah?.verses.find((v) => v.number === player.activeVerse!.ayah);
    if (verse) update('currentPage', verse.page);
  }, [player.activeVerse, quran.data, update]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'sepia', 'gold');
    if (prefs.theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(prefs.theme);
    }
  }, [prefs.theme]);

  const onPageChange = useCallback((p: number) => update('currentPage', p), [update]);

  const goPrev = useCallback(
    () => update('currentPage', Math.max(1, prefs.currentPage - 1)),
    [prefs.currentPage, update]
  );
  const goNext = useCallback(
    () => update('currentPage', Math.min(TOTAL_PAGES, prefs.currentPage + 1)),
    [prefs.currentPage, update]
  );
  const swipeRef = useSwipe<HTMLDivElement>({ onSwipeLeft: goPrev, onSwipeRight: goNext });

  // زر التشغيل العائم:
  // - يعمل → إيقاف مؤقت
  // - متوقف على آية → استئناف
  // - آية مظللة من نقطة إيقاف سابقة → سؤال: متابعة من هنا أم بداية السورة؟
  // - آية مظللة من اختيار يدوي → ابدأ منها
  // - لا تظليل → ابدأ من بداية السورة في الصفحة الحالية
  const handlePlayPause = useCallback(() => {
    if (player.isPlaying) {
      player.pause();
      return;
    }
    if (player.activeVerse) {
      void player.resume();
      return;
    }
    if (highlightedVerse && highlightFromStop) {
      // افتح حوار "متابعة / بدء جديد" — ConfirmDialog مخصّص.
      setResumeAsk(highlightedVerse);
      return;
    }
    if (highlightedVerse) {
      void player.play(highlightedVerse.surah, highlightedVerse.ayah);
      return;
    }
    const surahInfo = getSurahByPage(prefs.currentPage);
    setHighlightedVerse({ surah: surahInfo.number, ayah: 1 });
    void player.play(surahInfo.number, 1);
  }, [player, highlightedVerse, highlightFromStop, prefs.currentPage]);

  // حوار المتابعة: قرار "موافق" → متابعة من الآية المحفوظة.
  const handleResumeConfirm = useCallback(() => {
    if (!resumeAsk) return;
    setHighlightFromStop(false);
    setHighlightedVerse(resumeAsk);
    void player.play(resumeAsk.surah, resumeAsk.ayah);
    setResumeAsk(null);
  }, [resumeAsk, player]);

  // حوار المتابعة: قرار "إلغاء" → بدء السورة الحالية من الآية 1.
  const handleResumeCancel = useCallback(() => {
    setHighlightFromStop(false);
    setResumeAsk(null);
    const surahInfo = getSurahByPage(prefs.currentPage);
    setHighlightedVerse({ surah: surahInfo.number, ayah: 1 });
    void player.play(surahInfo.number, 1);
  }, [prefs.currentPage, player]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') update('currentPage', Math.max(1, prefs.currentPage - 1));
      else if (e.key === 'ArrowLeft') {
        update('currentPage', Math.min(TOTAL_PAGES, prefs.currentPage + 1));
      } else if (e.key === ' ') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.key === 'Escape') {
        player.stop();
        setHighlightedVerse(null);
        search.close();
        setOpenModal(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prefs.currentPage, player, update, search, handlePlayPause]);

  // النقرة المفردة: toggle — إذا الآية نفسها مظللة، أزل التظليل، وإلا ظلّلها.
  const handleVerseSingleClick = useCallback(
    (surah: number, ayah: number) => {
      setHighlightedVerse((prev) =>
        prev && prev.surah === surah && prev.ayah === ayah ? null : { surah, ayah }
      );
      setHighlightFromStop(false); // المستخدم اختار آية يدوياً → لا سؤال للمتابعة
    },
    []
  );

  // إيقاف تام: ينهي الصوت لكن يبقي الآية مظللة كنقطة استئناف.
  // عند ▶ التالي سيُسأل المستخدم: متابعة من هنا أم بداية السورة؟
  const handleFullStop = useCallback(() => {
    const stoppedAt = player.activeVerse ?? highlightedVerse;
    player.stop();
    if (stoppedAt) {
      setHighlightedVerse(stoppedAt);
      setHighlightFromStop(true);
      update('lastStoppedAt', stoppedAt);
    } else {
      setHighlightedVerse(null);
    }
  }, [player, highlightedVerse, update]);

  // تغيير الرواية → إن كان القارئ الحالي ليس من نفس الرواية، نُبدّله لأول قارئ متاح فيها.
  const handleRiwayaChange = useCallback(
    (riwayaId: RiwayaId) => {
      const currentReciter = getReciter(prefs.reciterId);
      if (currentReciter?.riwaya === riwayaId) {
        update('riwaya', riwayaId);
        return;
      }
      const firstReciter = getFirstReciterForRiwaya(riwayaId);
      // أوقف الصوت لأن القارئ الجديد سيتولّى، ثم بدّل الرواية + القارئ معاً.
      player.stop();
      setHighlightedVerse(null);
      updateMany({
        riwaya: riwayaId,
        ...(firstReciter ? { reciterId: firstReciter.id } : {}),
      });
    },
    [prefs.reciterId, player, update, updateMany]
  );

  const handleVerseDoubleClick = useCallback(
    (surah: number, ayah: number) => {
      setHighlightedVerse({ surah, ayah });
      setHighlightFromStop(false);
      void player.play(surah, ayah);
    },
    [player]
  );

  const handleSearchSelect = useCallback(
    (r: SearchResult) => {
      update('currentPage', r.page);
      if (r.type === 'verse' && r.surahNumber && r.verseNumber) {
        setHighlightedVerse({ surah: r.surahNumber, ayah: r.verseNumber });
      }
      search.close();
    },
    [update, search]
  );

  const isDark =
    prefs.theme === 'dark' ||
    (prefs.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (!loaded) {
    return (
      <div className="app-loading">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  const showTextMode = prefs.viewMode !== 'image';
  const activeSurahInfo = player.activeVerse
    ? getSurahByNumber(player.activeVerse.surah)
    : null;
  const reciter = getReciter(prefs.reciterId);
  const riwaya = getRiwaya(prefs.riwaya);

  return (
    <div
      className={`app-shell ${fullscreen.active ? 'fullscreen' : ''} ${
        fullscreen.idle ? 'idle' : ''
      } ${player.activeVerse ? 'has-session' : ''}`}
      ref={swipeRef}
    >
      <header className="app-header">
        <div className="app-header-title">
          <img
            src="./icon.png"
            alt="GT-QuranReader — عارض و قارئ الذكر الحكيم"
            className="app-icon"
            width="140"
            height="140"
          />
          {!isOnline && <span className="offline-badge">offline</span>}
        </div>
        <div className="app-header-controls">
          <ViewModeToggle mode={prefs.viewMode} onChange={(m) => update('viewMode', m)} />
          <ThemeToggle theme={prefs.theme} onChange={(t) => update('theme', t)} />
          <button
            type="button"
            className="settings-btn"
            onClick={fullscreen.toggle}
            aria-label={fullscreen.active ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}
            title={fullscreen.active ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}
          >
            ⛶
          </button>
          <button
            type="button"
            className="settings-btn"
            onClick={() => setOpenModal('settings')}
            aria-label="الإعدادات"
            title="الإعدادات"
          >
            ⚙️
          </button>
        </div>
      </header>

      <nav className="quick-nav" aria-label="تنقل سريع">
        <button onClick={() => setOpenModal('surah')}>📚 السور</button>
        <button onClick={() => setOpenModal('juz')}>📑 الأجزاء</button>
        <button onClick={() => setOpenModal('sajda')}>🕋 السجدات</button>
        <button onClick={() => setOpenModal('riwaya')}>📜 الرواية: {riwaya?.name.ar}</button>
        <button onClick={() => setOpenModal('reciter')}>🎤 القارئ: {reciter?.name.ar}</button>
      </nav>

      {/* شريط واحد متراص: معلومات + بحث + (تكبير + توغل التظليل في وضع النص فقط) */}
      <div className={`toolbar ${showTextMode ? 'toolbar-with-controls' : 'toolbar-compact'}`}>
        <PageInfo page={prefs.currentPage} />
        <SearchBar
          onSearch={search.search}
          onClear={search.clear}
          disabled={quran.loading && !quran.data}
        />
        {showTextMode && (
          <div className="toolbar-controls">
            <ZoomControls
              value={prefs.fontSize}
              onChange={(v) => update('fontSize', v)}
            />
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={prefs.enableVerseHighlight}
                onChange={(e) => update('enableVerseHighlight', e.target.checked)}
              />
              <span>تظليل تلقائي</span>
            </label>
          </div>
        )}
      </div>

      {player.activeVerse && activeSurahInfo && (
        <div className="active-verse-banner" role="status">
          <span>
            🎧 يقرأ الآن: سورة {activeSurahInfo.name.ar} — آية{' '}
            {player.activeVerse.ayah}
            <span className="active-verse-progress">
              {' '}/ {activeSurahInfo.versesCount}
            </span>
          </span>
          <button type="button" onClick={handleFullStop}>إيقاف</button>
        </div>
      )}

      {player.error && (
        <div className="error-banner" role="alert">⚠️ {player.error.message}</div>
      )}

      <main className="app-main">
        {prefs.viewMode === 'image' && <ImagePage page={prefs.currentPage} darkMode={isDark} />}
        {showTextMode && (
          <TextPage
            data={quran.data}
            loading={quran.loading}
            error={quran.error}
            page={prefs.currentPage}
            fontSize={prefs.fontSize}
            fontFamily={prefs.fontId}
            highlightedVerse={highlightedVerse}
            activeVerse={prefs.enableVerseHighlight ? player.activeVerse : null}
            onVerseSingleClick={handleVerseSingleClick}
            onVerseDoubleClick={handleVerseDoubleClick}
          />
        )}
      </main>

      <PageNav page={prefs.currentPage} onChange={onPageChange} />

      <FloatingControls
        onPrev={goPrev}
        onNext={goNext}
        onPlay={handlePlayPause}
        onStop={handleFullStop}
        onSearch={() => document.querySelector<HTMLInputElement>('.search-input')?.focus()}
        onMenu={() => setOpenModal('surah')}
        onToggleFullscreen={fullscreen.toggle}
        onZoomIn={() => update('fontSize', Math.min(200, prefs.fontSize + 10))}
        onZoomOut={() => update('fontSize', Math.max(80, prefs.fontSize - 10))}
        isPlaying={player.isPlaying}
        hasActiveSession={Boolean(player.activeVerse)}
        isFullscreen={fullscreen.active}
        canPlay={Boolean(quran.data)}
        canZoom={prefs.viewMode !== 'image'}
      />

      <footer className="app-footer">
        <p>
          تم التطوير بواسطة{' '}
          <a href="https://github.com/SalehGNUTUX" target="_blank" rel="noopener">GNUTUX</a>
        </p>
      </footer>

      {search.open && (
        <SearchResults
          results={search.results}
          query={search.query}
          onSelect={handleSearchSelect}
          onClose={search.close}
        />
      )}

      {openModal === 'surah' && (
        <SurahListModal onClose={() => setOpenModal(null)} onSelect={onPageChange} />
      )}
      {openModal === 'juz' && (
        <JuzListModal onClose={() => setOpenModal(null)} onSelect={onPageChange} />
      )}
      {openModal === 'sajda' && (
        <SajdaListModal onClose={() => setOpenModal(null)} onSelect={onPageChange} />
      )}
      {openModal === 'reciter' && (
        <ReciterModal
          selectedId={prefs.reciterId}
          onClose={() => setOpenModal(null)}
          onSelect={(id) => update('reciterId', id)}
        />
      )}
      {openModal === 'riwaya' && (
        <RiwayaModal
          selectedId={prefs.riwaya}
          onClose={() => setOpenModal(null)}
          onSelect={handleRiwayaChange}
        />
      )}
      {openModal === 'settings' && (
        <SettingsModal
          prefs={prefs}
          update={update}
          onClose={() => setOpenModal(null)}
          DownloadManager={DownloadManager}
          onResetPreferences={() => {
            void reset().then(() => setOpenModal(null));
          }}
        />
      )}

      {resumeAsk && (
        <ConfirmDialog
          icon="🎧"
          title="متابعة القراءة؟"
          message={`توقفت سابقاً عند:\nسورة ${getSurahByNumber(resumeAsk.surah)?.name.ar ?? ''} — آية ${resumeAsk.ayah}\n\nهل تريد المتابعة من هنا، أم بدء السورة من أوّلها؟`}
          confirmLabel="متابعة من حيث توقفت"
          cancelLabel="بدء السورة من أوّلها"
          onConfirm={handleResumeConfirm}
          onCancel={handleResumeCancel}
        />
      )}
    </div>
  );
}
