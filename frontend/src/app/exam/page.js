'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useTimer } from '../../hooks/useTimer';
import { useAuth } from '../../context/AuthContext';
import { ScenarioPlayer } from '../../components/scenario/ScenarioPlayer';
import { OptionsList } from '../../components/scenario/OptionsList';

export default function ExamPage() {
  const { isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [scenariosData, setScenariosData] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleTimeUp = () => {
    if (!examSubmitted) {
      handleSubmitExam();
    }
  };

  const { formatTime, isWarning } = useTimer(1500, handleTimeUp);

  useEffect(() => {
    api.generateExam()
      .then(async (res) => {
        setQuestions(res.questions);
        // Load details for all generated exam questions
        const loadedData = {};
        for (const qId of res.questions) {
          try {
            const s = await api.getScenario(qId);
            loadedData[qId] = s;
          } catch (e) {
            console.error('Failed to load scenario', qId);
          }
        }
        setScenariosData(loadedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Exam generate error:', err);
        setLoading(false);
      });
  }, []);

  const currentQId = questions[currentIndex];
  const currentScenario = scenariosData[currentQId];

  const handleOptionSelect = (optionId) => {
    if (examSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQId]: optionId,
    }));
  };

  const handleSubmitExam = async () => {
    if (examSubmitted) return;
    setExamSubmitted(true);

    const formattedAnswers = Object.entries(answers).map(([qId, optId]) => ({
      scenarioId: qId,
      optionId: optId,
    }));

    if (isAuthenticated) {
      try {
        const res = await api.submitExam(formattedAnswers, 1500);
        setExamResult(res);
      } catch (err) {
        console.error('Exam submission error:', err);
        // Fallback local scoring
        evaluateLocal(formattedAnswers);
      }
    } else {
      evaluateLocal(formattedAnswers);
    }
  };

  const evaluateLocal = (formattedAnswers) => {
    let score = 0;
    formattedAnswers.forEach((ans) => {
      const s = scenariosData[ans.scenarioId];
      if (s && s.question?.correct === ans.optionId) {
        score += 1;
      }
    });
    const total = questions.length;
    const passed = total > 0 && score >= Math.ceil(total * 0.9);
    setExamResult({ score, total, passed });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Result View after Exam Submission
  if (examSubmitted && examResult) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl glass-panel border border-slate-800 space-y-6 text-center animate-slide-up">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl shadow-lg ${
          examResult.passed
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-glow-green'
            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-glow-red'
        }`}>
          {examResult.passed ? '🎉' : '❌'}
        </div>

        <h1 className="text-3xl font-extrabold font-heading text-slate-100">
          {examResult.passed ? 'IMTIHONDAN O\'TDINGIZ!' : 'IMTIHON TOPSHIRILMADI'}
        </h1>

        <p className="text-slate-300">
          {examResult.passed
            ? 'Tabriklaymiz! Siz nazariy haydovchilik imtihonini muvaffaqiyatli topshirdingiz.'
            : 'Afsuski, yetarli ball to\'play olmadingiz. Mavzularni va mashqlarni qayta ko\'rib chiqing.'}
        </p>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-400">Natijangiz:</div>
            <div className="text-3xl font-bold font-heading text-gradient-purple">
              {examResult.score} / {examResult.total}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Foiz:</div>
            <div className="text-3xl font-bold font-heading text-cyan-400">
              {Math.round((examResult.score / examResult.total) * 100)}%
            </div>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3.5 rounded-xl bg-brand-purple hover:bg-purple-600 text-white font-bold text-base shadow-lg hover:scale-105 transition-all"
        >
          🔄 Qayta Sinab Ko'rish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top Header & Countdown Timer */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase">
            📝 Rasmiy Imtihon Rejimi
          </span>
          <h1 className="text-lg font-bold font-heading text-slate-100 mt-1">
            Savol {currentIndex + 1} / {questions.length}
          </h1>
        </div>

        {/* Countdown Timer Badge */}
        <div className={`px-4 py-2 rounded-xl font-mono font-bold text-lg border flex items-center gap-2 transition-colors ${
          isWarning
            ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
            : 'bg-slate-900 border-slate-700 text-cyan-400'
        }`}>
          <span>⏱️</span>
          <span>{formatTime()}</span>
        </div>
      </div>

      {/* Question Navigation Matrix Grid */}
      <div className="flex flex-wrap gap-2 p-3 rounded-xl glass-card border border-slate-800">
        {questions.map((qId, idx) => {
          const isAnswered = !!answers[qId];
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={qId}
              onClick={() => setCurrentIndex(idx)}
              className={`w-9 h-9 rounded-lg font-mono text-xs font-semibold border transition-all ${
                isCurrent
                  ? 'bg-brand-purple text-white border-purple-400 shadow-glow-blue'
                  : isAnswered
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Scenario View & Options */}
      {currentScenario ? (
        <div className="space-y-6">
          <ScenarioPlayer
            scenario={currentScenario}
            selectedOption={answers[currentQId]}
            isAnswered={false}
          />

          <div className="p-4 rounded-xl glass-card border border-slate-800">
            <h2 className="text-base font-bold font-heading text-slate-100 mb-4">
              {typeof currentScenario.question?.text === 'object'
                ? currentScenario.question.text.uz
                : currentScenario.question?.text}
            </h2>

            <OptionsList
              options={currentScenario.question?.options}
              selectedOption={answers[currentQId]}
              onSelect={handleOptionSelect}
              isAnswered={false}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          Savol yuklanmoqda...
        </div>
      )}

      {/* Submit Button Bar */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-semibold text-sm disabled:opacity-40"
        >
          ← Oldingi
        </button>

        <button
          onClick={handleSubmitExam}
          className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-glow-green hover:scale-105 transition-all"
        >
          ✅ Imtihonni Yakunlash
        </button>

        <button
          onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
          disabled={currentIndex === questions.length - 1}
          className="px-6 py-2.5 rounded-xl bg-brand-purple hover:bg-purple-600 text-white font-semibold text-sm disabled:opacity-40"
        >
          Keyingisi →
        </button>
      </div>
    </div>
  );
}
