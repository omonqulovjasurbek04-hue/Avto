'use client';

import { useEffect, useState } from 'react';

export function useEngine() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.__yhqEngine) {
      setReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = '/engine.js';
    script.async = true;

    script.onload = () => {
      if (window.__yhqEngine) {
        setReady(true);
      } else {
        setError('Engine bundle loaded but __yhqEngine global not found');
      }
    };

    script.onerror = () => {
      setError('Failed to load /engine.js bundle from server');
    };

    document.body.appendChild(script);

    return () => {
      // script cleanup if unmounted before load
    };
  }, []);

  return { ready, error, engine: typeof window !== 'undefined' ? window.__yhqEngine : null };
}
