import React, { useState } from 'react';
import { Smartphone, Zap, CheckCircle2, AlertTriangle, Layers, User, History, Play, Shield, ArrowRight } from 'lucide-react';
import { CATEGORIES, PRACTICE_QUESTIONS } from '../data/mockData';
import { VideoPlayer } from '../components/VideoPlayer';

export const MobileView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'test' | 'history' | 'profile'>('test');
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const currentQuestion = PRACTICE_QUESTIONS[currentQuestionIndex];
  const isCorrect = selectedAnswerId === currentQuestion.correctOptionId;

  const handleSelectAnswer = (optionId: string) => {
    setSelectedAnswerId(optionId);
    setShowVideo(true);
  };

  const handleNext = () => {
    setSelectedAnswerId(null);
    setShowVideo(false);
    setCurrentQuestionIndex((prev) => (prev + 1) % PRACTICE_QUESTIONS.length);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-[#4cd7f6]/30 hud-corner flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-5 h-5 text-[#4cd7f6]" />
            <span className="font-mono text-xs text-[#4cd7f6] uppercase tracking-widest font-semibold">
              MOBILE APP SIMULATOR (EXPO ROUTER + EXPO-VIDEO)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
            Mobil Ilova (iOS va Android) Interfeysi
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Mobil ilovada hech qanday video saqlanmaydi — har doim Cloudflare Stream API va HLS oqimi orqali ijro etiladi.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
          REACT NATIVE EXPO v52
        </div>
      </div>

      {/* MOBILE DEVICE CONTAINER */}
      <div className="flex justify-center items-center py-4">
        <div className="w-full max-w-[390px] h-[780px] rounded-[48px] bg-slate-950 border-[10px] border-slate-800 shadow-[0_0_50px_rgba(76,215,246,0.25)] relative flex flex-col overflow-hidden">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-5 bg-black rounded-full z-50 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700" />
          </div>

          {/* Mobile Screen Header */}
          <div className="pt-9 pb-3 px-5 bg-slate-900/90 border-b border-white/10 flex justify-between items-center text-xs text-slate-300 font-mono">
            <span className="font-bold text-white">AVTO EXPO</span>
            <span className="text-[#4cd7f6] flex items-center gap-1">
              <Zap className="w-3 h-3" /> STREAM LIVE
            </span>
          </div>

          {/* MOBILE CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB 1: CATEGORIES & TEST */}
            {activeTab === 'test' && (
              <div className="space-y-4">
                {/* Category Picker */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {CATEGORIES.map((cat, i) => (
                    <button
                      key={cat.id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border ${
                        i === 0
                          ? 'bg-[#4cd7f6]/20 border-[#4cd7f6] text-[#4cd7f6]'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Question Header */}
                <div className="bg-slate-900 p-3 rounded-xl border border-white/10 space-y-2">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>SAVOL {currentQuestionIndex + 1}/{PRACTICE_QUESTIONS.length}</span>
                    <span className="text-[#4cd7f6]">{currentQuestion.topic}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{currentQuestion.title}</h3>
                </div>

                {/* VIDEO PLAYER AREA */}
                {showVideo ? (
                  <div className="space-y-2">
                    <VideoPlayer
                      videoType={isCorrect ? 'CORRECT' : 'WRONG'}
                      durationSec={isCorrect ? 15 : 11}
                      title={isCorrect ? 'To\'g\'ri javob - Loop' : 'Xato - 10s Avariya'}
                      className="h-[220px]"
                    />
                    <div className={`p-3 rounded-xl text-xs font-mono border ${
                      isCorrect ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-red-950/80 border-red-500 text-red-300'
                    }`}>
                      <p className="font-bold flex items-center gap-1.5 mb-1">
                        {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {isCorrect ? "TO'G'RI JAVOB! (LOOP)" : "XATO JAVOB! (10S AVARIYA)"}
                      </p>
                      <p className="text-[11px] opacity-90">{currentQuestion.explanation}</p>
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
                  /* OPTIONS BUTTONS */
                  <div className="space-y-2">
                    {currentQuestion.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectAnswer(opt.id)}
                        className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-[#4cd7f6] text-left text-xs text-slate-200 transition-all flex items-center gap-2"
                      >
                        <span className="w-6 h-6 rounded-lg bg-white/10 font-bold text-slate-300 flex items-center justify-center text-[11px]">
                          {opt.id}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white font-mono uppercase">Imtihonlar Tarixi</h3>
                {[
                  { title: "Yo'l belgilari", score: '95%', passed: true, date: 'Bugun, 14:20' },
                  { title: 'Svetofor va signallar', score: '100%', passed: true, date: 'Kecha, 18:00' },
                  { title: 'Ustunlik huquqi', score: '60%', passed: false, date: '22-Iyun' }
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900 border border-white/10 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{item.date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded font-mono font-bold ${item.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {item.score}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: PROFILE */}
            {activeTab === 'profile' && (
              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#4cd7f6]/20 border border-[#4cd7f6] mx-auto flex items-center justify-center text-[#4cd7f6] font-bold text-xl">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Alijon Valiyev</h4>
                  <p className="text-xs text-slate-400 font-mono">alijon@avto.uz</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono inline-block">
                  PREMIUM HAYDOVCHI
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM TAB BAR */}
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
