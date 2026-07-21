import React, { useState } from 'react';
import { PracticePage } from './pages/PracticePage';
import { ExamPage } from './pages/ExamPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('practice'); // 'practice' | 'exam' | 'analytics'
  const [lang, setLang] = useState('uz'); // 'uz' | 'ru' | 'en'

  return (
    <div className="app-container">
      {/* Header & Navbar */}
      <header className="header">
        <div className="header-content">
          <a href="#" className="brand">
            <div className="brand-icon">🚗</div>
            <div>
              <div className="brand-title">AVTO QOIDALAR</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Yo'l Harakati Qoidalari Interaktiv Platformasi</div>
            </div>
            <span className="brand-badge">2D Engine</span>
          </a>

          <nav className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'practice' ? 'active' : ''}`}
              onClick={() => setActiveTab('practice')}
            >
              📚 Mashqlar
            </button>

            <button
              className={`nav-tab ${activeTab === 'exam' ? 'active' : ''}`}
              onClick={() => setActiveTab('exam')}
            >
              📝 Imtihon Mode
            </button>

            <button
              className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Statistika
            </button>
          </nav>

          <div className="lang-switcher">
            {['uz', 'ru', 'en'].map((l) => (
              <button
                key={l}
                className={`lang-btn ${lang === l ? 'active' : ''}`}
                onClick={() => setLang(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="main-content">
        {activeTab === 'practice' && <PracticePage lang={lang} />}
        {activeTab === 'exam' && <ExamPage lang={lang} />}
        {activeTab === 'analytics' && <AnalyticsPage />}
      </main>
    </div>
  );
}
