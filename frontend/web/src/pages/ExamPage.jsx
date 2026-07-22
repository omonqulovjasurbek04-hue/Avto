import React, { useEffect, useState } from 'react';
import { ScenarioPlayer } from '../components/ScenarioPlayer';
import { useTimer } from '../hooks/useTimer';
import { api } from '../services/api';

const USER_ID = 'user-web';
const EXAM_DURATION = 1200;

export function ExamPage({ lang }) {
  const [examData, setExamData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [examResult, setExamResult] = useState(null);

  const timer = useTimer(EXAM_DURATION, () => handleSubmitExam());

  useEffect(() => {
    api.exams.generate()
      .then(setExamData)
      .then(() => timer.start())
      .catch((err) => console.error('Failed to generate exam', err));
  }, []);

  const currentScenarioId = examData?.questions?.[currentIndex];

  useEffect(() => {
    if (currentScenarioId) {
      api.scenarios.get(currentScenarioId)
        .then(setCurrentScenario)
        .catch((err) => console.error('Failed to load scenario', err));
    }
  }, [currentScenarioId]);

  const handleAnswer = (optionId) => {
    setUserAnswers((prev) => ({ ...prev, [currentScenarioId]: optionId }));
  };

  const handleSubmitExam = () => {
    timer.pause();
    const formatted = Object.entries(userAnswers).map(([scenarioId, optionId]) => ({
      scenarioId, optionId,
    }));

    api.exams.submit(USER_ID, formatted, EXAM_DURATION - timer.timeLeft)
      .then((data) => {
        setExamResult(data);
        setIsFinished(true);
      })
      .catch((err) => console.error('Failed to submit exam', err));
  };

  if (!examData) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Imtihon shakllanmoqda...</div>;
  }

  if (isFinished) {
    return (
      <div className="meta-card" style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700 }}>
          {examResult?.passed ? "🎉 Imtihon Muvaffaqiyatli Topshirildi!" : "❌ Imtihondan o'tisholmadingiz"}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 16 }}>
          Natijangiz: <strong style={{ color: '#3b82f6' }}>{examResult?.score ?? 0}</strong> / {examData.questions.length} ball
        </p>
        <div style={{ background: '#0b0f19', padding: 20, borderRadius: 12, border: '1px solid #26334d', margin: '20px 0' }}>
          <div>O'tish bali: {Math.ceil(examData.questions.length * 0.9)}/{examData.questions.length}</div>
        </div>
        <button className="btn-primary" onClick={() => window.location.reload()}>
          Qaytadan urinish
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="exam-header">
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Rasmiy YHQ Imtihon Simulyatori</h3>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>
            Savol {currentIndex + 1} / {examData.questions.length}
          </div>
        </div>

        <div className="timer-box">⏱️ {timer.formatted}</div>

        <button className="btn-primary" onClick={handleSubmitExam}>
          Imtihonni Yakunlash
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {examData.questions.map((id, index) => (
          <button
            key={id}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: 38, height: 38, borderRadius: 8,
              border: '1px solid ' + (currentIndex === index ? '#3b82f6' : '#26334d'),
              background: userAnswers[id] ? '#10b981' : currentIndex === index ? 'rgba(59, 130, 246, 0.2)' : '#151c2c',
              color: '#fff', fontWeight: 700, cursor: 'pointer',
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {currentScenario && (
        <ScenarioPlayer scenarioData={currentScenario} lang={lang} onAnswerSelected={handleAnswer} />
      )}
    </div>
  );
}
