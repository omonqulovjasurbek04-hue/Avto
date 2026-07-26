import React, { useState } from 'react';
import { Question, PracticeStatus, ViewType } from '../types';
import { PRACTICE_TOPICS, PRACTICE_QUESTIONS } from '../data/mockData';
import { InteractiveCockpit } from '../components/InteractiveCockpit';
import { VideoPlayer } from '../components/VideoPlayer';
import { Lightbulb, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Sparkles, AlertTriangle } from 'lucide-react';

interface PracticeViewProps {
  onNavigate: (view: ViewType) => void;
  onOpenAuth: () => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({ onNavigate, onOpenAuth }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('Barchasi');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState<{ [questionId: number]: string }>({});

  const [status, setStatus] = useState<PracticeStatus>({
    todayGoal: 50,
    completed: 3,
    total: 20,
    correct: 2,
    incorrect: 0,
    remaining: 18,
  });

  // Filter questions by topic
  const filteredQuestions = PRACTICE_QUESTIONS.filter(
    (q) => selectedTopic === 'Barchasi' || q.topic === selectedTopic
  );

  const currentQuestion: Question = filteredQuestions[currentQuestionIndex] || PRACTICE_QUESTIONS[0];
  const userOption = selectedOptions[currentQuestion.id];
  const isAnswered = !!userOption;
  const isCorrect = userOption === currentQuestion.correctOptionId;

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return; // Prevent changing after answer
    setSelectedOptions((prev) => ({ ...prev, [currentQuestion.id]: optionId }));

    const correct = optionId === currentQuestion.correctOptionId;
    setStatus((prev) => ({
      ...prev,
      completed: prev.completed + 1,
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: !correct ? prev.incorrect + 1 : prev.incorrect,
      remaining: Math.max(0, prev.remaining - 1),
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 pt-24 pb-16 space-y-8">
      {/* TOP TOPIC FILTERS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
        <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold whitespace-nowrap">
          MAVZU:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {PRACTICE_TOPICS.map((topic) => {
            const isActive = selectedTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(topic);
                  setCurrentQuestionIndex(0);
                }}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#152031] text-[#4cd7f6] border border-[#4cd7f6]/60 shadow-[0_0_15px_rgba(76,215,246,0.3)]'
                    : 'bg-[#111c2d]/60 text-slate-300 hover:bg-[#1f2a3c] hover:text-white border border-white/5'
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: INTERACTIVE SIMULATION & QUESTION CARD */}
        <div className="lg:col-span-8 space-y-6">
          {/* Interactive Simulation Player or Cloudflare Video Stream */}
          {isAnswered ? (
            <VideoPlayer
              playbackUrl={currentQuestion.options.find((o) => o.id === userOption)?.video?.playbackUrl}
              videoType={isCorrect ? 'CORRECT' : 'WRONG'}
              durationSec={isCorrect ? 15 : 11}
              title={isCorrect ? "To'g'ri javob - Loop Harakatlanish" : "Xato javob - 10s Avariya Holati"}
            />
          ) : (
            <InteractiveCockpit
              simType={currentQuestion.hudSimulationType}
              simLabel={currentQuestion.simLabel}
              heightClass="h-[320px] md:h-[380px]"
            />
          )}

          {/* Question Text Prompt */}
          <div className="space-y-4">
            <h2 className="font-headline text-xl md:text-2xl font-bold text-white leading-snug">
              {currentQuestion.title}
            </h2>

            {/* Answer Options Grid (A, B, C, D) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option) => {
                const isSelected = userOption === option.id;
                const isCorrectAnswer = option.id === currentQuestion.correctOptionId;

                let cardStyle = 'bg-[#152031]/80 border-white/10 text-slate-200 hover:border-[#4cd7f6]/50 hover:bg-[#1f2a3c]';
                let badgeStyle = 'bg-[#1f2a3c] text-slate-300 border-white/10';

                if (isAnswered) {
                  if (isCorrectAnswer) {
                    cardStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
                    badgeStyle = 'bg-emerald-500 text-slate-950 font-bold';
                  } else if (isSelected && !isCorrect) {
                    cardStyle = 'bg-red-950/60 border-red-500 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.3)]';
                    badgeStyle = 'bg-red-500 text-white font-bold';
                  } else {
                    cardStyle = 'bg-[#111c2d]/50 border-white/5 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    disabled={isAnswered}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-start gap-3.5 group ${cardStyle}`}
                  >
                    <span className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${badgeStyle}`}>
                      {option.id}
                    </span>
                    <span className="text-sm font-medium pt-1 leading-relaxed">
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Immediate Explanation Card */}
            {isAnswered && (
              <div className={`p-4 rounded-xl border text-sm space-y-1.5 animate-fadeIn ${
                isCorrect 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>To'g'ri javob!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-amber-400" />
                      <span>Xato javob! To'g'ri javob: {currentQuestion.correctOptionId}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-7">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Navigation Control Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2.5 rounded-xl bg-[#111c2d] border border-white/10 text-slate-300 hover:text-white hover:bg-[#1f2a3c] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Oldingi</span>
            </button>

            {/* Question Pagination Dots */}
            <div className="flex items-center gap-2">
              {filteredQuestions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentQuestionIndex
                      ? 'bg-[#4cd7f6] w-6'
                      : selectedOptions[q.id]
                      ? 'bg-slate-400'
                      : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Savol ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentQuestionIndex === filteredQuestions.length - 1}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#adc6ff] to-[#4cd7f6] text-[#002e6a] font-bold text-sm hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(76,215,246,0.2)]"
            >
              <span>Keyingi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: PRACTICE STATUS & TIPS */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mashq Holati Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Mashq holati</h3>
                <p className="text-xs text-slate-400 mt-0.5">Bugungi maqsad: {status.todayGoal} ta</p>
              </div>
              <div className="font-mono font-extrabold text-3xl text-[#4cd7f6] tracking-wider">
                {String(status.completed).padStart(2, '0')}/{status.total}
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div className="grid grid-cols-8 gap-1.5 h-3">
              {Array.from({ length: 8 }).map((_, i) => {
                const filledRatio = status.completed / status.total;
                const isFilled = (i + 1) / 8 <= filledRatio;
                return (
                  <div
                    key={i}
                    className={`rounded-sm transition-all duration-300 ${
                      isFilled ? 'bg-[#4cd7f6] shadow-[0_0_8px_#4cd7f6]' : 'bg-[#111c2d]'
                    }`}
                  />
                );
              })}
            </div>

            {/* Stat Counters */}
            <div className="flex justify-between items-center text-xs font-mono border-t border-white/10 pt-4 text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4cd7f6]" />
                <span>To'g'ri: <strong className="text-white">{status.correct}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>Xato: <strong className="text-white">{status.incorrect}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span>Qoldi: <strong className="text-white">{status.remaining}</strong></span>
              </div>
            </div>
          </div>

          {/* Tip / Eslatma Box */}
          <div className="p-5 rounded-2xl bg-[#111c2d]/80 border border-[#4cd7f6]/30 text-xs space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-[#4cd7f6] font-bold uppercase font-mono tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>ESLATMA</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Teng ahamiyatli bo'lmagan chorrahada asosiy yo'lda bo'lgan haydovchilar birinchi bo'lib o'tadilar.
            </p>
          </div>

          {/* Premium Banner */}
          <div 
            onClick={onOpenAuth}
            className="relative h-44 rounded-2xl overflow-hidden glass-panel border border-white/10 cursor-pointer group p-6 flex flex-col justify-end"
          >
            <img 
              src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80" 
              alt="Premium Cockpit" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#081425] via-[#081425]/60 to-transparent" />
            <div className="relative z-10 space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Premiumga o'ting</span>
              </div>
              <p className="text-sm font-semibold text-white">
                Barcha 1000+ videolarni ochish
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
