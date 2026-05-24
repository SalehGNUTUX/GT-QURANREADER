// نقطة تصدير موحدة لـ packages/ui.
// كل التطبيقات تستورد من '@gt-quranreader/ui' مباشرة.

// المكونات
export { ImagePage } from './components/reader/ImagePage';
export { TextPage } from './components/reader/TextPage';
export { VerseElement } from './components/reader/VerseElement';
export { PageNav } from './components/reader/PageNav';
export { PageInfo } from './components/reader/PageInfo';

export { ZoomControls } from './components/controls/ZoomControls';
export { ThemeToggle } from './components/controls/ThemeToggle';
export { ViewModeToggle } from './components/controls/ViewModeToggle';
export { FloatingControls } from './components/controls/FloatingControls';
export { SwipeHint } from './components/controls/SwipeHint';

export { SearchBar } from './components/search/SearchBar';
export { SearchResults } from './components/search/SearchResults';

export { Modal } from './components/modals/Modal';
export { ConfirmDialog } from './components/modals/ConfirmDialog';
export { SurahListModal } from './components/modals/SurahListModal';
export { JuzListModal } from './components/modals/JuzListModal';
export { SajdaListModal } from './components/modals/SajdaListModal';
export { ReciterModal } from './components/modals/ReciterModal';
export { RiwayaModal } from './components/modals/RiwayaModal';
export { ToolsMenuModal } from './components/modals/ToolsMenuModal';
export type { BookmarkAction } from './components/modals/ToolsMenuModal';
export { FontPickerModal } from './components/modals/FontPickerModal';
export { GestureDebugOverlay } from './components/dev/GestureDebugOverlay';

export { SettingsModal } from './components/settings/SettingsModal';

// Hooks مستقلة عن البيئة
export { usePreferences } from './hooks/usePreferences';
export { useSearch } from './hooks/useSearch';
export { useSwipe } from './hooks/useSwipe';
export { usePinchZoom } from './hooks/usePinchZoom';
export { useFullscreen } from './hooks/useFullscreen';

// خطوط
export { AVAILABLE_FONTS, getFont } from './fonts/font-catalog';
