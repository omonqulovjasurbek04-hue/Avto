import React, { useEffect, useState } from 'react';

export function AnalyticsPage() {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    fetch('/api/progress/user-web')
      .then((res) => res.json())
      .then((data) => setProgress(data))
      .catch((err) => console.error('Failed to load progress stats', err));
  }, []);

  const totalAnswers = (progress?.correct ?? 0) + (progress?.wrong ?? 0);
  const accuracy = totalAnswers > 0 ? Math.round((progress.correct / totalAnswers) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>Shaxsiy Statistika va O'zlashtirish</h2>

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        <div className="meta-card" style={{ padding: 20 }}>
          <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>Jami Yechilgan</div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4, color: '#3b82f6' }}>{totalAnswers}</div>
        </div>

        <div className="meta-card" style={{ padding: 20 }}>
          <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>To'g'ri Javoblar</div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4, color: '#10b981' }}>{progress?.correct ?? 0}</div>
        </div>

        <div className="meta-card" style={{ padding: 20 }}>
          <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>Xatolar</div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4, color: '#ef4444' }}>{progress?.wrong ?? 0}</div>
        </div>

        <div className="meta-card" style={{ padding: 20 }}>
          <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>Aniqlik Darajasi</div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4, color: '#f59e0b' }}>{accuracy}%</div>
        </div>
      </div>

      {/* Answers Log Table */}
      <div className="meta-card">
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Oxirgi Urinishlar Tarixi</h3>

        {progress?.answers && progress.answers.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #26334d', color: '#94a3b8' }}>
                <th style={{ padding: '10px 12px' }}>Ssenariy ID</th>
                <th style={{ padding: '10px 12px' }}>Tanlangan Javob</th>
                <th style={{ padding: '10px 12px' }}>Natija</th>
                <th style={{ padding: '10px 12px' }}>Vaqt</th>
              </tr>
            </thead>
            <tbody>
              {progress.answers.slice(-10).reverse().map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{item.scenarioId}</td>
                  <td style={{ padding: '12px' }}>{item.optionId}</td>
                  <td style={{ padding: '12px', color: item.correct ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                    {item.correct ? '✅ To\'g\'ri' : `💥 ${item.outcome || 'Xato'}`}
                  </td>
                  <td style={{ padding: '12px', color: '#64748b' }}>
                    {new Date(item.at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ color: '#94a3b8', padding: '20px 0' }}>Hali javoblar mavjud emas. Mashq bo'limiga o'ting!</div>
        )}
      </div>
    </div>
  );
}
