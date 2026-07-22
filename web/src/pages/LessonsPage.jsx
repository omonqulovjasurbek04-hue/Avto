import React, { useEffect, useState } from 'react';

export function LessonsPage({ onNavigate, lang = 'uz' }) {
  const [lessons, setLessons] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lessons')
      .then((res) => res.json())
      .then((data) => {
        setLessons(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
          setActiveLesson(data[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load lessons", err);
        setLoading(false);
      });
  }, []);

  const handleSelectLesson = (id) => {
    setSelectedId(id);
    const found = lessons.find((l) => l.id === id);
    if (found) setActiveLesson(found);
  };

  if (loading) {
    return <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Darsliklar yuklanmoqda...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 26, fontWeight: 700 }}>📖 Yo'l Harakati Qoidalari Darsliklari</h2>
        <p style={{ color: '#94a3b8', fontSize: 15, marginTop: 4 }}>
          Haydovchilik guvohnomasi imtihoni va xavfsiz haydash uchun mukammal nazariy qo'llanma.
        </p>
      </div>

      <div className="lessons-container">
        {/* Lessons Sidebar Navigation */}
        <div className="lessons-sidebar">
          {lessons.map((lesson) => {
            const isSelected = selectedId === lesson.id;
            return (
              <div
                key={lesson.id}
                className={`lesson-item-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectLesson(lesson.id)}
              >
                <div className="lesson-item-icon">{lesson.icon || '📚'}</div>
                <div style={{ flex: 1 }}>
                  <div className="lesson-item-title">{lesson.title}</div>
                  <div className="lesson-item-meta">
                    <span>⏱️ {lesson.readTime || '10 min'}</span>
                    <span>• {lesson.ruleCode || 'YHQ'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Lesson Viewer Pane */}
        <div className="lesson-detail-pane">
          {activeLesson ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="lesson-header-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="topic-tag">{activeLesson.topic?.replace(/_/g, ' ')}</span>
                  <span className="rule-badge">{activeLesson.ruleCode}</span>
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', marginTop: 12 }}>
                  {activeLesson.title}
                </h1>
                <p style={{ color: '#94a3b8', fontSize: 15, marginTop: 8, lineHeight: 1.6 }}>
                  {activeLesson.description}
                </p>
              </div>

              {/* Sections */}
              {activeLesson.sections?.map((sec, idx) => (
                <div key={idx} className="meta-card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6', marginBottom: 10 }}>
                    {idx + 1}. {sec.heading}
                  </h3>
                  <p style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.7 }}>
                    {sec.content}
                  </p>

                  {sec.signs && sec.signs.length > 0 && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Tegishli Yo'l Belgilari:</span>
                      {sec.signs.map((signCode) => (
                        <span key={signCode} className="sign-badge">
                          🛑 {signCode}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Bottom Action CTA */}
              <div className="lesson-cta-card">
                <div>
                  <h4 style={{ fontSize: 18, fontWeight: 700 }}>Ushbu darslik bo'yicha bilimingizni sinab ko'ring!</h4>
                  <p style={{ color: '#94a3b8', fontSize: 14 }}>Interaktiv 2D chorraha va testlarni darhol bajaring.</p>
                </div>
                <button className="btn-primary" onClick={() => onNavigate('practice')}>
                  Testlarni Ishlash →
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Darslik tanlanmadi.</div>
          )}
        </div>
      </div>
    </div>
  );
}
