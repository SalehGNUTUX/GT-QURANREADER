import { useState, type ComponentType } from 'react';
import type { UserPreferences } from '@gt-quranreader/core';
import { Modal } from '../modals/Modal';
import { ConfirmDialog } from '../modals/ConfirmDialog';
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
  const [confirmReset, setConfirmReset] = useState(false);

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
          <button type="button" onClick={() => setConfirmReset(true)} className="reset-prefs-btn">
            ♻️ إعادة الإعدادات الافتراضية
          </button>
        </section>

        <section className="settings-section about-section">
          <h4>ℹ️ حول البرنامج</h4>
          <div className="about-content">
            <p className="about-name">📖 GT-QuranReader</p>
            <p className="about-tagline">مستعرض و قارئ الذكر الحكيم</p>
            <p className="about-version">الإصدار 4.0.0 (stable)</p>
            <p className="about-desc">
              تطبيق حر مفتوح المصدر لقراءة القرآن الكريم بأربع روايات وأكثر من 13 قارئاً،
              مع تظليل آية متزامن وبحث ذكي. يعمل على Linux وأندرويد والمتصفح من قاعدة كود واحدة.
            </p>
            <div className="about-meta">
              <p>
                <strong>المطور:</strong>{' '}
                <a href="https://github.com/SalehGNUTUX" target="_blank" rel="noopener">SalehGNUTUX</a>
              </p>
              <p>
                <strong>الترخيص:</strong> GPL-3.0 (سطح المكتب) · AGPL-3.0 (الويب)
              </p>
              <p>
                <strong>مصادر البيانات:</strong>
                <a href="https://alquran.cloud/api" target="_blank" rel="noopener">api.alquran.cloud</a> ·{' '}
                <a href="https://everyayah.com/" target="_blank" rel="noopener">everyayah.com</a>
              </p>
            </div>
            <div className="about-links">
              <a href="https://github.com/SalehGNUTUX/GT-QURANREADER" target="_blank" rel="noopener" className="about-link">
                🐙 المستودع
              </a>
              <a href="https://github.com/SalehGNUTUX/GT-QURANREADER/releases" target="_blank" rel="noopener" className="about-link">
                📦 الإصدارات
              </a>
              <a href="https://github.com/SalehGNUTUX/GT-QURANREADER/issues" target="_blank" rel="noopener" className="about-link">
                🐛 الإبلاغ عن مشكلة
              </a>
              <a href="https://github.com/SalehGNUTUX/GT-QURANREADER/blob/main/CHANGELOG.md" target="_blank" rel="noopener" className="about-link">
                📝 سجل التغييرات
              </a>
            </div>
            <p className="about-dua">🤲 اللهم اجعل هذا العمل صدقة جارية</p>
          </div>
        </section>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="إعادة الإعدادات الافتراضية"
          message={'سيتم إرجاع كل الإعدادات (الرواية، القارئ، الخط، السمة، حجم الخط) إلى القيم الافتراضية.\n\nملاحظة: علاماتك المحفوظة (الإشارات) لن تُحذف.'}
          confirmLabel="إعادة الضبط"
          cancelLabel="إلغاء"
          icon="♻️"
          variant="danger"
          onConfirm={() => {
            setConfirmReset(false);
            onResetPreferences();
          }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </Modal>
  );
}
