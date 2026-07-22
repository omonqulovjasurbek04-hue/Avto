import React, { useEffect, useState } from 'react';
import { ScenarioPlayer } from '../components/ScenarioPlayer';

export function PracticePage({ lang = 'uz' }) {
  const [scenarios, setScenarios] = useState([]);
  const [activeTopic, setActiveTopic] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
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
        console.error('Failed to load scenario list', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetch(`/api/scenarios/${selectedId}`)
        .then((res) => res.json())
        .then((data) => setCurrentScenario(data))
        .catch((err) => console.error('Failed to load scenario detail', err));
    }
  }, [selectedId]);

  const filteredScenarios =
    activeTopic === 'all'
      ? scenarios
      : scenarios.filter((s) => s.topic === activeTopic);

  const currentIndex = filteredScenarios.findIndex((s) => s.id === selectedId);

  const handleNext = () => {
    if (currentIndex < filteredScenarios.length - 1) {
      setSelectedId(filteredScenarios[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedId(filteredScenarios[currentIndex - 1].id);
    }
  };

  if (loading) {
    return <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Ssenariylar yuklanmoqda...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header & Topic Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700 }}>🚦 Interaktiv Chorraha Testlari</h2>
          <p style={{ color: '#94a3b8', fontSize: 15, marginTop: 4 }}>
            2D simulyatorda javob tanlang va to'qnashuv hamda imtiyoz oqibatlarini animatsiyada kuzating.
          </p>
        </div>

        {/* Topic Filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Barcha Savollar' },
            { id: 'crossroads', label: 'Chorrahalar' },
            { id: 'yol_belgilari', label: "Yo'l belgilari" },
            { id: 'speed_limits', label: "Tezlik me'yorlari" },
            { id: 'overtaking', label: "Quvib o'tish" },
          ].map((top) => (
            <button
              key={top.id}
              className={`filter-btn ${activeTopic === top.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTopic(top.id);
                const first = scenarios.find((s) => top.id === 'all' || s.topic === top.id);
                if (first) setSelectedId(first.id);
              }}
            >
              {top.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Pills Selector */}
      <div className="scenarios-pill-bar">
        {filteredScenarios.map((sc, idx) => {
          const isSelected = selectedId === sc.id;
          const qText = sc.question?.[lang] || sc.question?.['uz'] || sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => setSelectedId(sc.id)}
              className={`sc-pill-btn ${isSelected ? 'active' : ''}`}
            >
              <span style={{ opacity: 0.7 }}>#{idx + 1}</span> {sc.id.toUpperCase()} — {qText}
            </button>
          );
        })}
      </div>

      {/* Main Scenario Player */}
      {currentScenario ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <ScenarioPlayer
            scenarioData={currentScenario}
            lang={lang}
            onAnswerSelected={(optionId) => {
              fetch('/api/progress/user-web/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenarioId: currentScenario.id, optionId }),
              }).catch((err) => console.error('Failed to record answer', err));
            }}
          />

          {/* Navigation Prev/Next Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn-secondary" onClick={handlePrev} disabled={currentIndex <= 0}>
              ← Oldingi Savol
            </button>

            <span style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>
              {currentIndex + 1} / {filteredScenarios.length} ta savol
            </span>

            <button className="btn-primary" onClick={handleNext} disabled={currentIndex >= filteredScenarios.length - 1}>
              Keyingi Savol →
            </button>
          </div>
        </div>
      ) : (
        <div className="meta-card" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          Ushbu mavzu bo'yicha ssenariylar mavjud emas.
        </div>
      )}
    </div>
  );
}
