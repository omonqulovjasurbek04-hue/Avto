'use client';

import React from 'react';

export default function ProgressBar({ current, total, answers }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-800">
      <div>
        <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase">
          Imtihon
        </span>
        <h1 className="text-lg font-bold mt-1">
          Savol {current + 1} / {total}
        </h1>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => {
          const answered = answers?.find((a) => a.questionIdx === i);
          return (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                answered
                  ? answered.isCorrect
                    ? 'bg-emerald-500'
                    : 'bg-red-500'
                  : i === current
                    ? 'bg-brand-blue'
                    : 'bg-slate-700'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
