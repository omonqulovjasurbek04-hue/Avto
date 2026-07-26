import React, { useState, useEffect } from 'react';
import { Question, ExamAnswer, ViewType } from '../types';
import { EXAM_QUESTIONS } from '../data/mockData';
import { InteractiveCockpit } from '../components/InteractiveCockpit';
import { Clock, Flag, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, RotateCcw, Trophy } from 'lucide-react';

interface ExamViewProps {
  onNavigate: (view: ViewType) => void;
  onOpenAuth: () => void;
}

export const ExamView: React.FC<ExamViewProps> = ({ onNavigate }) => {
  const [currentIdx, setCurrentIdx] = useState<number>(3); // Default to question 4 (0-indexed 3) as shown in image
  const [userAnswers, setUserAnswers] = useState<{ [qId: number]: ExamAnswer }>({
    1: { questionId: 1, selectedOptionId: 'C' },
    2: { questionId: 2, selectedOptionId: 'A' },
    3: { questionId: 3, selectedOptionId: 'A' },
  });

  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(20 * 60); // 20:00 timer
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Timer Countdown
  useEffect(() => {
    if (isExamSubmitted || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          setIsExamSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeftSeconds, isExamSubmitted]);

  const currentQ: Question = EXAM_QUESTIONS[currentIdx] || EXAM_QUESTIONS[0];
  const currentAnswer = userAnswers[currentQ.id] || { questionId: currentQ.id };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectOption = (optId: string) => {
    if (isExamSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        questionId: currentQ.id,
        selectedOptionId: optId,
      },
    }));
  };

  const handleToggleFlag = () => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        questionId: currentQ.id,
        flagged: !prev[currentQ.id]?.flagged,
      },
    }));
  };

  // Calculate score
  const answeredCount = (Object.values(userAnswers) as ExamAnswer[]).filter((a) => a.selectedOptionId).length;
  const correctCount = EXAM_QUESTIONS.filter(
    (q) => userAnswers[q.id]?.selectedOptionId === q.correctOptionId
  ).length;
  const scorePercent = Math.round((correctCount / EXAM_QUESTIONS.length) * 100);
  const isPassed = scorePercent >= 80;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 pt-24 pb-16 space-y-8">
      {/* HEADER SECTION WITH TIMER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">
            Driver Certification Exam
          </h1>
          <p className="text-xs font-mono text-[#4cd7f6] mt-1">
            Module 4: Urban Navigation Protocol
          </p>
        </div>

        {/* Floating Timer Badge */}
        <div className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full glass-panel border transition-all shadow-[0_0_20px_rgba(76,215,246,0.2)] ${
          timeLeftSeconds < 300 ? 'border-red-500 text-red-400 animate-pulse' : 'border-[#4cd7f6]/40 text-[#4cd7f6]'
        }`}>
          <Clock className="w-5 h-5" />
          <span className="font-mono text-2xl font-extrabold tracking-widest">
            {formatTimer(timeLeftSeconds)}
          </span>
        </div>
      </div>

      {/* EXAM CONTENT OR RESULTS MODAL */}
      {isExamSubmitted ? (
        <div className="glass-panel p-8 md:p-12 rounded-2xl border border-white/20 text-center space-y-6 max-w-2xl mx-auto animate-fadeIn">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl ${
            isPassed ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500' : 'bg-red-500/20 text-red-400 border-2 border-red-500'
          }`}>
            {isPassed ? <Trophy className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-3xl font-bold text-white">
              {isPassed ? 'Imtihon Muvaffaqiyatli Topshirildi!' : 'Natija Qoniqarsiz'}
            </h2>
            <p className="text-sm text-slate-300">
              {isPassed 
                ? 'Tabriklaymiz! Siz O\'zbekiston YHQ sertifikatsiyasi sinovidan muvaffaqiyatli o\'tdingiz.' 
                : 'Afsuski, yetarli ball to\'plolmadingiz. Qaytadan urinib ko\'ring.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-[#111c2d] border border-white/10 text-center">
            <div>
              <span className="text-xs text-slate-400 block">To'plangan Ball</span>
              <span className="text-2xl font-bold text-white font-mono">{scorePercent}%</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">To'g'ri Javoblar</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">{correctCount}/20</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">O'tish Bali</span>
              <span className="text-2xl font-bold text-[#4cd7f6] font-mono">80%</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <button
              onClick={() => {
                setIsExamSubmitted(false);
                setTimeLeftSeconds(20 * 60);
                setUserAnswers({});
                setCurrentIdx(0);
              }}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#adc6ff] to-[#4cd7f6] text-[#002e6a] font-bold text-sm hover:brightness-110 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Qaytadan Topshirish</span>
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="px-8 py-3 rounded-xl glass-panel text-white font-semibold text-sm hover:bg-white/10"
            >
              Tahlilni Ko'rish
            </button>
          </div>
        </div>
      ) : (
        /* MAIN EXAM GRID */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT SIDEBAR: QUESTION MATRIX */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-bold uppercase">Question Matrix</span>
                <span className="text-[#4cd7f6] font-bold">
                  {answeredCount}/20 Answered
                </span>
              </div>

              {/* 5x4 Grid Matrix of Question Numbers */}
              <div className="grid grid-cols-5 gap-2.5">
                {EXAM_QUESTIONS.map((q, idx) => {
                  const ans = userAnswers[q.id];
                  const isCurrent = idx === currentIdx;
                  const isAnswered = !!ans?.selectedOptionId;
                  const isFlagged = !!ans?.flagged;

                  let style = 'bg-[#111c2d] border-white/10 text-slate-300 hover:bg-[#1f2a3c]';
                  if (isCurrent) {
                    style = 'bg-[#152031] border-[#4cd7f6] text-[#4cd7f6] font-bold shadow-[0_0_12px_rgba(76,215,246,0.4)]';
                  } else if (isAnswered) {
                    style = 'bg-[#1f2a3c] border-[#4cd7f6]/40 text-white font-semibold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-10 rounded-lg border text-xs font-mono transition-all flex items-center justify-center relative ${style}`}
                    >
                      {q.id}
                      {isFlagged && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Flag for review button */}
              <button
                onClick={handleToggleFlag}
                className={`w-full py-3 rounded-xl border text-xs font-mono uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 ${
                  currentAnswer?.flagged
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-[#111c2d] border-white/10 text-slate-300 hover:border-white/30'
                }`}
              >
                <Flag className="w-4 h-4" />
                <span>{currentAnswer?.flagged ? 'FLAGGED FOR REVIEW' : 'FLAG FOR REVIEW'}</span>
              </button>
            </div>
          </div>

          {/* RIGHT MAIN PANEL: HUD COCKPIT & QUESTION CHOICES */}
          <div className="lg:col-span-8 space-y-6">
            {/* Interactive HUD Cockpit */}
            <InteractiveCockpit
              simType={currentQ.hudSimulationType}
              simLabel={currentQ.simLabel || `SIM_ENV_${String(currentQ.id).padStart(2, '0')}`}
              heightClass="h-[300px] md:h-[350px]"
            />

            {/* Question Details Card */}
            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-md bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/30 font-mono text-xs font-bold">
                    QUESTION {String(currentQ.id).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Multiple Choice</span>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-base md:text-lg font-medium text-white leading-relaxed">
                {currentQ.title}
              </p>

              {/* Radio Choices */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((option) => {
                  const isSelected = currentAnswer?.selectedOptionId === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-4 ${
                        isSelected
                          ? 'bg-[#1f2a3c] border-[#4cd7f6] text-white shadow-[0_0_15px_rgba(76,215,246,0.2)]'
                          : 'bg-[#111c2d]/60 border-white/10 text-slate-300 hover:border-white/20 hover:bg-[#111c2d]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'border-[#4cd7f6] bg-[#4cd7f6]' : 'border-slate-500'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#081425]" />}
                      </div>
                      <span className="text-sm font-medium leading-relaxed">
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Action Controls */}
              <div className="flex justify-between items-center pt-6 border-t border-white/10">
                <button
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="px-6 py-2.5 rounded-xl bg-[#111c2d] border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>PREVIOUS</span>
                </button>

                {currentIdx === EXAM_QUESTIONS.length - 1 ? (
                  <button
                    onClick={() => setIsExamSubmitted(true)}
                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider hover:brightness-110 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    SUBMIT EXAM
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIdx((prev) => Math.min(EXAM_QUESTIONS.length - 1, prev + 1))}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#adc6ff] to-[#4cd7f6] text-[#002e6a] font-bold text-xs font-mono uppercase tracking-wider hover:brightness-110 flex items-center gap-2 shadow-[0_0_15px_rgba(76,215,246,0.2)]"
                  >
                    <span>NEXT QUESTION</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
