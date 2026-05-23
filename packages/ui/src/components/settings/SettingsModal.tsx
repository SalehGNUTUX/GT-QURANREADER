import type { ComponentType } from 'react';
import type { UserPreferences } from '@gt-quranreader/core';
import { Modal } from '../modals/Modal';
import { AVAILABLE_FONTS } from '../../fonts/font-catalog';

interface Props {
  prefs: UserPreferences;
  update: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  onClose: () => void;
  /** DownloadManager خاص بكل بيئة (Electron أو Web). يُحقَن من خارج النواة. */
  DownloadManager: ComponentType;
  /** يُعيد كل التفضيلات للقيم الافتراضية. */
  onResetPreferences: () => void;
}

export function SettingsModal({
  prefs,
  update,
  onClose,
  DownloadManager,
  onResetPreferences,
}: Props) {
  const handleReset = () => {
    if (confirm('سيتم إعادة كل الإعدادات (الرواية، القارئ، الخط، السمة...) إلى القيم الافتراضية. متابعة؟')) {
      onResetPreferences();
    }
  };

  return (
    <Modal title="الإعدادات" onClose={onClose}>
      <div className="settings">
        <section className="settings-section">
          <h4>🔤 الخط القرآني</h4>
          <div className="font-grid">
            {AVAILABLE_FONTS.map((font) => (
              <button
                key={font.id}
                className={`font-option ${prefs.fontId === font.id ? 'selected' : ''}`}
                onClick={() => update('fontId', font.id)}
                style={{ fontFamily: font.family }}
              >
                <span className="font-preview">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>
                <span className="font-name">{font.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h4>⚙️ خيارات القراءة</h4>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={prefs.autoPlayNext}
              onChange={(e) => update('autoPlayNext', e.target.checked)}
            />
            <span>تشغيل السورة التالية تلقائياً</span>
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={prefs.enableVerseHighlight}
              onChange={(e) => update('enableVerseHighlight', e.target.checked)}
            />
            <span>تظليل الآية المقروءة (نقرة واحدة = تظليل، نقرتان = قراءة)</span>
          </label>
        </section>

        <DownloadManager />

        <section className="settings-section">
          <h4>♻️ إعادة الضبط</h4>
          <p className="settings-info">
            إن لم تظهر مزايا جديدة بعد التحديث، استخدم هذا لإعادة كل الإعدادات للقيم الافتراضية.
            (لا يحذف البيانات المُنزَّلة offline.)
          </p>
          <button type="button" onClick={handleReset} className="reset-prefs-btn">
            ♻️ إعادة الإعدادات الافتراضية
          </button>
        </section>
      </div>
    </Modal>
  );
}
