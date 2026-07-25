'use client';

import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';

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
  const answeredRef = useRef(false);

  useEffect(() => {
    setCatLoading(true);
    setCatError('');
    api.listCategories().then((data) => {
      setCategories(data || []);
    }).catch((err) => {
      setCatError(err?.message || 'Kategoriyalarni yuklashda xatolik');
    }).finally(() => setCatLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCat) return;
    setQsLoading(true);
    setQsError('');
    setQuestions([]);
    api.getCategoryQuestions(selectedCat.id).then((data) => {
      setQuestions(data || []);
      setCurrentIdx(0);
      setSelectedAnswer(null);
      setAnswered(false);
      setResult(null);
      answeredRef.current = false;
    }).catch((err) => {
      setQsError(err?.message || 'Savollarni yuklashda xatolik');
    }).finally(() => setQsLoading(false));
  }, [selectedCat]);

  const question = questions[currentIdx];

  const handleAnswer = async (answerId) => {
    if (answeredRef.current || !question) return;
    answeredRef.current = true;
    setSelectedAnswer(answerId);
    setAnswered(true);
    setAnswering(true);
    try {
      const res = await api.checkAnswer(question.id, answerId);
      setResult({ isCorrect: res.isCorrect });
    } catch {
      setResult({ isCorrect: false });
    } finally {
      setAnswering(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setResult(null);
    }
  };

  if (!selectedCat) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold font-heading">Mashq qilish</h1>
        <p className="text-slate-400">Kategoriyani tanlang:</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat)}
              className="p-6 rounded-2xl glass-card text-left hover:border-brand-blue/40 transition-all"
            >
              <h3 className="text-lg font-bold text-slate-100">{typeof cat.name === 'object' ? (cat.name.uz || cat.name.en || cat.slug) : cat.name}</h3>
              <p className="text-sm text-slate-400 mt-1">{cat._count?.questions || 0} ta savol</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
        <button onClick={() => { setSelectedCat(null); setQuestions([]); }} className="text-sm text-slate-400 hover:text-slate-200">&larr; Orqaga</button>
        <span className="text-xs font-mono text-cyan-400">{typeof selectedCat.name === 'object' ? (selectedCat.name.uz || selectedCat.name.en) : selectedCat.name} • {currentIdx + 1}/{questions.length}</span>
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
          <div className="p-6 rounded-2xl glass-card">
            <h2 className="text-xl font-bold text-slate-100 mb-6">
              {typeof question.text === 'object' ? (question.text.uz || question.text.en || question.text.ru || '') : question.text}
            </h2>

            <div className="space-y-3">
              {(question.answers || []).map((a) => {
                const label = typeof a.text === 'object' ? (a.text.uz || a.text.en || a.text.ru || '') : (a.text || '');
                const isSelected = selectedAnswer === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => handleAnswer(a.id)}
                    disabled={answered || answering}
                    className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all ${
                      answered && isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : isSelected
                          ? 'border-brand-blue bg-blue-500/10 text-slate-100'
                          : 'border-slate-700 bg-slate-900/60 hover:border-slate-500 text-slate-300'
                    } disabled:cursor-default`}
                  >
                    {answering && isSelected ? 'Tekshirilmoqda...' : label}
                  </button>
                );
              })}
            </div>
          </div>

          {answered && (
            <div className={`p-4 rounded-xl ${result?.isCorrect ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <p className="font-bold text-lg">{result?.isCorrect ? '✅ To\'g\'ri javob!' : '❌ Xato javob'}</p>
            </div>
          )}

          {answered && currentIdx < questions.length - 1 && (
            <button onClick={handleNext} className="px-6 py-3 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-semibold">
              Keyingisi &rarr;
            </button>
          )}

          {!qsLoading && !qsError && !question && questions.length === 0 && (
            <p className="text-slate-400 text-center py-8">Bu kategoriyada savollar yo'q.</p>
          )}
        </>
      )}
    </div>
  );
}
