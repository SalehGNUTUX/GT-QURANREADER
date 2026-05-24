import { useRef, useEffect } from 'react';
import type { Verse } from '@gt-quranreader/core';

interface Props {
  verse: Verse;
  surahNumber: number;
  isHighlighted: boolean;
  isActive: boolean; // الآية المُشغَّل صوتها حالياً
  /** الآية المحفوظة كموضع قراءة يدوي — تأخذ علامة بصرية دائمة. */
  isReadingBookmark?: boolean;
  onSingleClick: () => void;
  onDoubleClick: () => void;
}

const DOUBLE_CLICK_DELAY = 280; // ms

export function VerseElement({ verse, surahNumber, isHighlighted, isActive, isReadingBookmark = false, onSingleClick, onDoubleClick }: Props) {
  const clickTimer = useRef<number | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      // 'auto' لإلغاء تأخر smooth scroll (300ms) — التظليل يلحق بالصوت فوراً.
      ref.current.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [isActive]);

  const handleClick = () => {
    if (clickTimer.current !== null) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onDoubleClick();
      return;
    }
    clickTimer.current = window.setTimeout(() => {
      clickTimer.current = null;
      onSingleClick();
    }, DOUBLE_CLICK_DELAY);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onDoubleClick();
    } else if (e.key === ' ') {
      e.preventDefault();
      onSingleClick();
    }
  };

  const classes = ['verse'];
  if (isHighlighted) classes.push('verse-highlighted');
  if (isActive) classes.push('verse-active');
  if (isReadingBookmark) classes.push('verse-reading-bookmark');

  return (
    <span
      ref={ref}
      role="button"
      tabIndex={0}
      className={classes.join(' ')}
      onClick={handleClick}
      onKeyDown={handleKey}
      data-surah={surahNumber}
      data-ayah={verse.number}
      aria-label={`الآية ${verse.number}${isReadingBookmark ? ' — موضع قراءة محفوظ' : ''}`}
    >
      {isReadingBookmark && (
        <span className="verse-bookmark-marker" aria-hidden="true" title="موضع قراءة محفوظ">🔖</span>
      )}
      <span className="verse-text">{verse.text}</span>
      <span className="verse-number" aria-hidden="true">
        ﴿{verse.number}﴾
      </span>
    </span>
  );
}
