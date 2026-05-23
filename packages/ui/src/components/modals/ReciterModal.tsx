import { RECITERS, RIWAYAT, getRiwaya } from '@gt-quranreader/core';
import { Modal } from './Modal';

interface Props {
  selectedId: string;
  onClose: () => void;
  onSelect: (reciterId: string) => void;
}

export function ReciterModal({ selectedId, onClose, onSelect }: Props) {
  // مجموعة بالرواية، مع الترتيب يتبع RIWAYAT (ورش أولاً، ثم حفص ...).
  const grouped = RECITERS.reduce<Record<string, typeof RECITERS>>((acc, r) => {
    (acc[r.riwaya] ||= []).push(r);
    return acc;
  }, {});

  const orderedGroups = RIWAYAT
    .map((riw) => [riw.id, grouped[riw.id]] as const)
    .filter(([, list]) => list && list.length > 0);

  return (
    <Modal title="اختر القارئ" onClose={onClose}>
      {orderedGroups.map(([riwayaId, list]) => {
        const riwaya = getRiwaya(riwayaId);
        return (
          <div key={riwayaId} className="reciter-group">
            <h4 className="reciter-group-title">
              برواية {riwaya?.fullName.ar ?? riwayaId}
            </h4>
            <ul className="reciter-list">
              {list.map((r) => (
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
                  <span className="reciter-name">{r.name.ar}</span>
                  <span className="reciter-style">{r.style}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </Modal>
  );
}
