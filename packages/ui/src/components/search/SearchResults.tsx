import { highlightMatches } from '@gt-quranreader/core';
import type { SearchResult } from '@gt-quranreader/core';

interface Props {
  results: SearchResult[];
  query: string;
  onSelect: (result: SearchResult) => void;
  onClose: () => void;
}

const TYPE_LABEL: Record<SearchResult['type'], string> = {
  verse: 'آية',
  surah: 'سورة',
  juz: 'جزء',
  page: 'صفحة',
  sajda: 'سجدة',
};

export function SearchResults({ results, query, onSelect, onClose }: Props) {
  if (results.length === 0) {
    return (
      <div className="search-results-modal">
        <div className="search-results-card">
          <div className="search-results-header">
            <h3>نتائج البحث</h3>
            <button type="button" onClick={onClose} aria-label="إغلاق">×</button>
          </div>
          <p className="search-empty">لم يتم العثور على نتائج لـ "{query}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-modal" onClick={onClose} role="presentation">
      <div className="search-results-card" onClick={(e) => e.stopPropagation()}>
        <div className="search-results-header">
          <h3>
            نتائج البحث — {results.length} {results.length === 1 ? 'نتيجة' : 'نتيجة'}
          </h3>
          <button type="button" onClick={onClose} aria-label="إغلاق">
            ×
          </button>
        </div>
        <ul className="search-results-list">
          {results.slice(0, 200).map((r, i) => (
            <li
              key={`${r.type}-${i}-${r.page}`}
              className="search-result-item"
              onClick={() => onSelect(r)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSelect(r);
              }}
            >
              <div className="search-result-head">
                <span className="search-result-type">{TYPE_LABEL[r.type]}</span>
                {r.surahName && <strong>سورة {r.surahName}</strong>}
                {r.verseNumber && <span> — آية {r.verseNumber}</span>}
                {r.juzNumber && <span>الجزء {r.juzNumber}</span>}
                <span className="search-result-page">ص {r.page}</span>
              </div>
              {r.verseText && (
                <p
                  className="search-result-text"
                  // النص من بيانات API الموثوقة، النص المظلَّل مهرَّب.
                  dangerouslySetInnerHTML={{ __html: highlightMatches(r.verseText, query) }}
                />
              )}
            </li>
          ))}
        </ul>
        {results.length > 200 && (
          <p className="search-more">
            تم عرض أول 200 نتيجة من أصل {results.length}. حسّن البحث للتقليل.
          </p>
        )}
      </div>
    </div>
  );
}
