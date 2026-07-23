'use client';

import React from 'react';

export function OptionsList({ options, selectedOption, onSelect, isAnswered, lang = 'uz' }) {
  if (!options || options.length === 0) return null;

  return (
    <div className="space-y-3 w-full">
      <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
        Javob variantini tanlang:
      </h3>

      {options.map((opt, idx) => {
        const isSelected = selectedOption === opt.id;
        const labelText = typeof opt.label === 'object' ? opt.label[lang] || opt.label.uz : opt.label;

        let styleClass = 'bg-bg-dark/80 hover:bg-slate-800/80 text-slate-200 border-slate-700/60';

        if (isSelected) {
          styleClass = 'bg-blue-600/20 border-brand-blue text-white shadow-glow-blue scale-[1.01]';
        }

        return (
          <button
            key={opt.id || idx}
            disabled={isAnswered}
            onClick={() => onSelect(opt.id)}
            className={`w-full p-4 rounded-xl text-left border flex items-center gap-4 transition-all duration-200 ${styleClass} ${
              isAnswered ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'
            }`}
          >
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm transition-all ${
              isSelected ? 'bg-brand-blue text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {String.fromCharCode(65 + idx)}
            </span>

            <span className="flex-1 font-medium text-sm md:text-base leading-snug">
              {labelText}
            </span>

            {isSelected && (
              <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-ping" />
            )}
          </button>
        );
      })}
    </div>
  );
}
