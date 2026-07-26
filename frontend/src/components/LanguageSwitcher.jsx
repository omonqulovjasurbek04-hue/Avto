'use client';

import React from 'react';
import { useApp } from '../context/AppContext';

const LANGS = [
  { code: 'uz', label: 'UZ', flag: '🇺🇿' },
  { code: 'ru', label: 'RU', flag: '🇷🇺' },
  { code: 'en', label: 'EN', flag: '🇺🇸' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useApp();

  return (
    <div className="flex items-center bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`group relative px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
            lang === l.code
              ? 'bg-brand-blue/30 text-brand-blue border border-brand-blue/50 shadow-glow-blue'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm group-hover:scale-110 transition-transform duration-200">
              {l.flag}
            </span>
            <span>{l.label}</span>
          </div>
          
          {/* Active indicator */}
          {lang === l.code && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-brand-blue rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
