import React, { useEffect, useMemo, useState } from 'react';
import { ViewType } from '../types';
import { SceneStage } from '../components/SceneStage';
import { categoriesApi, practiceApi, ApiCategory, ApiQuestion, PracticeCheckResult, ApiError } from '../api/client';
import { Lightbulb, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Sparkles, Loader2 } from 'lucide-react';

interface PracticeViewProps {
  onNavigate: (view: ViewType) => void;
  onOpenAuth: () => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({ onOpenAuth }) => {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState<Record<string, { answerId: string; result: PracticeCheckResult }>>({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoriesApi
      .list()
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0) setSelectedCategoryId(cats[0].id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Kategoriyalarni yuklab bo'lmadi"))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) return;
    setLoadingQuestions(true);
    setCurrentIndex(0);
    categoriesApi
      .questions(selectedCategoryId)
      .then(setQuestions)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Savollarni yuklab bo'lmadi"))
      .finally(() => setLoadingQuestions(false));
  }, [selectedCategoryId]);

  const currentQuestion = questions[currentIndex];
  const currentAnswered = currentQuestion ? answered[currentQuestion.id] : undefined;
  const isAnswered = !!currentAnswered;
  const isCorrect = !!currentAnswered?.result.isCorrect;

  const stats = useMemo(() => {
    const inThisCategory = questions.filter((q) => answered[q.id]);
    const correct = inThisCategory.filter((q) => answered[q.id].result.isCorrect).length;
    return {
      total: questions.length,
      completed: inThisCategory.length,
      correct,
      incorrect: inThisCategory.length - correct,
      remaining: questions.length - inThisCategory.length,
    };
  }, [questions, answered]);

  const handleSelectOption = async (answerId: string) => {
    if (isAnswered || checking || !currentQuestion) return;
    setChecking(true);
    setError(null);
    try {
      const result = await practiceApi.check(currentQuestion.id, answerId);
      setAnswered((prev) => ({ ...prev, [currentQuestion.id]: { answerId, result } }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Javobni tekshirib bo'lmadi");
    } finally {
      setChecking(false);
    }
  };

  const handleNext = () => currentIndex < questions.length - 1 && setCurrentIndex((p) => p + 1);
  const handlePrev = () => currentIndex > 0 && setCurrentIndex((p) => p - 1);

  const correctAnswerText = currentAnswered?.result.correctAnswerId
    ? currentQuestion?.answers.find((a) => a.id === currentAnswered.result.correctAnswerId)?.text
    : null;

  if (loadingCategories) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-16 flex justify-center">
        <Loader2 className="w-8 h-8 text-[#4cd7f6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 pt-24 pb-16 space-y-8">
      {/* TOP TOPIC FILTERS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
        <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold whitespace-nowrap">
          MAVZU:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => {
            const isActive = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#152031] text-[#4cd7f6] border border-[#4cd7f6]/60 shadow-[0_0_15px_rgba(76,215,246,0.3)]'
                    : 'bg-[#111c2d]/60 text-slate-300 hover:bg-[#1f2a3c] hover:text-white border border-white/5'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{error}</div>
      )}

      {loadingQuestions || !currentQuestion ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#4cd7f6] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: SCENE & QUESTION CARD */}
          <div className="lg:col-span-8 space-y-6">
            <SceneStage
              scene={currentQuestion.scene}
              actors={currentQuestion.actors}
              outcome={currentAnswered?.result.scene ?? null}
            />

            <div className="space-y-4">
              <h2 className="font-headline text-xl md:text-2xl font-bold text-white leading-snug">
                {currentQuestion.text}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.answers.map((option) => {
                  const isSelected = currentAnswered?.answerId === option.id;
                  const isTheCorrectOne = isAnswered && currentAnswered.result.correctAnswerId === option.id;

                  let cardStyle = 'bg-[#152031]/80 border-white/10 text-slate-200 hover:border-[#4cd7f6]/50 hover:bg-[#1f2a3c]';
                  if (isAnswered) {
                    if (isTheCorrectOne) {
                      cardStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
                    } else if (isSelected) {
                      cardStyle = 'bg-red-950/60 border-red-500 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.3)]';
                    } else {
                      cardStyle = 'bg-[#111c2d]/50 border-white/5 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      disabled={isAnswered || checking}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-start gap-3.5 group ${cardStyle}`}
                    >
                      <span className="text-sm font-medium pt-1 leading-relaxed">{option.text}</span>
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div
                  className={`p-4 rounded-xl border text-sm space-y-1.5 animate-fadeIn ${
                    isCorrect ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>To'g'ri javob!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-amber-400" />
                        <span>Xato javob!{correctAnswerText ? ` To'g'ri javob: ${correctAnswerText}` : ''}</span>
                      </>
                    )}
                  </div>
                  {currentAnswered.result.scene?.ruleText && (
                    <p className="text-xs text-slate-300 leading-relaxed pl-7">
                      {currentAnswered.result.scene.ruleCode ? `YHQ ${currentAnswered.result.scene.ruleCode}: ` : ''}
                      {currentAnswered.result.scene.ruleText}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-6 py-2.5 rounded-xl bg-[#111c2d] border border-white/10 text-slate-300 hover:text-white hover:bg-[#1f2a3c] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold flex items-center gap-2 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Oldingi</span>
              </button>

              <div className="flex items-center gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentIndex ? 'bg-[#4cd7f6] w-6' : answered[q.id] ? 'bg-slate-400' : 'bg-slate-700 hover:bg-slate-500'
                    }`}
                    title={`Savol ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#adc6ff] to-[#4cd7f6] text-[#002e6a] font-bold text-sm hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(76,215,246,0.2)]"
              >
                <span>Keyingi</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: PRACTICE STATUS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Mashq holati</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Ushbu mavzu bo'yicha</p>
                </div>
                <div className="font-mono font-extrabold text-3xl text-[#4cd7f6] tracking-wider">
                  {String(stats.completed).padStart(2, '0')}/{stats.total}
                </div>
              </div>

              <div className="grid grid-cols-8 gap-1.5 h-3">
                {Array.from({ length: 8 }).map((_, i) => {
                  const filledRatio = stats.total > 0 ? stats.completed / stats.total : 0;
                  const isFilled = (i + 1) / 8 <= filledRatio;
                  return (
                    <div key={i} className={`rounded-sm transition-all duration-300 ${isFilled ? 'bg-[#4cd7f6] shadow-[0_0_8px_#4cd7f6]' : 'bg-[#111c2d]'}`} />
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-xs font-mono border-t border-white/10 pt-4 text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4cd7f6]" />
                  <span>To'g'ri: <strong className="text-white">{stats.correct}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span>Xato: <strong className="text-white">{stats.incorrect}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                  <span>Qoldi: <strong className="text-white">{stats.remaining}</strong></span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111c2d]/80 border border-[#4cd7f6]/30 text-xs space-y-2 relative overflow-hidden">
              <div className="flex items-center gap-2 text-[#4cd7f6] font-bold uppercase font-mono tracking-wider">
                <Lightbulb className="w-4 h-4" />
                <span>ESLATMA</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Har bir savolda kim birinchi o'tishi kerakligini tanlang — natija va sabab (YHQ moddasi) darhol ko'rsatiladi.
              </p>
            </div>

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
                  <span>Hisobga kiring</span>
                </div>
                <p className="text-sm font-semibold text-white">To'liq imtihon rejimini oching</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
