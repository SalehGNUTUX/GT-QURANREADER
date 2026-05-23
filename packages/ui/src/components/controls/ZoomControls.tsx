interface Props {
  value: number; // 80-200
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function ZoomControls({ value, onChange, disabled }: Props) {
  const dec = () => onChange(Math.max(80, value - 10));
  const inc = () => onChange(Math.min(200, value + 10));
  const reset = () => onChange(100);

  return (
    <div className="zoom-controls" role="group" aria-label="حجم الخط">
      <button
        type="button"
        onClick={dec}
        disabled={disabled || value <= 80}
        aria-label="تصغير"
        title="تصغير"
      >
        −
      </button>
      <span className="zoom-value" aria-live="polite">
        {value}%
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={disabled || value >= 200}
        aria-label="تكبير"
        title="تكبير"
      >
        +
      </button>
      <button
        type="button"
        onClick={reset}
        disabled={disabled || value === 100}
        aria-label="إعادة"
        title="إعادة التعيين"
        className="zoom-reset"
      >
        ↺
      </button>
    </div>
  );
}
