'use client';

import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import ScenarioPlayer from '../../components/ScenarioPlayer';

export default function PracticePage() {
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState('');
  const [selectedCat, setSelectedCat] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qsLoading, setQsLoading] = useState(false);
  const [qsError, setQsError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [result, setResult] = useState(null);
  const [correctAnswerId, setCorrectAnswerId] = useState(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [currentScenarioId, setCurrentScenarioId] = useState(null);
  const answeredRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setCatLoading(true);
    setCatError('');
    api.listCategories().then((data) => {
      if (!cancelled) setCategories(data || []);
    }).catch((err) => {
      if (!cancelled) setCatError(err?.message || 'Kategoriyalarni yuklashda xatolik');
    }).finally(() => {
      if (!cancelled) setCatLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedCat) return;
    let cancelled = false;
    setQsLoading(true);
    setQsError('');
    setQuestions([]);
    api.getCategoryQuestions(selectedCat.id).then((data) => {
      if (cancelled) return;
      
      // Parse rawData to get scenarioId for each question
      const questionsWithScenarios = (data || []).map((question, index) => {
        let scenarioId = null;
        if (question.rawData) {
          try {
            const rawData = JSON.parse(question.rawData);
            scenarioId = rawData.id || question.id;
          } catch (e) {
            console.warn('Could not parse rawData for question:', question.id);
            scenarioId = `sc-${String(index + 1).padStart(4, '0')}`; // fallback
          }
        } else {
          scenarioId = `sc-${String(index + 1).padStart(4, '0')}`; // fallback
        }
        return {
          ...question,
          scenarioId
        };
      });
      
      setQuestions(questionsWithScenarios);
      setCurrentIdx(0);
      setSelectedAnswer(null);
      setAnswered(false);
      setResult(null);
      setShowSimulation(false);
      setCurrentScenarioId(null);
      answeredRef.current = false;
    }).catch((err) => {
      if (!cancelled) setQsError(err?.message || 'Savollarni yuklashda xatolik');
    }).finally(() => {
      if (!cancelled) setQsLoading(false);
    });
    return () => { cancelled = true; };
  }, [selectedCat]);

  const question = questions[currentIdx];

  const handleAnswer = async (answerId) => {
    if (answeredRef.current || !question) return;
    answeredRef.current = true;
    setSelectedAnswer(answerId);
    setShowSimulation(true);
    setAnswering(true);
    setCorrectAnswerId(null);
    
    // Start simulation first
    // The result will be determined by the ScenarioPlayer component
  };

  const handleSimulationResult = async (simulationResult) => {
    try {
      const res = await api.checkAnswer(question.id, selectedAnswer);
      setResult({ 
        isCorrect: res.isCorrect,
        outcome: simulationResult.outcome || 'unknown'
      });
      if (!res.isCorrect && res.correctAnswerId) setCorrectAnswerId(res.correctAnswerId);
      setAnswered(true);
    } catch {
      setResult({ isCorrect: false, outcome: 'error' });
      setAnswered(true);
    } finally {
      setAnswering(false);
      setShowSimulation(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setResult(null);
      setShowSimulation(false);
      answeredRef.current = false;
    }
  };

  if (!selectedCat) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-gradient tracking-tight">
          Mashq Qilish
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Interaktiv simulyatsiya orqali YHQ qoidalarini amaliy o'rganing. 
          Har bir javobni real vaqtda ko'ring va natijalarni tahlil qiling.
        </p>
      </div>
        {catLoading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {catError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{catError}</div>
        )}
        {!catLoading && !catError && categories.length === 0 && (
          <p className="text-slate-500 text-center py-8">Hozircha kategoriyalar mavjud emas.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat, index) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat)}
              className={`group p-8 rounded-3xl glass-card text-left hover:border-brand-blue/40 transition-all duration-300 transform hover:scale-102 tilt-card animate-tilt-enter delay-${Math.min(index * 100, 300)}`}
              style={{
                '--tilt-max': '8deg',
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-blue/30 to-cyan-500/30 border border-blue-500/30 flex items-center justify-center text-2xl">
                    🚗
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 font-heading">
                      {typeof cat.name === 'object' ? (cat.name.uz || cat.name.en || cat.slug) : cat.name}
                    </h3>
                    <p className="text-sm text-slate-400">{cat._count?.questions || 0} ta savol</p>
                  </div>
                </div>
                
                {/* Progress indicator if user has progress */}
                {cat.progress && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{cat.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-blue to-cyan-500 transition-all duration-500"
                        style={{ width: `${cat.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-800/50 pb-6 mb-6">
        <button 
          onClick={() => { setSelectedCat(null); setQuestions([]); }} 
          className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-slate-100 transition-all duration-200"
        >
          <span className="text-lg group-hover:-translate-x-1 transition-transform duration-200">←</span>
          <span className="text-sm font-medium">Kategoriyalar</span>
        </button>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-cyan-400 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
            {typeof selectedCat.name === 'string' 
              ? selectedCat.name 
              : (selectedCat.name.uz || selectedCat.name.en || selectedCat.slug)
            }
          </span>
          <span className="text-xs font-mono text-slate-400">
            {currentIdx + 1} / {questions.length}
          </span>
        </div>
      </div>

      {qsLoading && (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {qsError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{qsError}</div>
      )}

      {!qsLoading && !qsError && question && (
        <>
          {/* Scenario Simulation */}
          <div className="space-y-4">
            {question.scenarioId && (
              <ScenarioPlayer
                scenarioId={question.scenarioId}
                selectedOption={selectedAnswer}
                onOptionResult={handleSimulationResult}
                className="w-full"
              />
            )}
            
            {showSimulation && (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                  <p className="text-blue-400 font-medium">Simulyatsiya davom etmoqda...</p>
                </div>
              </div>
            )}
          </div>

          {/* Question */}
          <div className="p-6 rounded-2xl glass-card">
            <h2 className="text-xl font-bold text-slate-100 mb-6">
              {typeof question.text === 'string' 
                ? question.text 
                : (() => {
                    try {
                      const parsedText = JSON.parse(question.text);
                      return parsedText.uz || parsedText.en || parsedText.ru || question.text;
                    } catch {
                      return question.text;
                    }
                  })()
              }
            </h2>

            {/* Answer Options - Enhanced with 3D tilt effects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(question.answers || []).map((a) => {
                const label = typeof a.text === 'string' 
                  ? a.text 
                  : (() => {
                      try {
                        const parsedText = JSON.parse(a.text);
                        return parsedText.uz || parsedText.en || parsedText.ru || a.text;
                      } catch {
                        return a.text || '';
                      }
                    })();
                const isSelected = selectedAnswer === a.id;
                const isCorrect = answered && correctAnswerId === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => handleAnswer(a.id)}
                    disabled={answered || answering || showSimulation}
                    className={`group relative p-6 min-h-[72px] rounded-2xl border-2 text-left font-medium transition-all duration-200 transform hover:scale-102 active:scale-98 preserve-3d ${
                      answered && isSelected && !result?.isCorrect
                        ? 'border-red-500 bg-red-500/10 text-red-300 shadow-glow-red'
                        : answered && isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-glow-green'
                          : isCorrect
                            ? 'border-emerald-500/60 bg-emerald-500/5 text-emerald-400 shadow-glow-green'
                            : isSelected
                              ? 'border-brand-blue bg-blue-500/10 text-slate-100 shadow-glow-blue'
                              : 'border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-800/60 text-slate-300 hover:shadow-md'
                    } disabled:cursor-default disabled:transform-none`}
                  >
                    <div className="relative z-10">
                      {answering && isSelected ? (
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                          <span>Tekshirilmoqda...</span>
                        </div>
                      ) : (
                        label
                      )}
                      {isCorrect && <span className="ml-2 text-xs text-emerald-400">✓ To'g'ri javob</span>}
                    </div>
                    
                    {/* Glass effect background */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Enhanced Result Banner with slide-in animation */}
          {answered && (
            <div className={`p-6 rounded-2xl animate-slide-up ${
              result?.isCorrect 
                ? 'bg-emerald-500/15 border-2 border-emerald-500/40 shadow-glow-green' 
                : 'bg-red-500/15 border-2 border-red-500/40 shadow-glow-red'
            }`}>
              <div className="flex items-center gap-4">
                <div className="text-3xl">
                  {result?.isCorrect ? '✅' : result?.outcome === 'collision' ? '💥' : '⚠️'}
                </div>
                <div>
                  <p className="font-bold text-xl mb-1">
                    {result?.isCorrect ? 'To\'g\'ri javob!' : 'Xato javob'}
                  </p>
                  <p className="text-sm opacity-80">
                    {result?.outcome === 'collision' && 'Avtomobillar to\'qnashdi'}
                    {result?.outcome === 'priority_violation' && 'Ustuvorlik huquqi buzildi'}
                    {result?.outcome === 'sign_violation' && 'Yo\'l belgilariga rioya qilinmadi'}
                    {result?.outcome === 'safe' && 'Xavfsiz harakatlanish amalga oshirildi'}
                    {!result?.outcome && (result?.isCorrect ? 'Javob to\'g\'ri' : 'Javob noto\'g\'ri')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Question Button with glow effect */}
          {answered && currentIdx < questions.length - 1 && (
            <div className="flex justify-center">
              <button 
                onClick={handleNext} 
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-blue to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-base shadow-glow-blue hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  Keyingi savol
                  <span className="text-lg">→</span>
                </span>
              </button>
            </div>
          )}

          {!qsLoading && !qsError && !question && questions.length === 0 && (
            <p className="text-slate-400 text-center py-8">Bu kategoriyada savollar yo'q.</p>
          )}
        </>
      )}
    </div>
  );
}
