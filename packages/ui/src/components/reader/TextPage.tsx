import { useMemo } from 'react';
import type { QuranData, Verse } from '@gt-quranreader/core';
import { VerseElement } from './VerseElement';

interface Props {
  data: QuranData | null;
  loading: boolean;
  error: Error | null;
  page: number;
  fontSize: number;
  fontFamily: string;
  highlightedVerse: { surah: number; ayah: number } | null;
  activeVerse: { surah: number; ayah: number } | null;
  /** الآية المحفوظة كموضع قراءة يدوي (يُعرَض عليها 🔖 ولها تظليل خفيف). */
  readingBookmark?: { surah: number; ayah: number } | null;
  onVerseSingleClick: (surah: number, ayah: number) => void;
  onVerseDoubleClick: (surah: number, ayah: number) => void;
}

interface SurahSegment {
  surahNumber: number;
  surahNameAr: string;
  revelation: 'مكية' | 'مدنية';
  versesCount: number;
  verses: Verse[];
}

function groupVersesByPage(data: QuranData, page: number): SurahSegment[] {
  const segments: SurahSegment[] = [];
  for (const surah of data.surahs) {
    const versesOnPage = surah.verses.filter((v) => v.page === page);
    if (versesOnPage.length === 0) continue;
    segments.push({
      surahNumber: surah.number,
      surahNameAr: surah.name.ar,
      revelation: surah.revelationPlace,
      versesCount: surah.versesCount,
      verses: versesOnPage,
    });
  }
  return segments;
}

export function TextPage({
  data,
  loading,
  error,
  page,
  fontSize,
  fontFamily,
  highlightedVerse,
  activeVerse,
  readingBookmark,
  onVerseSingleClick,
  onVerseDoubleClick,
}: Props) {
  const segments = useMemo(() => (data ? groupVersesByPage(data, page) : []), [data, page]);

  if (loading) {
    return (
      <div className="text-page-loading">
        <p>جاري تحميل النص القرآني...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-page-error">
        <p>تعذر تحميل النص: {error.message}</p>
      </div>
    );
  }

  if (!data || segments.length === 0) {
    return (
      <div className="text-page-empty">
        <p>لا يوجد نص لعرضه في هذه الصفحة.</p>
      </div>
    );
  }

  const baseSize = 22;
  const computedSize = Math.round((baseSize * fontSize) / 100);

  return (
    <div
      className="text-page"
      style={{ fontFamily, fontSize: `${computedSize}px`, lineHeight: 2.8 }}
    >
      {segments.map((segment) => (
        <section key={segment.surahNumber} className="surah-segment">
          <header className="surah-header">
            <h2 className="surah-title">سُورَةُ {segment.surahNameAr}</h2>
            <p className="surah-meta">
              {segment.revelation} • {segment.versesCount} آية
            </p>
            {segment.surahNumber !== 9 && segment.verses[0]?.number === 1 && (
              <p className="basmala">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
            )}
          </header>
          <div className="surah-verses">
            {segment.verses.map((v) => (
              <VerseElement
                key={`${segment.surahNumber}:${v.number}`}
                verse={v}
                surahNumber={segment.surahNumber}
                isHighlighted={
                  highlightedVerse?.surah === segment.surahNumber &&
                  highlightedVerse?.ayah === v.number
                }
                isActive={
                  activeVerse?.surah === segment.surahNumber && activeVerse?.ayah === v.number
                }
                isReadingBookmark={
                  readingBookmark?.surah === segment.surahNumber &&
                  readingBookmark?.ayah === v.number
                }
                onSingleClick={() => onVerseSingleClick(segment.surahNumber, v.number)}
                onDoubleClick={() => onVerseDoubleClick(segment.surahNumber, v.number)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
