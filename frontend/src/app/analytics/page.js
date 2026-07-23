'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [examHistory, setExamHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    Promise.all([
      api.getProgressStats().catch(() => null),
      api.getExamHistory().catch(() => []),
    ]).then(([statsData, historyData]) => {
      setStats(statsData);
      setExamHistory(historyData || []);
      setLoading(false);
    });
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16 max-w-md mx-auto space-y-4 glass-panel p-8 rounded-3xl border border-slate-800">
        <div className="text-4xl">🔒</div>
        <h1 className="text-xl font-bold font-heading text-slate-100">
          Statistikani Ko'rish Uchun Tizimga Kiring
        </h1>
        <p className="text-sm text-slate-400">
          Shaxsiy ko'rsatkichlaringiz, yechilgan savollar va imtihon tarixini kuzatish uchun akkauntingizga kiring.
        </p>
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

  const accuracy = stats?.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-gradient">
          📊 Natijalar va Statistika
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          O'zlashtirish darajangiz va o'tgan imtihonlar tarixi
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl glass-card text-center">
          <div className="text-xs text-slate-400 mb-1">Jami Savollar:</div>
          <div className="text-3xl font-bold font-heading text-blue-400">
            {stats?.total || 0}
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-card text-center">
          <div className="text-xs text-slate-400 mb-1">To'g'ri Javoblar:</div>
          <div className="text-3xl font-bold font-heading text-emerald-400">
            {stats?.correct || 0}
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-card text-center">
          <div className="text-xs text-slate-400 mb-1">Xatolar:</div>
          <div className="text-3xl font-bold font-heading text-rose-400">
            {stats?.wrong || 0}
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-card text-center">
          <div className="text-xs text-slate-400 mb-1">Aniqlik:</div>
          <div className="text-3xl font-bold font-heading text-cyan-400">
            {accuracy}%
          </div>
        </div>
      </div>

      {/* Exam History Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-heading text-slate-200">
          📝 Oxirgi Imtihonlar Tarixi
        </h2>

        {examHistory.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl glass-panel border border-slate-800">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Sana</th>
                  <th className="p-4">Natija</th>
                  <th className="p-4">Ball</th>
                  <th className="p-4">Vaqt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {examHistory.map((exam, idx) => (
                  <tr key={exam.id || idx} className="hover:bg-slate-800/40">
                    <td className="p-4 font-mono text-xs text-slate-400">
                      {new Date(exam.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {exam.passed ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                          ✅ O'tdi
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30">
                          ❌ Yiqildi
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-bold font-mono">
                      {exam.score} / {exam.total}
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-400">
                      {Math.floor((exam.durationSeconds || 0) / 60)} min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 rounded-2xl glass-card text-center text-slate-400">
            Hali imtihon topshirilmadi
          </div>
        )}
      </div>
    </div>
  );
}
