import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

const USER_ID = 'user-web';

export function useProgress() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.progress.get(USER_ID);
      setProgress(data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const recordAnswer = useCallback(async (scenarioId, optionId) => {
    const result = await api.progress.answer(USER_ID, scenarioId, optionId);
    await refresh();
    return result;
  }, [refresh]);

  return { progress, loading, recordAnswer, refresh };
}
