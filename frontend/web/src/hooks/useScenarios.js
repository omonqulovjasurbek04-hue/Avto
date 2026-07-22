import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export function useScenarios() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.scenarios.list()
      .then(setList)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const getById = useCallback(async (id) => {
    return api.scenarios.get(id);
  }, []);

  return { list, loading, error, getById };
}
