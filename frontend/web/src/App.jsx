import React, { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { LessonsPage } from './pages/LessonsPage';
import { PracticePage } from './pages/PracticePage';
import { ExamPage } from './pages/ExamPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'lessons' | 'practice' | 'exam' | 'analytics' | 'admin'
  const [lang, setLang] = useState('uz'); // 'uz' | 'ru' | 'en'

  return (
    <div className="app-container">
      {/* Header & Navbar */}
      <header className="header">
        <div className="header-content">
          <a
            href="#"
            className="brand"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('home');
            }}
          >
            <div className="brand-icon">🚗</div>
            <div>
              <div className="brand-title">AVTO QOIDALAR</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Yo'l Harakati Qoidalari Interaktiv Platformasi</div>
            </div>
            <span className="brand-badge">2D Engine</span>
          </a>

          <nav className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              🏠 Bosh Sahifa
            </button>

            <button
              className={`nav-tab ${activeTab === 'lessons' ? 'active' : ''}`}
              onClick={() => setActiveTab('lessons')}
            >
              📖 Darsliklar
            </button>

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
              📝 Imtihon
            </button>

            <button
              className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📊 Statistika
            </button>

            <button
              className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              ⚙️ Admin Panel
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
        {activeTab === 'home' && <HomePage onNavigate={(tab) => setActiveTab(tab)} lang={lang} />}
        {activeTab === 'lessons' && <LessonsPage onNavigate={(tab) => setActiveTab(tab)} lang={lang} />}
        {activeTab === 'practice' && <PracticePage lang={lang} />}
        {activeTab === 'exam' && <ExamPage lang={lang} />}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'admin' && <AdminPage />}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div>
            <strong>AVTO QOIDALAR</strong> — Deterministic 2D Traffic Simulation & Exam Simulator Platform
          </div>
          <div style={{ color: '#64748b', fontSize: 13 }}>
            © 2026 Yo'l Harakati Qoidalari (YHQ). Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>
    </div>
  );
}
