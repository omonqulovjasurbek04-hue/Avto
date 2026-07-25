'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const PASS_THRESHOLD = 0.9;

export default function AnalyticsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { setLoading(false); return; }
    setLoading(true);
    api.getTestHistory().then((data) => {
      setHistory(data || []);
    }).catch((err) => {
      setError(err?.message || 'Statistikani yuklashda xatolik');
    }).finally(() => setLoading(false));
  }, [isAuthenticated, authLoading]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16 max-w-md mx-auto glass-panel p-8 rounded-3xl border border-slate-800">
        <div className="text-4xl mb-4">&#128274;</div>
        <h1 className="text-xl font-bold text-slate-100">Statistikani ko'rish uchun tizimga kiring</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gradient">📊 Natijalar va Statistika</h1>
        </div>
        <div className="p-6 rounded-2xl glass-card text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const totalScore = history.reduce((s, h) => s + (h.score || 0), 0);
  const totalQuestions = history.reduce((s, h) => s + (h._count?.answers || 0), 0);
  const passedCount = history.filter((h) => h.score != null && h.score >= Math.ceil((h._count?.answers || 1) * PASS_THRESHOLD)).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-gradient">&#128202; Natijalar va Statistika</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl glass-card text-center">
          <div className="text-xs text-slate-400 mb-1">Testlar soni</div>
          <div className="text-3xl font-bold font-heading text-blue-400">{history.length}</div>
        </div>
        <div className="p-6 rounded-2xl glass-card text-center">
          <div className="text-xs text-slate-400 mb-1">O'tgan</div>
          <div className="text-3xl font-bold font-heading text-emerald-400">{passedCount}</div>
        </div>
        <div className="p-6 rounded-2xl glass-card text-center">
          <div className="text-xs text-slate-400 mb-1">To'g'ri javoblar</div>
          <div className="text-3xl font-bold font-heading text-cyan-400">{totalScore}</div>
        </div>
        <div className="p-6 rounded-2xl glass-card text-center">
          <div className="text-xs text-slate-400 mb-1">Jami savollar</div>
          <div className="text-3xl font-bold font-heading text-amber-400">{totalQuestions}</div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold font-heading text-slate-200">&#128221; Testlar Tarixi</h2>
        {history.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl glass-panel border border-slate-800">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Sana</th>
                  <th className="p-4">Kategoriya</th>
                  <th className="p-4">Natija</th>
                  <th className="p-4">Ball</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-mono text-xs text-slate-400">{new Date(h.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">{h.category?.name?.uz || h.categoryId}</td>
                    <td className="p-4">
                      {h.score != null && h.score >= Math.ceil((h._count?.answers || 1) * 0.9) ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">O'tdi</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30">Yiqildi</span>
                      )}
                    </td>
                    <td className="p-4 font-bold font-mono">{h.score ?? '?'} / {h._count?.answers || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 rounded-2xl glass-card text-center text-slate-400">Hali test topshirilmadi</div>
        )}
      </div>
    </div>
  );
}
