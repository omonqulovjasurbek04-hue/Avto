'use client';

import React, { useEffect, useState } from 'react';

/**
 * ResultBanner - Animated result notification component
 * Props:
 * - show: boolean - whether to show the banner
 * - result: object { isCorrect: boolean, outcome: string }
 * - onHide: function - callback when banner should be hidden
 */
export default function ResultBanner({ show, result, onHide, duration = 3000 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onHide, 400); // Wait for slide-out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onHide]);

  if (!show && !visible) return null;

  const getOutcomeDetails = (outcome) => {
    const outcomes = {
      collision: {
        icon: '💥',
        title: 'To\'qnashuv!',
        message: 'Avtomobillar to\'qnashdi. Xavfsizlik qoidalariga rioya qilish kerak.',
        color: 'red'
      },
      priority_violation: {
        icon: '⚠️',
        title: 'Ustuvorlik buzilishi',
        message: 'Yo\'l ustuvorbigini buzib o\'tdingiz. Bu xavfli holat.',
        color: 'amber'
      },
      sign_violation: {
        icon: '🚫',
        title: 'Yo\'l belgisi buzildi',
        message: 'Yo\'l belgilariga rioya qilmadingiz.',
        color: 'red'
      },
      marking_violation: {
        icon: '⚠️',
        title: 'Yo\'l belgilanmasi buzildi',
        message: 'Yo\'l belgilanmasini hisobga olmadingiz.',
        color: 'amber'
      },
      unsafe_but_legal: {
        icon: '⚠️',
        title: 'Xavfli, ammo qonuniy',
        message: 'Harakat qonuniy, lekin xavfsiz emas.',
        color: 'amber'
      },
      unnecessary_wait: {
        icon: '⏰',
        title: 'Keraksiz kutish',
        message: 'Yo\'lni o\'tish mumkin edi, lekin kutib turdingiz.',
        color: 'amber'
      },
      safe: {
        icon: '✅',
        title: 'Xavfsiz!',
        message: 'Yo\'l harakati qoidalariga to\'liq rioya qildingiz.',
        color: 'green'
      },
      legal: {
        icon: '✅',
        title: 'To\'g\'ri!',
        message: 'Qonuniy va xavfsiz harakat.',
        color: 'green'
      }
    };

    return outcomes[outcome] || {
      icon: result?.isCorrect ? '✅' : '❌',
      title: result?.isCorrect ? 'To\'g\'ri!' : 'Xato!',
      message: result?.isCorrect ? 'Javob to\'g\'ri' : 'Javob noto\'g\'ri',
      color: result?.isCorrect ? 'green' : 'red'
    };
  };

  const outcomeDetails = getOutcomeDetails(result?.outcome);
  const isSuccess = result?.isCorrect || result?.outcome === 'safe' || result?.outcome === 'legal';

  return (
    <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-400 ${
      visible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
    }`}>
      <div className={`min-w-80 max-w-md mx-auto p-6 rounded-2xl backdrop-blur-20 border-2 shadow-2xl ${
        isSuccess 
          ? 'bg-emerald-500/20 border-emerald-500/40 shadow-glow-green' 
          : outcomeDetails.color === 'amber'
            ? 'bg-amber-500/20 border-amber-500/40 shadow-glow-amber'
            : 'bg-red-500/20 border-red-500/40 shadow-glow-red'
      } animate-slide-up`} style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
            isSuccess 
              ? 'bg-emerald-500/20 border border-emerald-500/30' 
              : outcomeDetails.color === 'amber'
                ? 'bg-amber-500/20 border border-amber-500/30'
                : 'bg-red-500/20 border border-red-500/30'
          }`}>
            <span className="animate-pulse">{outcomeDetails.icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-lg mb-2 ${
              isSuccess 
                ? 'text-emerald-300' 
                : outcomeDetails.color === 'amber'
                  ? 'text-amber-300'
                  : 'text-red-300'
            }`}>
              {outcomeDetails.title}
            </h3>
            
            <p className="text-sm text-slate-200 leading-relaxed mb-3">
              {outcomeDetails.message}
            </p>

            {/* Progress bar showing auto-hide timer */}
            <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ease-linear ${
                  isSuccess 
                    ? 'bg-emerald-500' 
                    : outcomeDetails.color === 'amber'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                }`}
                style={{ 
                  width: visible ? '0%' : '100%',
                  transitionDuration: visible ? `${duration}ms` : '0ms'
                }}
              />
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onHide, 400);
            }}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors text-lg"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}