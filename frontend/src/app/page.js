'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-16 py-4 animate-fade-in">
      {/* Hero Section */}
      <section className="relative rounded-3xl p-8 md:p-14 overflow-hidden glass-panel border border-blue-500/20 shadow-glow-blue flex flex-col items-center text-center">
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <span>⚡ YHQ Interaktiv Ta'lim Platformasi</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight max-w-3xl leading-tight">
          Yo'l Harakati Qoidalarini <br />
          <span className="text-gradient">Jonli 2D Simulyatsiya</span> Bilan O'rganing
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed">
          Nega shunchaki savollarni yodlash kerak? Chorrahada harakatlanishni real vaqtda mashinalar harakati, to'qnashuv va qoida buzilishi simulyatsiyasi orqali tushunib o'rganing.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/practice"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-base shadow-glow-blue hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>🚀 Mashqlarni Boshlash</span>
          </Link>

          <Link
            href="/exam"
            className="px-8 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-base border border-slate-700 hover:border-slate-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>📝 Imtihon Topshirish</span>
          </Link>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '🚗', label: '2D Ssenariylar', count: '20+' },
          { icon: '📚', label: 'YHQ Mavzulari', count: '13 ta' },
          { icon: '🎯', label: 'O\'tish Ko\'rsatkich', count: '90%' },
          { icon: '⚡', label: 'Real-time Engine', count: '60 FPS' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl glass-card text-center hover:scale-[1.02] transition-transform">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl md:text-3xl font-extrabold font-heading text-gradient">
              {stat.count}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Feature Cards Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold font-heading">
            Nega Avto Qoidalar Platformasi?
          </h2>
          <p className="text-sm text-slate-400">
            Oddiy testlardan farqli o'laroq edutainment usulida ta'lim oling
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '🎮',
              title: 'Jonli 2D Animatsiya',
              desc: 'Har bir javobingiz chorrahada real-time harakat yaratadi. To\'g\'ri javobda xavfsiz o\'tish, xatoda esa to\'qnashuv vizual ko\'rsatiladi.',
            },
            {
              icon: '📜',
              title: 'Rasmiy YHQ Bandlari',
              desc: 'Har bir vaziyat rasmiy Yo\'l Harakati Qoidalarining aniq moddalari va huquqiy tushuntirishlari bilan ta\'minlangan.',
            },
            {
              icon: '🏆',
              title: 'Davlat Imtihon Formati',
              desc: '20 ta savol va 25 daqiqa vaqt limiti bilan haqiqiy YHXX imtihon simulyatsiyasini tajribadan o\'tkazing.',
            },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl glass-card space-y-3 hover:border-brand-blue/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-100">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
