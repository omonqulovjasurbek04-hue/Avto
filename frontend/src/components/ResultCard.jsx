'use client';

import React from 'react';

export default function ResultCard({ score, total, passed }) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto p-8 rounded-3xl glass-panel border border-slate-800 space-y-6 text-center animate-slide-up">
      <div
        className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl shadow-lg ${
          passed
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
        }`}
      >
        {passed ? '\u{1F389}' : '\u{274C}'}
      </div>

      <h1 className="text-3xl font-extrabold font-heading text-slate-100">
        {passed ? "IMTIHONDAN O'TDINGIZ!" : 'IMTIHON TOPSHIRILMADI'}
      </h1>

      <p className="text-slate-300">
        {passed
          ? "Tabriklaymiz! Siz nazariy haydovchilik imtihonini muvaffaqiyatli topshirdingiz."
          : "Afsuski, yetarli ball to'play olmadingiz. Mavzularni va mashqlarni qayta ko'rib chiqing."}
      </p>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-400">Natijangiz:</div>
          <div className="text-3xl font-bold font-heading text-gradient">
            {score} / {total}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Foiz:</div>
          <div className="text-3xl font-bold font-heading text-cyan-400">
            {percentage}%
          </div>
        </div>
      </div>
    </div>
  );
}
