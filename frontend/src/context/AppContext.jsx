'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const LANG_KEY = 'yhq_lang';
const DEFAULT_LANG = 'uz';

const AppContext = createContext({ lang: DEFAULT_LANG, setLang: () => {}, ready: false });

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved) setLangState(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
  }, []);

  return <AppContext.Provider value={{ lang, setLang, ready }}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
