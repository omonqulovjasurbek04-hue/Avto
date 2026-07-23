import { useCallback, useEffect, useState } from 'react';

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL || '/engine.js';

export function useEngine() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.__yhqEngine) {
      setReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = ENGINE_URL;
    script.async = true;

    script.onload = () => {
      if (window.__yhqEngine) {
        setReady(true);
      } else {
        setError('Engine loaded but __yhqEngine is undefined');
      }
    };

    script.onerror = () => {
      // Try fallback to local /engine.js if VITE_ENGINE_URL fails
      if (ENGINE_URL !== '/engine.js') {
        const fallbackScript = document.createElement('script');
        fallbackScript.src = '/engine.js';
        fallbackScript.onload = () => {
          if (window.__yhqEngine) setReady(true);
          else setError('Engine fallback failed');
        };
        fallbackScript.onerror = () => setError('Engine script failed to load');
        document.body.appendChild(fallbackScript);
      } else {
        setError('Engine script failed to load');
      }
    };

    document.body.appendChild(script);

    return () => {
      // Keep script in document so subsequent mounts don't re-download
    };
  }, []);

  const sceneInfo = useCallback((scenarioJson) => {
    if (!window.__yhqEngine) throw new Error('Engine not ready');
    return typeof window.__yhqEngine.sceneInfo === 'function'
      ? JSON.parse(window.__yhqEngine.sceneInfo(scenarioJson))
      : window.__yhqEngine.sceneInfo(scenarioJson);
  }, []);

  const buildFrame = useCallback((scenarioJson, t) => {
    if (!window.__yhqEngine) throw new Error('Engine not ready');
    const raw = window.__yhqEngine.buildFrame(scenarioJson, t);
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  }, []);

  const optionFrame = useCallback((scenarioJson, optionId, t) => {
    if (!window.__yhqEngine) throw new Error('Engine not ready');
    const raw = window.__yhqEngine.optionFrame(scenarioJson, optionId, t);
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  }, []);

  const version = window.__yhqEngine?.version || '0.1.0';

  return { ready, error, sceneInfo, buildFrame, optionFrame, version };
}
