import { TOTAL_PAGES } from '@gt-quranreader/core';

interface Props {
  page: number;
  onChange: (page: number) => void;
}

export function PageNav({ page, onChange }: Props) {
  return (
    <nav className="page-nav" aria-label="التنقل بين الصفحات">
      <button
        type="button"
        className="page-nav-btn"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="الصفحة السابقة"
      >
        ‹ السابقة
      </button>
      <div className="page-nav-info">
        <input
          type="number"
          min={1}
          max={TOTAL_PAGES}
          value={page}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!Number.isNaN(v) && v >= 1 && v <= TOTAL_PAGES) onChange(v);
          }}
          aria-label="رقم الصفحة"
        />
        <span> / {TOTAL_PAGES}</span>
      </div>
      <button
        type="button"
        className="page-nav-btn"
        onClick={() => onChange(page + 1)}
        disabled={page >= TOTAL_PAGES}
        aria-label="الصفحة التالية"
      >
        التالية ›
      </button>
    </nav>
  );
}
