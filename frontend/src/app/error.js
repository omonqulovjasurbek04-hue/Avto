'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fade-in">
      <div className="text-6xl font-extrabold font-heading text-gradient-purple">500</div>
      <h1 className="text-2xl font-bold font-heading text-slate-100">Xatolik yuz berdi</h1>
      <p className="text-slate-400 text-sm max-w-md text-center">
        {error?.message || 'Serverda kutilmagan xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.'}
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-semibold transition-all"
      >
        Qayta urinish
      </button>
    </div>
  );
}
