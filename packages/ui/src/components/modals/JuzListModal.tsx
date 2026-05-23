import { JUZ_DATA } from '@gt-quranreader/core';
import { getSurahByNumber } from '@gt-quranreader/core';
import { Modal } from './Modal';

interface Props {
  onClose: () => void;
  onSelect: (page: number) => void;
}

export function JuzListModal({ onClose, onSelect }: Props) {
  return (
    <Modal title="الأجزاء" onClose={onClose}>
      <ul className="surah-list">
        {JUZ_DATA.map((j) => {
          const startSurah = getSurahByNumber(j.startSurah);
          return (
            <li
              key={j.number}
              className="surah-item"
              onClick={() => {
                onSelect(j.startPage);
                onClose();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSelect(j.startPage);
                  onClose();
                }
              }}
            >
              <span className="surah-num">{j.number}</span>
              <span className="surah-name-ar">الجزء {j.number}</span>
              <span className="surah-meta-row">
                يبدأ من سورة {startSurah?.name.ar} • آية {j.startVerse} • ص {j.startPage}
              </span>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
