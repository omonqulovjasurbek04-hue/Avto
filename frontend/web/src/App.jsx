import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HomePage } from './pages/HomePage';
import { LessonsPage } from './pages/LessonsPage';
import { PracticePage } from './pages/PracticePage';
import { ExamPage } from './pages/ExamPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminPage } from './pages/AdminPage';

function AppShell() {
  const [activeTab, setActiveTab] = useState('home');
  const { lang, setLang } = useApp();

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <a
            href="#"
            className="brand"
            onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}
          >
            <div className="brand-icon">🚗</div>
            <div>
              <div className="brand-title">AVTO QOIDALAR</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                Yo'l Harakati Qoidalari Interaktiv Platformasi
              </div>
            </div>
            <span className="brand-badge">2D Engine</span>
          </a>

          <nav className="nav-tabs">
            {[
              { id: 'home', label: '🏠 Bosh Sahifa' },
              { id: 'lessons', label: '📖 Darsliklar' },
              { id: 'practice', label: '📚 Mashqlar' },
              { id: 'exam', label: '📝 Imtihon' },
              { id: 'analytics', label: '📊 Statistika' },
              { id: 'admin', label: '⚙️ Admin Panel' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
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

      <main className="main-content">
        {activeTab === 'home' && <HomePage onNavigate={setActiveTab} lang={lang} />}
        {activeTab === 'lessons' && <LessonsPage onNavigate={setActiveTab} lang={lang} />}
        {activeTab === 'practice' && <PracticePage lang={lang} />}
        {activeTab === 'exam' && <ExamPage lang={lang} />}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'admin' && <AdminPage />}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div>
            <strong>AVTO QOIDALAR</strong> — Deterministic 2D Traffic Simulation
          </div>
          <div style={{ color: '#64748b', fontSize: 13 }}>
            © 2026 Yo'l Harakati Qoidalari (YHQ). Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
