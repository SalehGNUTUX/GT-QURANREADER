import { useEffect, useState } from 'react';
import { fetchQuranByRiwaya } from '@gt-quranreader/core';
import type { QuranData, RiwayaId } from '@gt-quranreader/core';
import { isElectron, gtQuran } from '../platform/runtime';

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
        if (isElectron && gtQuran) {
          const has = await gtQuran.data.hasRiwaya(riwaya);
          if (has) {
            const data = (await gtQuran.data.getRiwayaText(riwaya)) as QuranData;
            setState({ data, loading: false, error: null });
            return;
          }
        }
        const data = await fetchQuranByRiwaya(riwaya, controller.signal);
        setState({ data, loading: false, error: null });
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setState({ data: null, loading: false, error: err as Error });
      }
    })();

    return () => controller.abort();
  }, [riwaya]);

  return state;
}
