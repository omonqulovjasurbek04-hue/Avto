import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { LessonsPage } from './pages/LessonsPage';
import { PracticePage } from './pages/PracticePage';
import { ExamPage } from './pages/ExamPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function AppShell() {
  const [activeTab, setActiveTab] = useState('home');
  const { lang, setLang } = useApp();
  const { user, isAuthenticated, logout } = useAuth();

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
              { id: 'admin', label: '⚙️ Admin' },
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6' }}>
                  👤 {user?.name || user?.phone || user?.email || 'Foydalanuvchi'}
                </span>
                <button
                  className="btn-icon-sm danger"
                  onClick={() => { logout(); setActiveTab('home'); }}
                  title="Chiqish"
                >
                  🚪
                </button>
              </div>
            ) : (
              <button
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: 13 }}
                onClick={() => setActiveTab('login')}
              >
                🔑 Kirish
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'home' && <HomePage onNavigate={setActiveTab} lang={lang} />}
        {activeTab === 'lessons' && <LessonsPage onNavigate={setActiveTab} lang={lang} />}
        {activeTab === 'login' && <LoginPage onNavigate={setActiveTab} />}
        {activeTab === 'register' && <RegisterPage onNavigate={setActiveTab} />}

        {activeTab === 'practice' && (
          <ProtectedRoute onNavigate={setActiveTab}>
            <PracticePage lang={lang} />
          </ProtectedRoute>
        )}

        {activeTab === 'exam' && (
          <ProtectedRoute onNavigate={setActiveTab}>
            <ExamPage lang={lang} />
          </ProtectedRoute>
        )}

        {activeTab === 'analytics' && (
          <ProtectedRoute onNavigate={setActiveTab}>
            <AnalyticsPage />
          </ProtectedRoute>
        )}

        {activeTab === 'admin' && (
          <ProtectedRoute onNavigate={setActiveTab}>
            <AdminPage />
          </ProtectedRoute>
        )}
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
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </AppProvider>
  );
}
