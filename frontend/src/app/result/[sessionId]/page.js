'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import ResultCard from '../../../components/ResultCard';

const PASS_THRESHOLD = 0.9;

function safeNum(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let retries = 0;
    const maxRetries = 5;

    async function fetchSession() {
      try {
        const history = await api.getTestHistory();
        const s = history.find((h) => h.id === sessionId);
        if (s) { setSession(s); setLoading(false); return; }
        if (retries < maxRetries) {
          retries++;
          setTimeout(fetchSession, 600);
        } else {
          setError('Natijalarni yuklashda xatolik.');
          setLoading(false);
        }
      } catch (err) {
        if (retries < maxRetries) {
          retries++;
          setTimeout(fetchSession, 600);
        } else {
          setError(err?.message || 'Natijalarni yuklashda xatolik');
          setLoading(false);
        }
      }
    }
    fetchSession();
  }, [sessionId]);

  const score = safeNum(session?.score ?? searchParams.get('score'), 0);
  const total = Math.max(1, safeNum(session?._count?.answers ?? searchParams.get('total'), 1));
  const passed = session?.score != null
    ? session.score >= Math.ceil((session._count?.answers || 1) * PASS_THRESHOLD)
    : searchParams.get('passed') === 'true';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-4xl">⚠️</div>
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={() => router.push('/exam')} className="px-6 py-3 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-semibold">
          Imtihonlarga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResultCard score={score} total={total} passed={passed} />

      <div className="flex gap-4 justify-center">
        <button onClick={() => router.push('/exam')} className="px-6 py-3 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-semibold">
          Qayta sinash
        </button>
        <button onClick={() => router.push('/practice')} className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700">
          Mashq qilish
        </button>
      </div>
    </div>
  );
}
