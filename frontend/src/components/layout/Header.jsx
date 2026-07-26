'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../LanguageSwitcher';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-bg-darkest/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-blue to-cyan-500 flex items-center justify-center text-white text-lg font-extrabold shadow-glow-blue group-hover:shadow-glow-primary-intense transition-shadow duration-300">
              A
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-brand-blue/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </div>
          <span className="font-bold text-xl text-slate-100 font-heading group-hover:text-gradient transition-all duration-300">
            Avto Qoidalar
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          {/* Main nav links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '/practice', label: 'Mashq', icon: '🚗' },
              { href: '/lessons', label: 'Darslar', icon: '📚' },
              { href: '/exam', label: 'Imtihon', icon: '📋' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative px-4 py-2 rounded-xl text-slate-300 hover:text-slate-100 transition-all duration-200 font-medium"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm group-hover:scale-110 transition-transform duration-200">
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </div>
                
                {/* Hover background */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-blue/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
              </Link>
            ))}
          </div>

          {/* Auth & User section */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/analytics" 
                  className="hidden sm:block px-3 py-1.5 rounded-lg text-slate-300 hover:text-slate-100 text-sm font-medium transition-colors"
                >
                  Natijalar
                </Link>
                
                {user?.role === 'ADMIN' && (
                  <Link 
                    href="/admin" 
                    className="hidden sm:block px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <div className="text-xs text-slate-400">Salom,</div>
                    <div className="text-sm font-medium text-slate-200">
                      {user?.name || user?.email?.split('@')[0] || 'User'}
                    </div>
                  </div>
                  
                  <button 
                    onClick={logout} 
                    className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-slate-100 text-sm font-semibold transition-all duration-200 border border-slate-700/50 hover:border-slate-600/50"
                  >
                    Chiqish
                  </button>
                </div>
              </>
            ) : (
              <Link 
                href="/login" 
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-bold shadow-glow-blue hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Kirish
              </Link>
            )}

            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
