'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace('/practice');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Parollar bir-biriga mos kelmadi');
      return;
    }
    setLoading(true);

    try {
      await register(email, password, name);
      router.push('/practice');
    } catch (err) {
      setError(err?.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[650px] flex items-center justify-center py-12 animate-fade-in">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="p-10 rounded-3xl glass-panel border border-cyan-500/20 shadow-glow-cyan space-y-8 backdrop-blur-20">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-cyan-500/30 to-brand-blue/30 border border-cyan-500/30 flex items-center justify-center text-3xl animate-pulse">
              👤
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading text-gradient mb-2">
                Ro'yxatdan O'tish
              </h1>
              <p className="text-sm text-slate-400">
                Yangi akkaunt yarating va ta'limni boshlang
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 shadow-glow-red animate-slide-up">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Ismingiz
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jasur Omonqulov"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-cyan focus:shadow-glow-cyan transition-all duration-200 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Email Manzil
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-cyan focus:shadow-glow-cyan transition-all duration-200 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Parol (kamida 8 ta belgi)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-cyan focus:shadow-glow-cyan transition-all duration-200 backdrop-blur-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Parolni tasdiqlang
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-cyan focus:shadow-glow-cyan transition-all duration-200 backdrop-blur-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-cyan to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-base shadow-glow-cyan disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Yaratilmoqda...</span>
                </div>
              ) : (
                'Hisob Yaratish'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-slate-400 pt-4 border-t border-slate-800/50">
            Akkauntingiz bormi?{' '}
            <Link 
              href="/login" 
              className="text-brand-blue hover:text-blue-300 font-semibold hover:underline transition-colors duration-200"
            >
              Tizimga kiring
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
