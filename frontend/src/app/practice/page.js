'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ScenarioPlayer } from '../../components/scenario/ScenarioPlayer';
import { OptionsList } from '../../components/scenario/OptionsList';
import { OutcomeBanner } from '../../components/scenario/OutcomeBanner';
import { RuleExplanation } from '../../components/scenario/RuleExplanation';

export default function PracticePage() {
  const { lang } = useApp();
  const { isAuthenticated } = useAuth();
  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.listScenarios()
      .then((data) => {
        setScenarios(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching scenarios:', err);
        setLoading(false);
      });
  }, []);

  const currentScenarioInfo = scenarios[currentIndex];
  const [fullScenario, setFullScenario] = useState(null);

  // Fetch full scenario JSON when currentIndex changes
  useEffect(() => {
    if (!currentScenarioInfo) return;
    api.getScenario(currentScenarioInfo.id)
      .then((data) => {
        setFullScenario(data);
        setSelectedOption(null);
        setIsAnswered(false);
        setOutcome(null);
      })
      .catch((err) => console.error('Error fetching scenario detail:', err));
  }, [currentIndex, currentScenarioInfo]);

  const handleOptionSelect = async (optionId) => {
    if (isAnswered || submitting || !fullScenario) return;

    setSelectedOption(optionId);
    setIsAnswered(true);

    if (isAuthenticated) {
      setSubmitting(true);
      try {
        const res = await api.saveAnswer(fullScenario.id, optionId);
        setOutcome(res);
      } catch (err) {
        console.error('Failed to submit answer:', err);
        // Fallback local evaluation if offline or backend error
        const isCorrect = fullScenario.question?.correct === optionId;
        setOutcome({
          correct: isCorrect,
          outcome: isCorrect ? null : 'collision',
          rule: fullScenario.resolution?.rule,
        });
      } finally {
        setSubmitting(false);
      }
    } else {
      // Unauthenticated local evaluation
      const isCorrect = fullScenario.question?.correct === optionId;
      setOutcome({
        correct: isCorrect,
        outcome: isCorrect ? null : 'collision',
        rule: fullScenario.resolution?.rule,
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!fullScenario) {
    return (
      <div className="text-center py-12 text-slate-400">
        Ssenariy yuklanmadi. Backend ishlaganini tekshiring.
      </div>
    );
  }

  const questionText = typeof fullScenario.question?.text === 'object'
    ? fullScenario.question.text[lang] || fullScenario.question.text.uz
    : fullScenario.question?.text;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>SSENARIY: {fullScenario.id}</span>
            <span>•</span>
            <span className="uppercase">{fullScenario.topic}</span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold font-heading text-slate-100 mt-1">
            {questionText}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            {currentIndex + 1} / {scenarios.length}
          </span>
        </div>
      </div>

      {/* 2D Canvas Engine Player */}
      <ScenarioPlayer
        scenario={fullScenario}
        selectedOption={selectedOption}
        isAnswered={isAnswered}
      />

      {/* Outcome Banner (Shown when answered) */}
      {isAnswered && outcome && (
        <OutcomeBanner outcome={outcome} lang={lang} />
      )}

      {/* Rule Explanation */}
      {isAnswered && outcome?.rule && (
        <RuleExplanation rule={outcome.rule} lang={lang} />
      )}

      {/* Question Options List */}
      <OptionsList
        options={fullScenario.question?.options}
        selectedOption={selectedOption}
        onSelect={handleOptionSelect}
        isAnswered={isAnswered}
        lang={lang}
      />

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          ← Oldingi
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === scenarios.length - 1}
          className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-semibold text-sm shadow-glow-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Keyingisi →
        </button>
      </div>
    </div>
  );
}
