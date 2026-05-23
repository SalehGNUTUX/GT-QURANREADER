import { useCallback, useState } from 'react';
import { searchQuran } from '@gt-quranreader/core';
import type { QuranData, SearchResult } from '@gt-quranreader/core';

export function useSearch(data: QuranData | null) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);

  const search = useCallback(
    (q: string) => {
      setQuery(q);
      const found = searchQuran(q, data);
      setResults(found);
      setOpen(true);
    },
    [data]
  );

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setOpen(false);
  }, []);

  return { query, results, open, search, clear, close: () => setOpen(false) };
}
