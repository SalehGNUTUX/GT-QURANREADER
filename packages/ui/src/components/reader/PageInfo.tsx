import { getSurahByPage, getJuzByPage } from '@gt-quranreader/core';

interface Props {
  page: number;
}

// نسخة طويلة على الشاشة الواسعة، نسخة مضغوطة على الهاتف عبر CSS.
export function PageInfo({ page }: Props) {
  const surah = getSurahByPage(page);
  const juz = getJuzByPage(page);
  return (
    <div className="page-info">
      <span className="page-info-item">
        <strong className="page-info-label">السورة:</strong>
        <strong className="page-info-label-short">س:</strong> {surah.name.ar}
      </span>
      <span className="page-info-sep" aria-hidden="true">•</span>
      <span className="page-info-item">
        <strong className="page-info-label">الجزء:</strong>
        <strong className="page-info-label-short">ج:</strong> {juz.number}
      </span>
      <span className="page-info-sep" aria-hidden="true">•</span>
      <span className="page-info-item">
        <strong className="page-info-label">الصفحة:</strong>
        <strong className="page-info-label-short">ص:</strong> {page}
      </span>
    </div>
  );
}
