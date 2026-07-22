import { useCallback, useEffect, useState } from 'react';

export function useEngine() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.__yhqEngine) {
      setReady(true);
      return;
    }
    const check = setInterval(() => {
      if (window.__yhqEngine) {
        setReady(true);
        clearInterval(check);
      }
    }, 100);
    setTimeout(() => {
      clearInterval(check);
      if (!window.__yhqEngine) setError('Engine failed to load');
    }, 10000);
    return () => clearInterval(check);
  }, []);

  const sceneInfo = useCallback((scenarioJson) => {
    if (!window.__yhqEngine) throw new Error('Engine not ready');
    return JSON.parse(window.__yhqEngine.sceneInfo(scenarioJson));
  }, []);

  const buildFrame = useCallback((scenarioJson, t) => {
    if (!window.__yhqEngine) throw new Error('Engine not ready');
    return JSON.parse(window.__yhqEngine.buildFrame(scenarioJson, t));
  }, []);

  const optionFrame = useCallback((scenarioJson, optionId, t) => {
    if (!window.__yhqEngine) throw new Error('Engine not ready');
    return JSON.parse(window.__yhqEngine.optionFrame(scenarioJson, optionId, t));
  }, []);

  const version = window.__yhqEngine?.version || null;

  return { ready, error, sceneInfo, buildFrame, optionFrame, version };
}
