import React, { Suspense, lazy, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ViewType, UserProfile } from './types';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { HomeView } from './views/HomeView';

const LessonsView = lazy(() => import('./views/LessonsView').then((m) => ({ default: m.LessonsView })));
const PracticeView = lazy(() => import('./views/PracticeView').then((m) => ({ default: m.PracticeView })));
const ExamView = lazy(() => import('./views/ExamView').then((m) => ({ default: m.ExamView })));
const AnalyticsView = lazy(() => import('./views/AnalyticsView').then((m) => ({ default: m.AnalyticsView })));
const AdminView = lazy(() => import('./views/AdminView').then((m) => ({ default: m.AdminView })));
const MobileView = lazy(() => import('./views/MobileView').then((m) => ({ default: m.MobileView })));

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-[#4cd7f6]/30 border-t-[#4cd7f6] animate-spin" />
  </div>
);

const VIEW_PATHS: Record<ViewType, string> = {
  home: '/',
  lessons: '/lessons',
  practice: '/practice',
  exam: '/exam',
  analytics: '/analytics',
  admin: '/admin',
  mobile: '/mobile',
};

const PATH_TO_VIEW: Record<string, ViewType> = Object.fromEntries(
  Object.entries(VIEW_PATHS).map(([view, path]) => [path, view as ViewType]),
);

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView: ViewType = PATH_TO_VIEW[location.pathname] ?? 'home';
  const onNavigate = (view: ViewType) => navigate(VIEW_PATHS[view]);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user: authUser, logout } = useAuth();

  const user: UserProfile = authUser
    ? {
        name: authUser.name,
        email: authUser.email || authUser.phone || '',
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

  const openAuth = () => setIsAuthOpen(true);

  return (
    <div className="min-h-screen bg-[#081425] text-[#d8e3fb] flex flex-col font-sans">
      <Header activeView={activeView} onNavigate={onNavigate} user={user} onOpenAuth={openAuth} />
      <main className="flex-grow">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomeView onNavigate={onNavigate} onOpenAuth={openAuth} />} />
            <Route path="/lessons" element={<LessonsView onNavigate={onNavigate} />} />
            <Route path="/practice" element={<PracticeView onNavigate={onNavigate} onOpenAuth={openAuth} />} />
            <Route path="/exam" element={<ExamView onNavigate={onNavigate} onOpenAuth={openAuth} />} />
            <Route path="/analytics" element={<AnalyticsView onNavigate={onNavigate} />} />
            <Route path="/admin" element={<AdminView />} />
            <Route path="/mobile" element={<MobileView />} />
            <Route path="*" element={<HomeView onNavigate={onNavigate} onOpenAuth={openAuth} />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} user={user} onLogout={logout} />
    </div>
  );
}

export default App;
