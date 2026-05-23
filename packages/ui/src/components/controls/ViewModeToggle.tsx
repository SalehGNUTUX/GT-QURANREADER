import type { ViewMode } from '@gt-quranreader/core';

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

// وضعان فقط: صورة وفسيفساء النص.
// تظليل الآية المقروءة يتحكم به toggle منفصل (enableVerseHighlight) في الإعدادات.
const MODES: { id: ViewMode; icon: string; label: string }[] = [
  { id: 'image', icon: '🖼️', label: 'صورة المصحف' },
  { id: 'text', icon: '📄', label: 'نص المصحف' },
];

export function ViewModeToggle({ mode, onChange }: Props) {
  return (
    <div className="view-mode-toggle" role="radiogroup" aria-label="طريقة العرض">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          role="radio"
          aria-checked={mode === m.id}
          className={`view-mode-btn ${mode === m.id ? 'active' : ''}`}
          onClick={() => onChange(m.id)}
          title={m.label}
        >
          <span aria-hidden="true">{m.icon}</span>
          <span className="view-mode-label">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
