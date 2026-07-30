import React, { useEffect, useState } from 'react';
import { Smartphone, Zap, CheckCircle2, AlertTriangle, Layers, User, History, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { categoriesApi, practiceApi, testsApi, ApiCategory, ApiQuestion, PracticeCheckResult } from '../api/client';
import { SceneStage } from '../components/SceneStage';

export const MobileView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'test' | 'history' | 'profile'>('test');

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerResult, setAnswerResult] = useState<PracticeCheckResult | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const [history, setHistory] = useState<Awaited<ReturnType<typeof testsApi.history>> | null>(null);

  useEffect(() => {
    categoriesApi.list().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) setSelectedCategoryId(cats[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) return;
    setCurrentQuestionIndex(0);
    setSelectedAnswerId(null);
    setAnswerResult(null);
    categoriesApi.questions(selectedCategoryId).then(setQuestions);
  }, [selectedCategoryId]);

  useEffect(() => {
    if (activeTab === 'history' && user) {
      testsApi.history().then(setHistory);
    }
  }, [activeTab, user]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectAnswer = async (answerId: string) => {
    if (!currentQuestion || selectedAnswerId) return;
    setSelectedAnswerId(answerId);
    const result = await practiceApi.check(currentQuestion.id, answerId);
    setAnswerResult(result);
  };

  const handleNext = () => {
    setSelectedAnswerId(null);
    setAnswerResult(null);
    setCurrentQuestionIndex((prev) => (prev + 1) % Math.max(1, questions.length));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-[#4cd7f6]/30 hud-corner flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-5 h-5 text-[#4cd7f6]" />
            <span className="font-mono text-xs text-[#4cd7f6] uppercase tracking-widest font-semibold">
              MOBIL ILOVA KO'RINISHI (real backend ma'lumotlari bilan)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white">Mobil Ilova (iOS va Android) Interfeysi</h1>
          <p className="text-slate-400 text-sm mt-1">
            Bu — haqiqiy Expo mobil ilovaning veb-ko'rinishdagi namunasi. Asosiy mobil kod{' '}
            <code className="text-[#4cd7f6]">frontend/mobile/</code> papkasida.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
          REACT NATIVE EXPO
        </div>
      </div>

      {/* MOBILE DEVICE CONTAINER */}
      <div className="flex justify-center items-center py-4">
        <div className="w-full max-w-[390px] h-[780px] rounded-[48px] bg-slate-950 border-[10px] border-slate-800 shadow-[0_0_50px_rgba(76,215,246,0.25)] relative flex flex-col overflow-hidden">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-5 bg-black rounded-full z-50 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700" />
          </div>

          <div className="pt-9 pb-3 px-5 bg-slate-900/90 border-b border-white/10 flex justify-between items-center text-xs text-slate-300 font-mono">
            <span className="font-bold text-white">AVTO EXPO</span>
            <span className="text-[#4cd7f6] flex items-center gap-1">
              <Zap className="w-3 h-3" /> LIVE API
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'test' && (
              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border ${
                        selectedCategoryId === cat.id
                          ? 'bg-[#4cd7f6]/20 border-[#4cd7f6] text-[#4cd7f6]'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {!currentQuestion ? (
                  <div className="p-6 text-center text-xs text-slate-500">Savollar yuklanmoqda...</div>
                ) : (
                  <>
                    <div className="bg-slate-900 p-3 rounded-xl border border-white/10 space-y-2">
                      <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span>
                          SAVOL {currentQuestionIndex + 1}/{questions.length}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white leading-snug">{currentQuestion.text}</h3>
                    </div>

                    <SceneStage
                      scene={currentQuestion.scene}
                      actors={currentQuestion.actors}
                      outcome={answerResult?.scene ?? null}
                      heightClass="h-[180px]"
                    />

                    {answerResult ? (
                      <div className="space-y-2">
                        <div
                          className={`p-3 rounded-xl text-xs font-mono border ${
                            answerResult.isCorrect
                              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                              : 'bg-red-950/80 border-red-500 text-red-300'
                          }`}
                        >
                          <p className="font-bold flex items-center gap-1.5 mb-1">
                            {answerResult.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            {answerResult.isCorrect ? "TO'G'RI JAVOB!" : 'XATO JAVOB!'}
                          </p>
                          {answerResult.scene?.ruleText && <p className="text-[11px] opacity-90">{answerResult.scene.ruleText}</p>}
                        </div>

                        <button
                          onClick={handleNext}
                          className="w-full py-2.5 rounded-xl bg-[#4cd7f6] text-black font-bold text-xs flex items-center justify-center gap-1"
                        >
                          <span>KEYINGI SAVOL</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {currentQuestion.answers.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectAnswer(opt.id)}
                            className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-[#4cd7f6] text-left text-xs text-slate-200 transition-all"
                          >
                            {opt.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white font-mono uppercase">Imtihonlar Tarixi</h3>
                {!user ? (
                  <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                    <Lock className="w-5 h-5 text-[#4cd7f6]" />
                    Tarixni ko'rish uchun tizimga kiring
                  </div>
                ) : !history || history.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-center text-xs text-slate-400">
                    Hali imtihon topshirilmagan.
                  </div>
                ) : (
                  history.map((item) => {
                    const pct = item.totalCount ? Math.round(((item.totalScore || 0) / item.totalCount) * 100) : null;
                    return (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-900 border border-white/10 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white">{item.category.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{new Date(item.startedAt).toLocaleDateString('uz-UZ')}</p>
                        </div>
                        {pct !== null && (
                          <span className={`px-2 py-1 rounded font-mono font-bold ${pct >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {pct}%
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-center space-y-3">
                {!user ? (
                  <div className="text-xs text-slate-400 flex flex-col items-center gap-2 py-4">
                    <Lock className="w-5 h-5 text-[#4cd7f6]" />
                    Profilni ko'rish uchun tizimga kiring
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[#4cd7f6]/20 border border-[#4cd7f6] mx-auto flex items-center justify-center text-[#4cd7f6] font-bold text-xl">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{user.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">{user.email || user.phone}</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-[#4cd7f6]/20 text-[#4cd7f6] text-[10px] font-mono inline-block">
                      {user.role}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-900 border-t border-white/10 grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveTab('test')}
              className={`py-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-mono ${
                activeTab === 'test' ? 'text-[#4cd7f6] bg-white/5' : 'text-slate-400'
              }`}
            >
              <Layers className="w-4 h-4" />
              TEST
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-mono ${
                activeTab === 'history' ? 'text-[#4cd7f6] bg-white/5' : 'text-slate-400'
              }`}
            >
              <History className="w-4 h-4" />
              TARIX
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-mono ${
                activeTab === 'profile' ? 'text-[#4cd7f6] bg-white/5' : 'text-slate-400'
              }`}
            >
              <User className="w-4 h-4" />
              PROFIL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
