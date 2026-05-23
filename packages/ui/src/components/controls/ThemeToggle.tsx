import type { UserPreferences } from '@gt-quranreader/core';

interface Props {
  theme: UserPreferences['theme'];
  onChange: (theme: UserPreferences['theme']) => void;
}

const ORDER: UserPreferences['theme'][] = ['auto', 'dark', 'light', 'sepia', 'gold'];
const LABELS: Record<UserPreferences['theme'], { icon: string; title: string }> = {
  auto: { icon: '⚙️', title: 'تلقائي (يتبع النظام)' },
  dark: { icon: '🌙', title: 'الوضع الليلي' },
  light: { icon: '☀️', title: 'الوضع النهاري' },
  sepia: { icon: '📜', title: 'سيبيا' },
  gold: { icon: '✨', title: 'ذهبي فاخر' },
};

export function ThemeToggle({ theme, onChange }: Props) {
  const cycle = () => {
    const idx = ORDER.indexOf(theme);
    const next = ORDER[(idx + 1) % ORDER.length];
    onChange(next);
  };
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={cycle}
      title={LABELS[theme].title}
      aria-label={`تغيير المظهر، الحالي: ${LABELS[theme].title}`}
    >
      <span className="theme-icon" aria-hidden="true">
        {LABELS[theme].icon}
      </span>
    </button>
  );
}
