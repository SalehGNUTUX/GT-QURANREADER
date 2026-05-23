import { RIWAYAT } from '@gt-quranreader/core';
import type { RiwayaId } from '@gt-quranreader/core';
import { Modal } from './Modal';

interface Props {
  selectedId: RiwayaId;
  onClose: () => void;
  onSelect: (riwayaId: RiwayaId) => void;
}

export function RiwayaModal({ selectedId, onClose, onSelect }: Props) {
  return (
    <Modal title="اختر الرواية" onClose={onClose}>
      <ul className="reciter-list">
        {RIWAYAT.map((r) => (
          <li
            key={r.id}
            className={`reciter-item ${r.id === selectedId ? 'selected' : ''}`}
            onClick={() => {
              onSelect(r.id);
              onClose();
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSelect(r.id);
                onClose();
              }
            }}
          >
            <span className="reciter-name">{r.fullName.ar}</span>
            <span className="reciter-style">{r.name.en}</span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
