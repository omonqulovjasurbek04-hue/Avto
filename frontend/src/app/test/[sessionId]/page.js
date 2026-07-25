'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import VideoPlayer from '../../../components/VideoPlayer';
import AnswerButton from '../../../components/AnswerButton';
import ProgressBar from '../../../components/ProgressBar';

function getLocaleText(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj.uz || obj.en || obj.ru || Object.values(obj)[0] || '';
}

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId;
  const categoryId = searchParams.get('catId');

  const [questions, setQuestions] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionAnswers, setSessionAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const answeredRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const history = await api.getTestHistory();
        if (!cancelled && history.find((s) => s.id === sessionId)) {
          router.replace(`/result/${sessionId}`);
          return;
        }
      } catch { /* ignore */ }

      try {
        let catId = categoryId;
        if (!catId) {
          const cats = await api.listCategories();
          catId = cats?.[0]?.id;
        }
        if (!catId) {
          if (!cancelled) setLoadError('Kategoriya topilmadi');
          if (!cancelled) setLoading(false);
          return;
        }
        const qs = await api.getCategoryQuestions(catId);
        if (!cancelled) setQuestions(qs || []);
      } catch (err) {
        if (!cancelled) setLoadError(err?.message || 'Savollarni yuklashda xatolik');
      }
      if (!cancelled) setLoading(false);
    }
    init();
    return () => { cancelled = true; };
  }, [sessionId, categoryId, router]);

  const question = questions[currentIdx];

  const handleAnswer = async (answerId) => {
    if (answeredRef.current || submitting || !question) return;
    answeredRef.current = true;
    setSelectedId(answerId);
    setAnswered(true);
    setSubmitting(true);

    try {
      const result = await api.answerQuestion(sessionId, question.id, answerId);
      setFeedback(result);
      setSessionAnswers((prev) => [...prev, { questionIdx: currentIdx, isCorrect: result.isCorrect }]);
    } catch {
      setFeedback({ isCorrect: false, videoUrl: null });
      setSessionAnswers((prev) => [...prev, { questionIdx: currentIdx, isCorrect: false }]);
    }
    setSubmitting(false);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedId(null);
      setAnswered(false);
      setFeedback(null);
      answeredRef.current = false;
    }
  };

  const handleFinish = async () => {
    try {
      await api.finishTest(sessionId);
    } catch { /* ignore */ }
    router.push(`/result/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return <div className="text-center py-12 text-red-400 max-w-md mx-auto p-6 rounded-2xl glass-card">{loadError}</div>;
  }

  if (questions.length === 0) {
    return <div className="text-center py-12 text-slate-400">Savollar topilmadi.</div>;
  }

  const answerStatus = (aId) => {
    if (!answered) return selectedId === aId ? 'selected' : 'default';
    if (selectedId === aId) return feedback?.isCorrect ? 'correct' : 'wrong';
    return 'default';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <ProgressBar current={currentIdx} total={questions.length} answers={sessionAnswers} />

      {question && (
        <>
          <div className="p-6 rounded-2xl glass-card">
            <h2 className="text-xl font-bold text-slate-100 mb-6">
              {getLocaleText(question.text)}
            </h2>

            <div className="space-y-3">
              {(question.answers || []).map((a) => (
                <AnswerButton
                  key={a.id}
                  label={getLocaleText(a.text) || '...'}
                  status={answerStatus(a.id)}
                  disabled={answered || submitting}
                  onClick={() => handleAnswer(a.id)}
                />
              ))}
            </div>
          </div>

          {answered && (
            <div className={`p-4 rounded-xl ${feedback?.isCorrect ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <p className="font-bold text-lg">{feedback?.isCorrect ? "\u2705 To'g'ri!" : "\u274C Xato!"}</p>
              <VideoPlayer
                url={feedback?.videoUrl}
                type={feedback?.isCorrect ? 'correct' : 'wrong'}
              />
            </div>
          )}
        </>
      )}

      {answered && currentIdx < questions.length - 1 && (
        <button onClick={handleNext} className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-semibold">
          Keyingisi &rarr;
        </button>
      )}

      {answered && currentIdx === questions.length - 1 && (
        <button onClick={handleFinish} className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold">
          {"\u2705"} Imtihonni Yakunlash
        </button>
      )}
    </div>
  );
}
