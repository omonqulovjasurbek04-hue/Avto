'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-16 py-4 animate-fade-in">
      <section className="relative rounded-3xl p-8 md:p-14 overflow-hidden glass-panel border border-blue-500/20 shadow-glow-blue flex flex-col items-center text-center">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <span>&#9889; YHQ Interaktiv Ta'lim Platformasi</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight max-w-3xl leading-tight">
          Yo'l Harakati Qoidalarini <br />
          <span className="text-gradient">Interaktiv Video</span> Bilan O'rganing
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed">
          Har bir savolga vizual video javob bilan YHQ ni amaliy o'rganing. To'g'ri va noto'g'ri holatlarni real tarzda ko'ring.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/practice" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-base shadow-glow-blue hover:scale-105 active:scale-95 transition-all">
            &#128640; Mashqlarni Boshlash
          </Link>
          <Link href="/exam" className="px-8 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-base border border-slate-700 hover:border-slate-600 hover:scale-105 active:scale-95 transition-all">
            &#128221; Imtihon Topshirish
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '&#128663;', label: 'Video savollar', count: '20+' },
          { icon: '&#128218;', label: 'YHQ Mavzulari', count: '13 ta' },
          { icon: '&#127919;', label: "O'tish bali", count: '90%' },
          { icon: '&#128250;', label: 'Video format', count: 'HD' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl glass-card text-center hover:scale-[1.02] transition-transform">
            <div className="text-3xl mb-2" dangerouslySetInnerHTML={{ __html: stat.icon }} />
            <div className="text-2xl md:text-3xl font-extrabold font-heading text-gradient">{stat.count}</div>
            <div className="text-xs font-medium text-slate-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
