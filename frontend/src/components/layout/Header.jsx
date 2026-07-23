'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, setLang } = useApp();

  const navItems = [
    { href: '/', label: '🏠 Bosh Sahifa' },
    { href: '/lessons', label: '📖 Darsliklar' },
    { href: '/practice', label: '📚 Mashqlar' },
    { href: '/exam', label: '📝 Imtihon' },
    { href: '/analytics', label: '📊 Statistika' },
    { href: '/admin', label: '⚙️ Admin' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xl shadow-glow-blue group-hover:scale-105 transition-transform">
            🚗
          </div>
          <div>
            <div className="font-heading font-extrabold text-base tracking-wide text-gradient">
              AVTO QOIDALAR
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              2D Simulyatsiya Platformasi
            </div>
          </div>
        </Link>

        {/* Desktop Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-glow-blue'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile & Language switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900/60 p-1 rounded-lg border border-slate-800">
            {['uz', 'ru', 'en'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-0.5 text-xs font-mono rounded uppercase transition-all ${
                  lang === l
                    ? 'bg-brand-cyan text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 max-w-[120px] truncate">
                👤 {user?.name || user?.email?.split('@')[0] || 'User'}
              </span>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-all"
                title="Chiqish"
              >
                🚪
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-lg bg-brand-blue hover:bg-blue-600 text-white font-medium text-xs shadow-glow-blue transition-all"
            >
              🔑 Kirish
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
