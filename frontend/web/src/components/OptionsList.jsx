import React from 'react';

export function OptionsList({ options, lang, selectedOption, userResult, correctId, onSelect }) {
  return (
    <div className="options-list">
      {options.map((opt) => {
        const label = opt.label?.[lang] || opt.label?.['uz'] || opt.id;
        const isSelected = selectedOption === opt.id;
        const isCorrect = opt.id === correctId;
        let extraClass = '';
        if (userResult) {
          if (isSelected && userResult.correct) extraClass = 'correct-highlight';
          if (isSelected && !userResult.correct) extraClass = 'wrong-highlight';
        }
        return (
          <button
            key={opt.id}
            className={`option-btn ${isSelected ? 'selected' : ''} ${extraClass}`}
            onClick={() => onSelect(opt.id)}
          >
            <span>{label}</span>
            {isSelected && userResult?.correct && <span>✅</span>}
            {isSelected && !userResult?.correct && <span>❌</span>}
          </button>
        );
      })}
    </div>
  );
}
