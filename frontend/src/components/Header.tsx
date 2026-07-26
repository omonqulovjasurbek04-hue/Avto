import React, { useState } from 'react';
import { ViewType, UserProfile } from '../types';
import { User, Menu, X, ShieldCheck, Zap } from 'lucide-react';

interface HeaderProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  user: UserProfile;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  user,
  onOpenAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ViewType; label: string }[] = [
    { id: 'home', label: 'Bosh sahifa' },
    { id: 'lessons', label: 'Darslar' },
    { id: 'practice', label: 'Testlar' },
    { id: 'exam', label: 'Imtihon' },
    { id: 'analytics', label: 'Tahlil' },
    { id: 'admin', label: 'Admin Panel' },
    { id: 'mobile', label: 'Mobil App' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#152031]/70 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(173,198,255,0.08)]">
      <div className="flex justify-between items-center px-4 md:px-10 h-20 w-full max-w-7xl mx-auto">
        {/* AVTO Logo */}
        <button 
          onClick={() => onNavigate('home')} 
          className="font-display text-3xl md:text-4xl font-extrabold tracking-tighter text-[#adc6ff] hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span>AVTO</span>
          <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20 font-sans font-bold">
            YHQ
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`font-medium transition-all duration-200 py-1 relative text-base ${
                  isActive
                    ? 'text-[#adc6ff] font-bold'
                    : 'text-[#c2c6d6] hover:text-[#4cd7f6]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#adc6ff] rounded-full shadow-[0_0_8px_#adc6ff]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-3">
          {user.isLoggedIn ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1f2a3c] border border-[#4cd7f6]/30 text-sm font-medium hover:border-[#4cd7f6] transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-[#4cd7f6]/20 text-[#4cd7f6] flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0)}
              </div>
              <span className="hidden sm:inline font-semibold text-xs text-[#d8e3fb]">
                {user.name}
              </span>
              {user.isPremium && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                  PRO
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="p-2 rounded-xl text-[#adc6ff] hover:text-[#4cd7f6] hover:bg-white/5 transition-all flex items-center gap-2 text-sm font-semibold"
              title="Tizimga kirish"
            >
              <User className="w-6 h-6" />
              <span className="hidden sm:inline">Tizimga kirish</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#d8e3fb] hover:text-[#4cd7f6] md:hidden"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#081425]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 space-y-4">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-lg font-semibold py-2 px-4 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/30'
                      : 'text-[#c2c6d6] hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
