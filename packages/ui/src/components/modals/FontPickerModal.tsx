import { AVAILABLE_FONTS } from '../../fonts/font-catalog';
import { Modal } from './Modal';

interface Props {
  selectedId: string;
  onClose: () => void;
  onSelect: (fontId: string) => void;
}

const PREVIEW_VERSE = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

// modal سريع لاختيار الخط القرآني — اختصار للوصول دون فتح كامل الإعدادات.
export function FontPickerModal({ selectedId, onClose, onSelect }: Props) {
  return (
    <Modal title="اختيار الخط القرآني" onClose={onClose}>
      <div className="font-grid">
        {AVAILABLE_FONTS.map((font) => (
          <button
            key={font.id}
            type="button"
            className={`font-pick ${selectedId === font.id ? 'font-pick-active' : ''}`}
            onClick={() => {
              onSelect(font.id);
              onClose();
            }}
          >
            <div className="font-pick-name">{font.name}</div>
            <div
              className="font-pick-preview"
              style={{ fontFamily: font.family, fontSize: '1.4rem' }}
            >
              {PREVIEW_VERSE}
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
