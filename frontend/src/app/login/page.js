'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace('/practice');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/practice');
    } catch (err) {
      setError(err?.message || String(err) || 'Kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center py-8 animate-fade-in">
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel border border-blue-500/20 shadow-glow-blue space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl">
            🔑
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-100">
            Tizimga Kirish
          </h1>
          <p className="text-xs text-slate-400">
            Akkauntingizga kirib, progress va natijalaringizni saqlang
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Manzil:
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Parol:
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-blue"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-sm shadow-glow-blue disabled:opacity-50 transition-all"
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Akkauntingiz yo'qmi?{' '}
          <Link href="/register" className="text-brand-cyan hover:underline font-semibold">
            Ro'yxatdan o'ting
          </Link>
        </div>
      </div>
    </div>
  );
}
