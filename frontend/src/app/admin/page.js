'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      setLoading(false);
      return;
    }

    Promise.all([
      api.getAdminStats().catch(() => null),
      api.validateContent().catch(() => null),
    ]).then(([statsData, valData]) => {
      setStats(statsData);
      setValidation(valData);
      setLoading(false);
    });
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-16 max-w-md mx-auto space-y-4 glass-panel p-8 rounded-3xl border border-slate-800">
        <div className="text-4xl">⚙️</div>
        <h1 className="text-xl font-bold font-heading text-slate-100">
          Admin Ruxsati Talab Qilinadi
        </h1>
        <p className="text-sm text-slate-400">
          Ushbu sahifaga kirish uchun admin huquqlariga ega akkaunt bilan tizimga kiring.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-amber border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-gradient">
          ⚙️ Admin Boshqaruv Paneli
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Tizim statistikasi va kontent (ssenariy/darsliklar) validatsiyasi
        </p>
      </div>

      {/* System Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl glass-card text-center">
          <div className="text-xs text-slate-400 mb-1">Ssenariylar:</div>
          <div className="text-3xl font-bold font-heading text-blue-400">
            {stats?.scenariosCount || 0}
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-card text-center">
          <div className="text-xs text-slate-400 mb-1">Darsliklar:</div>
          <div className="text-3xl font-bold font-heading text-purple-400">
            {stats?.lessonsCount || 0}
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-card text-center">
          <div className="text-xs text-slate-400 mb-1">Foydalanuvchilar:</div>
          <div className="text-3xl font-bold font-heading text-emerald-400">
            {stats?.usersCount || 0}
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-card text-center">
          <div className="text-xs text-slate-400 mb-1">Engine Versiyasi:</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
            v{stats?.engineVersion || '1.0.0'}
          </div>
        </div>
      </div>

      {/* Content Validator Status */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-heading text-slate-200">
          🔍 Ssenariylar Validatsiyasi
        </h2>

        {validation ? (
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="text-emerald-400 font-bold">
                ✅ Yaroqli: {validation.valid} / {validation.total}
              </span>
              {validation.warnings > 0 && (
                <span className="text-amber-400 font-bold">
                  ⚠️ Ogohlantirishlar: {validation.warnings}
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {validation.scenarios?.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-slate-300">{item.id}</span>
                  <span className="text-slate-400">Options: {item.optionCount}</span>
                  {item.valid ? (
                    <span className="text-emerald-400 font-semibold">VALID</span>
                  ) : (
                    <span className="text-rose-400 font-semibold">INVALID</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl glass-card text-center text-slate-400">
            Validatsiya ma'lumotlari topilmadi
          </div>
        )}
      </div>
    </div>
  );
}
