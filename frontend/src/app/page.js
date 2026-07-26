'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-16 py-4 animate-fade-in">
      <section className="relative rounded-3xl p-8 md:p-16 overflow-hidden glass-panel border border-blue-500/20 shadow-glow-blue flex flex-col items-center text-center mb-16">
        {/* Animated background elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 rounded-3xl animate-pulse" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-sm font-semibold uppercase tracking-wider mb-8 animate-fade-in">
            <span className="animate-pulse">⚡</span>
            <span>YHQ Interaktiv Ta'lim Platformasi</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold font-heading tracking-tight max-w-5xl leading-tight mb-8 animate-slide-up">
            Yo'l Harakati Qoidalarini <br />
            <span className="text-gradient animate-pulse">Interaktiv Simulyatsiya</span> Bilan O'rganing
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-3xl leading-relaxed mb-10 animate-slide-up delay-100">
            Har bir savolga real vaqtda hisoblangan Canvas animatsiya javob bilan YHQ ni amaliy o'rganing. 
            To'g'ri va noto'g'ri holatlarni jonli simulyatsiya orqali ko'ring.
          </p>

          <div className="flex flex-wrap justify-center gap-6 animate-slide-up delay-200">
            <Link 
              href="/practice" 
              className="group px-10 py-4 rounded-2xl bg-gradient-to-r from-brand-blue to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-lg shadow-glow-blue hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🚀</span>
                <span>Mashqlarni Boshlash</span>
              </span>
            </Link>
            <Link 
              href="/exam" 
              className="group px-10 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-bold text-lg border border-slate-600/50 hover:border-slate-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">📋</span>
                <span>Imtihon Topshirish</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {[
          { icon: '🚗', label: 'Video savollar', count: '20+', color: 'blue' },
          { icon: '📚', label: 'YHQ Mavzulari', count: '13 ta', color: 'cyan' },
          { icon: '🎯', label: "O'tish bali", count: '90%', color: 'green' },
          { icon: '📱', label: 'Interaktiv', count: 'HD', color: 'purple' },
        ].map((stat, i) => (
          <div 
            key={i} 
            className={`group p-6 rounded-2xl glass-card text-center hover:scale-102 transition-all duration-300 cursor-pointer animate-tilt-enter delay-${i * 100}`}
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
              {stat.icon}
            </div>
            <div className={`text-2xl md:text-3xl font-extrabold font-heading text-gradient mb-2`}>
              {stat.count}
            </div>
            <div className="text-xs font-medium text-slate-400">{stat.label}</div>
            
            {/* Glassmorphism hover overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ))}
      </section>

      {/* Features Section with 3D Cards */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-gradient">
            Nima uchun AVTO YHQ?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Zamonaviy texnologiyalar yordamida haydovchilik qobiliyatlaringizni oshiring
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: '🎮',
              title: 'Interaktiv Simulyatsiya',
              desc: 'Real vaqtda yo\'l vaziyatlarini ko\'ring va natijalarni tahlil qiling',
              color: 'blue'
            },
            {
              icon: '⚡',
              title: 'Tezkor Natija',
              desc: 'Har bir javobga darhol vizual va batafsil javob oling',
              color: 'cyan'
            },
            {
              icon: '📊',
              title: 'Progress Tracking',
              desc: 'O\'z rivojlanishingizni kuzatib boring va weak pointlarni aniqlang',
              color: 'green'
            },
            {
              icon: '🎯',
              title: 'Maqsadli Tayyorgarlik',
              desc: 'Imtihonga tayyor bo\'lish uchun real testlar va mashqlar',
              color: 'purple'
            },
            {
              icon: '📱',
              title: 'Responsive Dizayn',
              desc: 'Har qanday qurilmada qulay foydalanish - telefon, planshet, kompyuter',
              color: 'amber'
            },
            {
              icon: '🔄',
              title: 'Real-time Engine',
              desc: 'JavaScript engine orqali real vaqtda hisoblangan animatsiyalar',
              color: 'red'
            }
          ].map((feature, i) => (
            <div
              key={i}
              className={`group relative p-8 rounded-3xl glass-card text-center hover:border-brand-${feature.color}/40 transition-all duration-300 transform hover:scale-102 tilt-card animate-tilt-enter delay-${Math.min(i * 100, 500)}`}
            >
              <div className="relative z-10">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-${feature.color}/30 to-brand-${feature.color}/10 border border-brand-${feature.color}/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-100 font-heading mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
              
              {/* 3D depth background */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
