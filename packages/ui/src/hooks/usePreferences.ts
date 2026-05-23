import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PREFERENCES, LocalStoragePreferences } from '@gt-quranreader/core';
import type { UserPreferences } from '@gt-quranreader/core';

const storage = new LocalStoragePreferences();

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    storage.load().then((p) => {
      setPrefs(p);
      setLoaded(true);
    });
  }, []);

  const update = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      void storage.save(next);
      return next;
    });
  }, []);

  const updateMany = useCallback((patch: Partial<UserPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      void storage.save(next);
      return next;
    });
  }, []);

  // إعادة جميع التفضيلات إلى القيم الافتراضية (يمسح الكاش المحلي).
  const reset = useCallback(async () => {
    const fresh = await storage.reset();
    setPrefs(fresh);
    return fresh;
  }, []);

  return { prefs, update, updateMany, reset, loaded };
}
