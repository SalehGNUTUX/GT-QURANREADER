import { useEffect, useState } from 'react';
import { ALTERNATIVE_IMAGE_SOURCES, getQuranPngUrl } from '@gt-quranreader/core';

interface Props {
  page: number;
  darkMode: boolean;
  /** اختياري: يبحث عن نسخة محلية للصفحة (مفيد في Electron). */
  resolveLocalPath?: (page: number) => Promise<string | null>;
}

export function ImagePage({ page, darkMode, resolveLocalPath }: Props) {
  const [src, setSrc] = useState<string>('');
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
    let cancelled = false;

    (async () => {
      if (resolveLocalPath) {
        const local = await resolveLocalPath(page);
        if (local && !cancelled) {
          setSrc(local);
          return;
        }
      }
      if (!cancelled) setSrc(getQuranPngUrl(page));
    })();

    return () => {
      cancelled = true;
    };
  }, [page, resolveLocalPath]);

  const handleError = () => {
    const sources = ALTERNATIVE_IMAGE_SOURCES(page);
    const currentIdx = sources.indexOf(src);
    if (currentIdx === -1) {
      setSrc(sources[0]);
    } else if (currentIdx < sources.length - 1) {
      setSrc(sources[currentIdx + 1]);
    } else {
      setErrored(true);
    }
  };

  if (errored) {
    return (
      <div className="image-page-error">
        <p>تعذر تحميل صورة الصفحة {page}.</p>
        <p>تحقق من الاتصال بالإنترنت أو نزّل صور المصحف من الإعدادات.</p>
      </div>
    );
  }

  return (
    <div className="image-page">
      <img
        src={src}
        alt={`صفحة المصحف ${page}`}
        onError={handleError}
        style={{ filter: darkMode ? 'invert(1) hue-rotate(180deg)' : 'none' }}
      />
    </div>
  );
}
