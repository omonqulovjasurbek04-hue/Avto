'use client';

import React from 'react';

export function OutcomeBanner({ outcome, lang = 'uz' }) {
  if (!outcome) return null;

  const isCorrect = outcome.correct;
  const outcomeType = outcome.outcome;

  return (
    <div
      className={`w-full p-4 rounded-xl border glass-panel animate-slide-up flex items-start gap-4 ${
        isCorrect
          ? 'bg-emerald-950/40 border-emerald-500/40 shadow-glow-green'
          : 'bg-rose-950/40 border-rose-500/40 shadow-glow-red'
      }`}
    >
      <div className={`p-3 rounded-xl text-2xl flex items-center justify-center ${
        isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
      }`}>
        {isCorrect ? '✅' : '💥'}
      </div>

      <div className="flex-1 space-y-1">
        <h4 className={`text-base font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isCorrect ? 'TO\'G\'RI JAVOB!' : 'XATO JAVOB!'}
        </h4>

        <p className="text-sm text-slate-300">
          {isCorrect
            ? 'Barakalla! Siz yo\'l harakati qoidasiga to\'liq rioya qildingiz va xavfsiz o\'tdingiz.'
            : outcomeType === 'collision'
            ? 'Qoida buzilishi sababli to\'qnashuv sodir bo\'ldi! Boshqa transport vositalarining imtiyozini inobatga oling.'
            : 'Xavfli vaziyat yaratildi. Qoidani qayta ko\'rib chiqing.'}
        </p>
      </div>
    </div>
  );
}
