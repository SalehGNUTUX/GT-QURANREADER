import { SURAHS } from '@gt-quranreader/core';
import { Modal } from './Modal';

interface Props {
  onClose: () => void;
  onSelect: (page: number) => void;
}

export function SurahListModal({ onClose, onSelect }: Props) {
  return (
    <Modal title="السور" onClose={onClose}>
      <ul className="surah-list">
        {SURAHS.map((s) => (
          <li
            key={s.number}
            className="surah-item"
            onClick={() => {
              onSelect(s.startPage);
              onClose();
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSelect(s.startPage);
                onClose();
              }
            }}
          >
            <span className="surah-num">{s.number}</span>
            <span className="surah-name-ar">{s.name.ar}</span>
            <span className="surah-meta-row">
              {s.revelationPlace} • {s.versesCount} آية • ص {s.startPage}
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
