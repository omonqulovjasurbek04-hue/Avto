import React, { useEffect, useState } from 'react';
import { ScenarioPlayer } from '../components/ScenarioPlayer';

export function PracticePage({ lang }) {
  const [scenarios, setScenarios] = useState([]);
  const [selectedId, setSelectedId] = useState('sc-0001');
  const [currentScenario, setCurrentScenario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scenarios')
      .then((res) => res.json())
      .then((data) => {
        setScenarios(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load scenario list", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetch(`/api/scenarios/${selectedId}`)
        .then((res) => res.json())
        .then((data) => setCurrentScenario(data))
        .catch((err) => console.error("Failed to load scenario detail", err));
    }
  }, [selectedId]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Yuklanmoqda...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Topic / Scenario Selector Pills */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
        {scenarios.map((sc) => (
          <button
            key={sc.id}
            onClick={() => setSelectedId(sc.id)}
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              border: '1.5px solid ' + (selectedId === sc.id ? '#3b82f6' : '#26334d'),
              background: selectedId === sc.id ? 'rgba(59, 130, 246, 0.15)' : '#151c2c',
              color: selectedId === sc.id ? '#3b82f6' : '#f8fafc',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {sc.id.toUpperCase()} — {sc.question?.[lang] || sc.question?.['uz'] || sc.type}
          </button>
        ))}
      </div>

      {currentScenario ? (
        <ScenarioPlayer
          scenarioData={currentScenario}
          lang={lang}
          onAnswerSelected={(optionId) => {
            // Record the attempt so Analytics reflects practice, not just exams.
            // The server re-derives correctness from the engine — the client
            // never asserts it. Best-effort: a failed POST must not break the lesson.
            fetch('/api/progress/user-web/answer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ scenarioId: currentScenario.id, optionId }),
            }).catch((err) => console.error('Failed to record answer', err));
          }}
        />
      ) : (
        <div style={{ padding: 40, textAlign: 'center' }}>Ssenariy tanlanmadi.</div>
      )}
    </div>
  );
}
