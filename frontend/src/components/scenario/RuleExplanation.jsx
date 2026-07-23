'use client';

import React from 'react';

export function RuleExplanation({ rule, lang = 'uz' }) {
  if (!rule) return null;

  const ruleText = typeof rule.text === 'object' ? rule.text[lang] || rule.text.uz : rule.text;

  return (
    <div className="w-full p-4 rounded-xl glass-card border border-slate-700/60 space-y-2">
      <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
        <span>📜 YHQ {rule.code || 'Qoida'} Izohi:</span>
      </div>

      <p className="text-sm text-slate-300 italic leading-relaxed">
        "{ruleText}"
      </p>
    </div>
  );
}
