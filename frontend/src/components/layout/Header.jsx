'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../LanguageSwitcher';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-bg-darkest/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-100">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue to-cyan-500 flex items-center justify-center text-white text-sm font-extrabold">A</span>
          Avto Qoidalar
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/practice" className="text-slate-300 hover:text-slate-100 transition-colors">Mashq</Link>
          <Link href="/lessons" className="text-slate-300 hover:text-slate-100 transition-colors">Darslar</Link>
          <Link href="/exam" className="text-slate-300 hover:text-slate-100 transition-colors">Imtihon</Link>
          {isAuthenticated ? (
            <>
              <Link href="/analytics" className="text-slate-300 hover:text-slate-100 transition-colors">Natijalar</Link>
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="text-slate-300 hover:text-slate-100 transition-colors">Admin</Link>
              )}
              <button onClick={logout} className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-colors">
                Chiqish
              </button>
            </>
          ) : (
            <Link href="/login" className="px-4 py-1.5 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-blue-600 transition-colors">Kirish</Link>
          )}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
