'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function ExamPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState('');
  const [startError, setStartError] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    setCatLoading(true);
    api.listCategories().then((data) => {
      setCategories(data || []);
    }).catch((err) => {
      setCatError(err?.message || 'Kategoriyalarni yuklashda xatolik');
    }).finally(() => setCatLoading(false));
  }, []);

  const handleStart = async (cat) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setStartError('');
    setStarting(true);
    try {
      const session = await api.startTest(cat.id);
      router.push(`/test/${session.id}?catId=${session.categoryId}`);
    } catch (err) {
      setStartError(err?.message || 'Imtihonni boshlashda xatolik');
      setStarting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold font-heading">Imtihon</h1>
        <p className="text-slate-400">Kategoriya tanlang va imtihonni boshlang</p>
      </div>

      {catLoading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {catError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{catError}</div>
      )}

      {startError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{startError}</div>
      )}

      {!catLoading && !catError && categories.length === 0 && (
        <p className="text-slate-500 text-center py-8">Hozircha imtihon kategoriyalari mavjud emas.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleStart(cat)}
            disabled={starting}
            className="p-6 rounded-2xl glass-card text-left hover:border-brand-purple/40 transition-all disabled:opacity-50"
          >
            <h3 className="text-lg font-bold text-slate-100">{typeof cat.name === 'object' ? (cat.name.uz || cat.name.en || cat.slug) : cat.name}</h3>
            <p className="text-sm text-slate-400 mt-1">{cat._count?.questions || 0} ta savol</p>
            {starting && <p className="text-xs text-purple-400 mt-2">Imtihon boshlanmoqda...</p>}
          </button>
        ))}
      </div>
    </div>
  );
}
