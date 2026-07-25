'use client';

import React from 'react';
import { useApp } from '../context/AppContext';

const LANGS = [
  { code: 'uz', label: 'UZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useApp();

  return (
    <div className="flex items-center gap-1">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-2 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all ${
            lang === l.code
              ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
