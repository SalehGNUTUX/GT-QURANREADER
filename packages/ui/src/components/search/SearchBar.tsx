import { useState } from 'react';

interface Props {
  onSearch: (query: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function SearchBar({ onSearch, onClear, disabled }: Props) {
  const [value, setValue] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  };

  const clear = () => {
    setValue('');
    onClear();
  };

  return (
    <form className="search-bar" onSubmit={submit} role="search">
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ابحث في القرآن: كلمة، سورة، الكرسي، 2:255، ص 100..."
        aria-label="بحث في القرآن"
        disabled={disabled}
        className="search-input"
      />
      {value && (
        <button type="button" className="search-clear" onClick={clear} aria-label="مسح البحث">
          ×
        </button>
      )}
      <button type="submit" className="search-submit" disabled={disabled}>
        🔍 بحث
      </button>
    </form>
  );
}
