import React, { useEffect, useState } from 'react';
import { ViewType } from '../types';
import { useAuth } from '../context/AuthContext';
import { SceneStage } from '../components/SceneStage';
import {
  categoriesApi,
  testsApi,
  ApiCategory,
  ApiQuestion,
  TestAnswerResponse,
  TestFinishResponse,
  ApiError,
} from '../api/client';
import { Clock, ChevronRight, CheckCircle2, XCircle, AlertTriangle, RotateCcw, Trophy, Lock, Loader2 } from 'lucide-react';

interface ExamViewProps {
  onNavigate: (view: ViewType) => void;
  onOpenAuth: () => void;
}

const EXAM_DURATION_SEC = 20 * 60;
const PASS_THRESHOLD = 80;

export const ExamView: React.FC<ExamViewProps> = ({ onNavigate, onOpenAuth }) => {
  const { user } = useAuth();

  const [phase, setPhase] = useState<'select' | 'running' | 'result'>('select');
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<ApiQuestion | null>(null);
  const [history, setHistory] = useState<{ questionId: string; isCorrect: boolean }[]>([]);
  const [answerResult, setAnswerResult] = useState<TestAnswerResponse | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [finishResult, setFinishResult] = useState<TestFinishResponse | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(EXAM_DURATION_SEC);

  useEffect(() => {
    if (!user) return;
    categoriesApi
      .list()
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0) setSelectedCategoryId(cats[0].id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Kategoriyalarni yuklab bo'lmadi"))
      .finally(() => setLoadingCategories(false));
  }, [user]);

  useEffect(() => {
    if (phase !== 'running') return;
    if (timeLeftSeconds <= 0) {
      handleFinish();
      return;
    }
    const interval = setInterval(() => setTimeLeftSeconds((p) => p - 1), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeftSeconds]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(Math.max(0, totalSecs) / 60);
    const secs = Math.max(0, totalSecs) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (!selectedCategoryId) return;
    setStarting(true);
    setError(null);
    try {
      const res = await testsApi.start(selectedCategoryId);
      setSessionId(res.sessionId);
      setTotal(res.total);
      setCurrentQuestion(res.question);
      setHistory([]);
      setAnswerResult(null);
      setSelectedAnswerId(null);
      setFinishResult(null);
      setTimeLeftSeconds(EXAM_DURATION_SEC);
      setPhase('running');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Imtihonni boshlab bo'lmadi");
    } finally {
      setStarting(false);
    }
  };

  const handleSelectAnswer = async (answerId: string) => {
    if (!sessionId || !currentQuestion || selectedAnswerId || submitting) return;
    setSelectedAnswerId(answerId);
    setSubmitting(true);
    setError(null);
    try {
      const res = await testsApi.answer(sessionId, currentQuestion.id, answerId);
      setAnswerResult(res);
      setHistory((prev) => [...prev, { questionId: currentQuestion.id, isCorrect: res.isCorrect }]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Javobni yuborib bo'lmadi");
      setSelectedAnswerId(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (answerResult?.nextQuestion) {
      setCurrentQuestion(answerResult.nextQuestion);
      setAnswerResult(null);
      setSelectedAnswerId(null);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    if (!sessionId) return;
    try {
      const res = await testsApi.finish(sessionId);
      setFinishResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Imtihonni yakunlab bo'lmadi");
    } finally {
      setPhase('result');
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-16 text-center space-y-6">
        <Lock className="w-12 h-12 text-[#4cd7f6] mx-auto" />
        <h1 className="font-display text-2xl font-bold text-white">Imtihon uchun tizimga kiring</h1>
        <p className="text-slate-300 text-sm">Rasmiy imtihon rejimi faqat ro'yxatdan o'tgan foydalanuvchilar uchun mavjud.</p>
        <button
          onClick={onOpenAuth}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#adc6ff] to-[#4cd7f6] text-[#002e6a] font-bold text-sm hover:brightness-110"
        >
          Tizimga kirish
        </button>
      </div>
    );
  }

  if (phase === 'select') {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-16 space-y-6">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white text-center">Imtihon uchun kategoriya tanlang</h1>
        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{error}</div>}
        {loadingCategories ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-[#4cd7f6] animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                  selectedCategoryId === cat.id
                    ? 'bg-[#152031] border-[#4cd7f6] text-white'
                    : 'bg-[#111c2d]/60 border-white/10 text-slate-300 hover:border-white/30'
                }`}
              >
                <span className="font-semibold">{cat.name}</span>
                <span className="text-xs font-mono text-slate-400">{cat._count?.questions ?? 0} ta savol</span>
              </button>
            ))}
          </div>
        )}
        <button
          onClick={handleStart}
          disabled={!selectedCategoryId || starting}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#adc6ff] to-[#4cd7f6] text-[#002e6a] font-bold text-sm hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Imtihonni boshlash</span>}
        </button>
      </div>
    );
  }

  if (phase === 'result') {
    const percentage = finishResult?.percentage ?? 0;
    const isPassed = percentage >= PASS_THRESHOLD;
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-10 pt-24 pb-16">
        <div className="glass-panel p-8 md:p-12 rounded-2xl border border-white/20 text-center space-y-6 max-w-2xl mx-auto animate-fadeIn">
          <div
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl ${
              isPassed ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500' : 'bg-red-500/20 text-red-400 border-2 border-red-500'
            }`}
          >
            {isPassed ? <Trophy className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-3xl font-bold text-white">
              {isPassed ? 'Imtihon muvaffaqiyatli topshirildi!' : 'Natija qoniqarsiz'}
            </h2>
            <p className="text-sm text-slate-300">
              {isPassed ? "Tabriklaymiz! Siz o'tish balidan yuqori natija ko'rsatdingiz." : "Afsuski, yetarli ball to'plolmadingiz. Qaytadan urinib ko'ring."}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-[#111c2d] border border-white/10 text-center">
            <div>
              <span className="text-xs text-slate-400 block">To'plangan ball</span>
              <span className="text-2xl font-bold text-white font-mono">{percentage}%</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">To'g'ri javoblar</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">
                {finishResult?.score ?? 0}/{finishResult?.total ?? 0}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">O'tish bali</span>
              <span className="text-2xl font-bold text-[#4cd7f6] font-mono">{PASS_THRESHOLD}%</span>
            </div>
          </div>
          <div className="flex gap-4 justify-center pt-4">
            <button
              onClick={() => setPhase('select')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#adc6ff] to-[#4cd7f6] text-[#002e6a] font-bold text-sm hover:brightness-110 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Qaytadan topshirish</span>
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="px-8 py-3 rounded-xl glass-panel text-white font-semibold text-sm hover:bg-white/10"
            >
              Tahlilni ko'rish
            </button>
          </div>
        </div>
      </div>
    );
  }

  // phase === 'running'
  if (!currentQuestion) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-16 flex justify-center">
        <Loader2 className="w-8 h-8 text-[#4cd7f6] animate-spin" />
      </div>
    );
  }

  const isAnswered = !!answerResult;
  const questionNumber = history.length + 1;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 pt-24 pb-16 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">Rasmiy imtihon</h1>
          <p className="text-xs font-mono text-[#4cd7f6] mt-1">
            Savol {questionNumber} / {total}
          </p>
        </div>
        <div
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full glass-panel border transition-all shadow-[0_0_20px_rgba(76,215,246,0.2)] ${
            timeLeftSeconds < 300 ? 'border-red-500 text-red-400 animate-pulse' : 'border-[#4cd7f6]/40 text-[#4cd7f6]'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="font-mono text-2xl font-extrabold tracking-widest">{formatTimer(timeLeftSeconds)}</span>
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 font-bold uppercase">Progress</span>
              <span className="text-[#4cd7f6] font-bold">{history.length}/{total} javob berildi</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((h, idx) => (
                <span
                  key={idx}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-mono font-bold ${
                    h.isCorrect ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-red-500/20 border-red-500/50 text-red-400'
                  }`}
                >
                  {idx + 1}
                </span>
              ))}
              <span className="w-8 h-8 rounded-lg border border-[#4cd7f6] bg-[#152031] flex items-center justify-center text-xs font-mono font-bold text-[#4cd7f6]">
                {questionNumber}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <SceneStage scene={currentQuestion.scene} actors={currentQuestion.actors} outcome={answerResult?.scene ?? null} />

          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 space-y-6">
            <p className="text-base md:text-lg font-medium text-white leading-relaxed">{currentQuestion.text}</p>

            <div className="space-y-3 pt-2">
              {currentQuestion.answers.map((option) => {
                const isSelected = selectedAnswerId === option.id;
                let style = 'bg-[#111c2d]/60 border-white/10 text-slate-300 hover:border-white/20 hover:bg-[#111c2d]';
                if (isAnswered && isSelected) {
                  style = answerResult.isCorrect
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                    : 'bg-red-950/60 border-red-500 text-red-200';
                } else if (isAnswered) {
                  style = 'bg-[#111c2d]/40 border-white/5 text-slate-500 opacity-60';
                } else if (isSelected) {
                  style = 'bg-[#1f2a3c] border-[#4cd7f6] text-white shadow-[0_0_15px_rgba(76,215,246,0.2)]';
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectAnswer(option.id)}
                    disabled={isAnswered || submitting}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-4 ${style}`}
                  >
                    <span className="text-sm font-medium leading-relaxed">{option.text}</span>
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div
                className={`p-4 rounded-xl border text-sm space-y-1.5 ${
                  answerResult.isCorrect ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {answerResult.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>To'g'ri javob!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-amber-400" />
                      <span>Xato javob!</span>
                    </>
                  )}
                </div>
                {answerResult.scene?.ruleText && (
                  <p className="text-xs text-slate-300 leading-relaxed pl-7">
                    {answerResult.scene.ruleCode ? `YHQ ${answerResult.scene.ruleCode}: ` : ''}
                    {answerResult.scene.ruleText}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-white/10">
              {isAnswered && (
                <button
                  onClick={handleContinue}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#adc6ff] to-[#4cd7f6] text-[#002e6a] font-bold text-xs font-mono uppercase tracking-wider hover:brightness-110 flex items-center gap-2 shadow-[0_0_15px_rgba(76,215,246,0.2)]"
                >
                  <span>{answerResult.nextQuestion ? 'Keyingi savol' : 'Imtihonni yakunlash'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
