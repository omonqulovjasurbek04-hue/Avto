import React from 'react';

export function HomePage({ onNavigate, lang }) {
  const translations = {
    uz: {
      heroBadge: "⚡ 2D Deterministic Scene Engine",
      heroTitle: "Yo'l Harakati Qoidalarini Interaktiv Animatsiyalarda O'rganing",
      heroDesc: "Savollarga javob bering, natijani haqiqiy vaqt rejimida animatsion simulyatsiya orqali ko'ring. Xatolarni bartaraf eting va haydovchilik imtihoniga 100% tayyorlaning!",
      startPractice: "📚 Mashqlarni Boshlash",
      startExam: "📝 Rasmiy Imtihon",
      readLessons: "📖 Nazariy Darsliklar",
      statsScenarios: "Interaktiv Ssenariylar",
      statsLessons: "YHQ Nazariy Darsliklar",
      statsPass: "O'tish Ko'rsatkichi",
      statsEngine: "Vizual Simulyatsiya",
      featuresTitle: "Platforma Imkoniyatlari",
      adminPanel: "⚙️ Admin Paneli",
      analytics: "📊 Statistika & Analitika"
    },
    ru: {
      heroBadge: "⚡ 2D Deterministic Scene Engine",
      heroTitle: "Изучайте ПДД Узбекистана в 2D Анимациях",
      heroDesc: "Отвечайте на вопросы, смотрите симуляцию в реальном времени. Устраняйте ошибки и готовьтесь к экзамену!",
      startPractice: "📚 Начать Практику",
      startExam: "📝 Официальный Экзамен",
      readLessons: "📖 Теоретические Уроки",
      statsScenarios: "Интерактивных Сценариев",
      statsLessons: "Уроков ПДД",
      statsPass: "Процент Успеха",
      statsEngine: "Визуальный Движок",
      featuresTitle: "Возможности Платформы",
      adminPanel: "⚙️ Админ Панель",
      analytics: "📊 Статистика"
    },
    en: {
      heroBadge: "⚡ 2D Deterministic Scene Engine",
      heroTitle: "Master Traffic Rules with Interactive 2D Animations",
      heroDesc: "Answer questions, watch real-time simulated consequences, compare outcomes, and pass your driving test effortlessly!",
      startPractice: "📚 Start Practice",
      startExam: "📝 Take Exam",
      readLessons: "📖 Theory Lessons",
      statsScenarios: "Interactive Scenarios",
      statsLessons: "Theory Lessons",
      statsPass: "Exam Pass Rate",
      statsEngine: "Visual Engine",
      featuresTitle: "Platform Capabilities",
      adminPanel: "⚙️ Admin Portal",
      analytics: "📊 Analytics"
    }
  };

  const t = translations[lang] || translations.uz;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Hero Banner Section */}
      <section className="hero-banner">
        <div className="hero-badge">{t.heroBadge}</div>
        <h1 className="hero-title">{t.heroTitle}</h1>
        <p className="hero-desc">{t.heroDesc}</p>
        
        <div className="hero-actions">
          <button className="btn-primary-lg" onClick={() => onNavigate('practice')}>
            {t.startPractice}
          </button>
          <button className="btn-secondary-lg" onClick={() => onNavigate('lessons')}>
            {t.readLessons}
          </button>
          <button className="btn-outline-lg" onClick={() => onNavigate('exam')}>
            {t.startExam}
          </button>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#3b82f6' }}>1200+</div>
          <div className="stat-label">{t.statsScenarios}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>15+</div>
          <div className="stat-label">{t.statsLessons}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>94%</div>
          <div className="stat-label">{t.statsPass}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#8b5cf6' }}>60 FPS</div>
          <div className="stat-label">{t.statsEngine}</div>
        </div>
      </section>

      {/* Main Feature Cards Grid */}
      <section>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>{t.featuresTitle}</h2>
        
        <div className="features-grid">
          {/* Practice Feature */}
          <div className="feature-card" onClick={() => onNavigate('practice')}>
            <div className="feature-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>🚦</div>
            <h3 className="feature-title">2D Interaktiv Chorrahalar</h3>
            <p className="feature-desc">
              Har bir tanlangan javob uchun transport vositalari harakati, to'qnashuv va imtiyozlar jonli animatsiya qilib beriladi.
            </p>
            <div className="feature-link">Mashq qilish →</div>
          </div>

          {/* Lessons Feature */}
          <div className="feature-card" onClick={() => onNavigate('lessons')}>
            <div className="feature-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>📖</div>
            <h3 className="feature-title">YHQ Nazariy Darsliklar</h3>
            <p className="feature-desc">
              Yo'l belgilari, tezlik me'yorlari, chorrahalar va quvib o'tish qoidalari bo'yicha mukammal nazariy qo'llanma.
            </p>
            <div className="feature-link" style={{ color: '#10b981' }}>Darsliklarni o'qish →</div>
          </div>

          {/* Exam Feature */}
          <div className="feature-card" onClick={() => onNavigate('exam')}>
            <div className="feature-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>📝</div>
            <h3 className="feature-title">Rasmiy Imtihon Simulyatori</h3>
            <p className="feature-desc">
              20 savol va 20 daqiqalik vaqt taymeri bilan haydovchilik guvohnomasi imtihonining aniq nusxasi.
            </p>
            <div className="feature-link" style={{ color: '#f59e0b' }}>Imtihon topshirish →</div>
          </div>

          {/* Analytics Feature */}
          <div className="feature-card" onClick={() => onNavigate('analytics')}>
            <div className="feature-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>📊</div>
            <h3 className="feature-title">Intellektual Analitika</h3>
            <p className="feature-desc">
              O'zlashtirish darajasi, xatolar tahlili va shaxsiy test natijalaringiz tarixingizni kuzatib boring.
            </p>
            <div className="feature-link" style={{ color: '#8b5cf6' }}>Statistikani ko'rish →</div>
          </div>

          {/* Admin Portal Feature */}
          <div className="feature-card" onClick={() => onNavigate('admin')}>
            <div className="feature-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>⚙️</div>
            <h3 className="feature-title">Admin Boshqaruv Paneli</h3>
            <p className="feature-desc">
              Ssenariylar, savollar va darsliklarni tahrirlash hamda engine validator holatini nazorat qilish.
            </p>
            <div className="feature-link" style={{ color: '#ef4444' }}>Admin Panelga o'tish →</div>
          </div>
        </div>
      </section>

      {/* Quick Topic Shortcuts */}
      <section className="topics-section">
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Asosiy Mavzular Boyicha Tezkor Mashq</h2>
        <div className="topic-pills">
          <div className="topic-pill" onClick={() => onNavigate('practice')}>🚦 Chorrahalardan o'tish</div>
          <div className="topic-pill" onClick={() => onNavigate('practice')}>🛑 Yo'l belgilari va chiziqlari</div>
          <div className="topic-pill" onClick={() => onNavigate('practice')}>⚡ Harakatlanish tezligi</div>
          <div className="topic-pill" onClick={() => onNavigate('practice')}>🏎️ Quvib o'tish va to'xtash</div>
        </div>
      </section>
    </div>
  );
}
