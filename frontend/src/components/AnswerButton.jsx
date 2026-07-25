'use client';

import React from 'react';

const variants = {
  default: 'border-slate-700 bg-slate-900/60 hover:border-slate-500 text-slate-300',
  selected: 'border-brand-blue bg-blue-500/10 text-slate-100',
  correct: 'border-emerald-500 bg-emerald-500/10 text-emerald-300',
  wrong: 'border-red-500 bg-red-500/10 text-red-300',
};

export default function AnswerButton({ label, status, disabled, onClick }) {
  const variant = variants[status] || variants.default;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all ${variant} disabled:cursor-default`}
    >
      {label}
    </button>
  );
}
