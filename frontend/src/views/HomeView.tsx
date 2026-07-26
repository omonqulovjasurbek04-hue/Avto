import React from 'react';
import { ViewType } from '../types';
import { ArrowRight, Route, BookOpen, Users, CheckCircle2, Cpu, LineChart, Layers, ShieldCheck, BrainCircuit } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: ViewType) => void;
  onOpenAuth: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenAuth }) => {
  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 px-4 md:px-10 overflow-hidden text-center">
        {/* Glow Background Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#4cd7f6]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-[#3b82f6]/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl z-10 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4cd7f6]/10 border border-[#4cd7f6]/30 animate-float shadow-[0_0_15px_rgba(76,215,246,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#4cd7f6] tracking-widest uppercase">
              DRIVING EDUCATION PROTOCOL v1.0
            </span>
          </div>

          {/* Main Display Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#adc6ff] leading-tight drop-shadow-2xl">
            YHQ qoidalarini <br />
            <span className="text-[#4cd7f6] bg-gradient-to-r from-[#4cd7f6] to-[#adc6ff] bg-clip-text text-transparent">
              jonli o'rganing
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#c2c6d6] max-w-2xl mx-auto leading-relaxed">
            Platformamizda real vaqtda 2D simulyatsiyalar bilan haydovchilik mahoratingizni oshiring. Kelajak haydovchilari uchun texnologik yechim.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-4">
            <button
              onClick={() => onNavigate('practice')}
              className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-[#adc6ff] to-[#4cd7f6] text-[#002e6a] font-bold text-base transition-all duration-300 hover:scale-105 active:scale-95 cyan-glow flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(76,215,246,0.3)]"
            >
              <span>Boshlash</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavigate('lessons')}
              className="w-full sm:w-auto px-10 py-4 rounded-xl border border-[#8c909f]/30 text-[#d8e3fb] font-semibold text-base transition-all duration-300 hover:scale-105 hover:bg-white/5 active:scale-95 backdrop-blur-sm"
            >
              Demo darsni ko'rish
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#8c909f]">Skanerlash</span>
          <div className="w-px h-10 bg-gradient-to-b from-[#4cd7f6] to-transparent animate-pulse" />
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="px-4 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Stat 1 */}
          <div className="glass-panel tilt-card p-6 rounded-xl flex flex-col items-center text-center group transition-all duration-300 hud-corner hover:border-[#4cd7f6]/40">
            <Route className="text-[#4cd7f6] w-8 h-8 mb-2" />
            <div className="font-display text-3xl md:text-4xl font-extrabold text-[#adc6ff] mb-1">16+</div>
            <div className="text-xs font-mono uppercase text-[#c2c6d6] tracking-wider">Ssenariylar</div>
          </div>

          {/* Stat 2 */}
          <div className="glass-panel tilt-card p-6 rounded-xl flex flex-col items-center text-center group transition-all duration-300 hud-corner hover:border-[#4cd7f6]/40">
            <BookOpen className="text-[#4cd7f6] w-8 h-8 mb-2" />
            <div className="font-display text-3xl md:text-4xl font-extrabold text-[#adc6ff] mb-1">10+</div>
            <div className="text-xs font-mono uppercase text-[#c2c6d6] tracking-wider">Darsliklar</div>
          </div>

          {/* Stat 3 */}
          <div className="glass-panel tilt-card p-6 rounded-xl flex flex-col items-center text-center group transition-all duration-300 hud-corner hover:border-[#4cd7f6]/40">
            <Users className="text-[#4cd7f6] w-8 h-8 mb-2" />
            <div className="font-display text-3xl md:text-4xl font-extrabold text-[#adc6ff] mb-1">4111+</div>
            <div className="text-xs font-mono uppercase text-[#c2c6d6] tracking-wider">O'quvchilar</div>
          </div>

          {/* Stat 4 */}
          <div className="glass-panel tilt-card p-6 rounded-xl flex flex-col items-center text-center group transition-all duration-300 hud-corner hover:border-[#4cd7f6]/40">
            <CheckCircle2 className="text-[#4cd7f6] w-8 h-8 mb-2" />
            <div className="font-display text-3xl md:text-4xl font-extrabold text-[#adc6ff] mb-1">80%</div>
            <div className="text-xs font-mono uppercase text-[#c2c6d6] tracking-wider">Muvaffaqiyat</div>
          </div>
        </div>
      </section>

      {/* BENTO GRID FEATURES SECTION */}
      <section className="px-4 md:px-10 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#adc6ff]">Tizim imkoniyatlari</h2>
            <p className="text-sm text-[#c2c6d6] max-w-xl mt-1">
              Dunyodagi eng ilg'or haydovchilik o'qitish metodologiyasi endi bir joyda jamlangan.
            </p>
          </div>
          <div className="h-px flex-grow bg-[#424754]/40 hidden md:block mx-6 mb-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
          {/* Card 1: Simulyatsiya (Large) */}
          <div 
            onClick={() => onNavigate('practice')}
            className="md:col-span-8 tilt-card glass-panel rounded-2xl p-6 flex flex-col justify-end group overflow-hidden relative cursor-pointer border hover:border-[#4cd7f6]/60 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#081425] via-[#081425]/40 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80" 
              alt="Simulation Cockpit HUD" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
            />
            <div className="relative z-20 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/30">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white">Simulyatsiya</h3>
              </div>
              <p className="text-sm text-[#c2c6d6] max-w-md">
                Har bir darsni virtual yo'llarda, real vaziyatlar orqali sinab ko'ring.
              </p>
            </div>
          </div>

          {/* Card 2: Jonli tahlil */}
          <div 
            onClick={() => onNavigate('analytics')}
            className="md:col-span-4 tilt-card glass-panel rounded-2xl p-6 flex flex-col justify-between group cursor-pointer border hover:border-[#4cd7f6]/50 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-[#adc6ff]/20 text-[#adc6ff] flex items-center justify-center">
              <LineChart className="w-6 h-6" />
            </div>
            <div className="space-y-1 mt-auto">
              <h3 className="font-display text-xl font-bold text-white">Jonli tahlil</h3>
              <p className="text-xs text-[#c2c6d6]">
                Har bir harakatingiz uchun real vaqtda sun'iy intellekt tomonidan tahlillar va xatolar ko'rsatkichi.
              </p>
            </div>
          </div>

          {/* Card 3: HUD interfeys */}
          <div className="md:col-span-4 tilt-card glass-panel rounded-2xl p-6 flex flex-col justify-between border-r-4 border-l-0 border-[#4cd7f6]/30">
            <div className="w-12 h-12 rounded-xl bg-[#4cd7f6]/20 text-[#4cd7f6] flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1 mt-auto">
              <h3 className="font-display text-xl font-bold text-white">HUD interfeys</h3>
              <p className="text-xs text-[#c2c6d6]">
                Ma'lumotlar vizuallashtirilgan bo'lib, o'rganish jarayonini chalg'itmaydi va maksimal darajada intuitiv.
              </p>
            </div>
          </div>

          {/* Card 4: Premium testlar */}
          <div 
            onClick={() => onNavigate('practice')}
            className="md:col-span-4 tilt-card glass-panel rounded-2xl p-6 flex flex-col justify-between bg-gradient-to-br from-[#152031] to-[#1f2a3c] cursor-pointer hover:border-[#d0bcff]/50 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-[#d0bcff]/20 text-[#d0bcff] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1 mt-auto">
              <h3 className="font-display text-xl font-bold text-white">Premium testlar</h3>
              <p className="text-xs text-[#c2c6d6]">
                Yangi standartdagi imtihon savollari va interaktiv videoli savollar to'plami.
              </p>
            </div>
          </div>

          {/* Card 5: Smart imtihon */}
          <div 
            onClick={() => onNavigate('exam')}
            className="md:col-span-4 tilt-card glass-panel rounded-2xl p-6 flex flex-col justify-between cursor-pointer border hover:border-[#4cd7f6]/60 transition-all relative overflow-hidden group"
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#adc6ff]/10 blur-2xl group-hover:bg-[#adc6ff]/20 transition-all" />
            <div className="w-12 h-12 rounded-xl bg-[#adc6ff]/20 text-[#adc6ff] flex items-center justify-center relative z-10">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div className="space-y-1 mt-auto relative z-10">
              <h3 className="font-display text-xl font-bold text-white">Smart imtihon</h3>
              <p className="text-xs text-[#c2c6d6]">
                Psixologik tayyorgarlik va bosim ostida qaror qabul qilish ko'nikmalarini baholash tizimi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-4 md:px-10 max-w-7xl mx-auto">
        <div className="glass-panel p-8 md:p-16 rounded-3xl text-center relative overflow-hidden border-2 border-[#adc6ff]/20 shadow-[0_0_50px_rgba(8,20,37,0.8)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#adc6ff]/10 via-transparent to-transparent pointer-events-none" />
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4 relative z-10">
            O'rganishni hoziroq boshlang
          </h2>
          <p className="text-[#c2c6d6] text-base md:text-lg max-w-2xl mx-auto mb-8 relative z-10">
            Barcha kurslarimiz xalqaro YHQ standartlariga moslashtirilgan. Ilk 3ta dars mutlaqo bepul.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <button
              onClick={onOpenAuth}
              className="px-10 py-4 rounded-2xl bg-[#adc6ff] text-[#002e6a] font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(173,198,255,0.4)]"
            >
              Ro'yxatdan o'tish
            </button>
            <button
              onClick={() => onNavigate('lessons')}
              className="px-10 py-4 rounded-2xl glass-panel text-white font-bold text-base hover:bg-white/10 hover:scale-105 active:scale-95 transition-all border border-white/20"
            >
              Aloqa markazi
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
