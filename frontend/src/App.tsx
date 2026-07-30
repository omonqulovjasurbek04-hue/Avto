import React, { useState } from 'react';
import { ViewType, UserProfile } from './types';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { HomeView } from './views/HomeView';
import { LessonsView } from './views/LessonsView';
import { PracticeView } from './views/PracticeView';
import { ExamView } from './views/ExamView';
import { AnalyticsView } from './views/AnalyticsView';
import { AdminView } from './views/AdminView';
import { MobileView } from './views/MobileView';

export function App() {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user: authUser, logout } = useAuth();

  const user: UserProfile = authUser
    ? {
        name: authUser.name,
        email: authUser.email || '',
        role: authUser.role,
        isLoggedIn: true,
        isPremium: false,
      }
    : {
        name: '',
        email: '',
        isLoggedIn: false,
        isPremium: false,
      };

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView onNavigate={setActiveView} onOpenAuth={() => setIsAuthOpen(true)} />;
      case 'lessons':
        return <LessonsView onNavigate={setActiveView} />;
      case 'practice':
        return <PracticeView onNavigate={setActiveView} onOpenAuth={() => setIsAuthOpen(true)} />;
      case 'exam':
        return <ExamView onNavigate={setActiveView} onOpenAuth={() => setIsAuthOpen(true)} />;
      case 'analytics':
        return <AnalyticsView onNavigate={setActiveView} />;
      case 'admin':
        return <AdminView />;
      case 'mobile':
        return <MobileView />;
      default:
        return <HomeView onNavigate={setActiveView} onOpenAuth={() => setIsAuthOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#081425] text-[#d8e3fb] flex flex-col font-sans">
      <Header
        activeView={activeView}
        onNavigate={setActiveView}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
      <main className="flex-grow">
        {renderView()}
      </main>
      <Footer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} user={user} onLogout={logout} />
    </div>
  );
}

export default App;
