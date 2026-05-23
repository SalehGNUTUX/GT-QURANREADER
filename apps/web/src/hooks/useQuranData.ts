import { useEffect, useState } from 'react';
import { fetchQuranByRiwaya } from '@gt-quranreader/core';
import type { QuranData, RiwayaId } from '@gt-quranreader/core';
import { idbGet, idbPut, STORE_RIWAYA_TEXTS } from '../storage/indexeddb';

interface State {
  data: QuranData | null;
  loading: boolean;
  error: Error | null;
}

export function useQuranData(riwaya: RiwayaId) {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    (async () => {
      try {
        // 1. الأولوية لـ IndexedDB إن كانت الرواية مُنزَّلة.
        const cached = await idbGet<QuranData>(STORE_RIWAYA_TEXTS, riwaya);
        if (cached) {
          setState({ data: cached, loading: false, error: null });
          return;
        }
        // 2. وإلا اجلب من API و service worker سيتولى الكاش.
        const data = await fetchQuranByRiwaya(riwaya, controller.signal);
        setState({ data, loading: false, error: null });
        // 3. خزّن في IndexedDB للوصول السريع لاحقاً.
        void idbPut(STORE_RIWAYA_TEXTS, riwaya, data);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setState({ data: null, loading: false, error: err as Error });
      }
    })();

    return () => controller.abort();
  }, [riwaya]);

  return state;
}
