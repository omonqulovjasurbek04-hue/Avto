import React, { createContext, useContext } from 'react';
import { useEngine } from '../hooks/useEngine';

const EngineContext = createContext(null);

export function EngineProvider({ children }) {
  const engine = useEngine();
  return <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>;
}

export function useEngineContext() {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error('useEngineContext must be used within EngineProvider');
  return ctx;
}
