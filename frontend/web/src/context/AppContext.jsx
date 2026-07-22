import React, { createContext, useContext, useState } from 'react';
import { getSavedLang, saveLang } from '../services/i18n';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(getSavedLang);

  const setLang = (newLang) => {
    setLangState(newLang);
    saveLang(newLang);
  };

  return (
    <AppContext.Provider value={{ lang, setLang }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
