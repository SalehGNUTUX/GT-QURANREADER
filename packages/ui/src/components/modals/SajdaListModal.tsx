import { SAJDA_VERSES } from '@gt-quranreader/core';
import { getSurahByNumber } from '@gt-quranreader/core';
import { Modal } from './Modal';

interface Props {
  onClose: () => void;
  onSelect: (page: number) => void;
}

export function SajdaListModal({ onClose, onSelect }: Props) {
  return (
    <Modal title="مواضع السجود" onClose={onClose}>
      <ul className="surah-list">
        {SAJDA_VERSES.map((s, i) => {
          const surah = getSurahByNumber(s.surah);
          return (
            <li
              key={i}
              className="surah-item"
              onClick={() => {
                onSelect(s.page);
                onClose();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSelect(s.page);
                  onClose();
                }
              }}
            >
              <span className="surah-num">{s.surah}</span>
              <span className="surah-name-ar">سورة {surah?.name.ar}</span>
              <span className="surah-meta-row">
                آية {s.ayah} • {s.type} • ص {s.page}
              </span>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
