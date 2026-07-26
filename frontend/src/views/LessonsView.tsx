import React, { useState } from 'react';
import { LessonModule, ViewType } from '../types';
import { LESSON_MODULES } from '../data/mockData';
import { Play, CheckCircle2, AlertTriangle, Clock, ArrowRight, Compass, ShieldAlert } from 'lucide-react';

interface LessonsViewProps {
  onNavigate: (view: ViewType) => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({ onNavigate }) => {
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);

  const currentModule: LessonModule =
    LESSON_MODULES.find((m) => m.id === selectedModuleId) || LESSON_MODULES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 pt-24 pb-16 space-y-8">
      {/* MAIN TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT SIDEBAR: MODULES LIST */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-display text-xl font-bold text-white px-1">
            Modules
          </h2>

          <div className="space-y-3">
            {LESSON_MODULES.map((module) => {
              const isActive = module.id === selectedModuleId;
              return (
                <button
                  key={module.id}
                  onClick={() => {
                    setSelectedModuleId(module.id);
                    setIsVideoPlaying(false);
                  }}
                  className={`w-full p-4 rounded-xl text-left border transition-all duration-200 flex items-start gap-3 relative ${
                    isActive
                      ? 'bg-[#152031] border-[#4cd7f6] text-white shadow-[0_0_20px_rgba(76,215,246,0.25)]'
                      : 'bg-[#111c2d]/70 border-white/10 text-slate-300 hover:bg-[#111c2d] hover:border-white/20'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg border shrink-0 ${
                    isActive ? 'bg-[#4cd7f6]/20 border-[#4cd7f6] text-[#4cd7f6]' : 'bg-[#1f2a3c] border-white/10 text-slate-400'
                  }`}>
                    <Compass className="w-5 h-5" />
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="font-display text-sm font-bold leading-snug text-white">
                      {module.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {module.subtitle}
                    </p>
                  </div>

                  {/* Corner Accent for Active Item */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#4cd7f6]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: MODULE DETAILS & INTERACTIVE SIMULATION VIDEO PLAYER */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 space-y-6">
            {/* Module Title Header */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#4cd7f6] font-bold block mb-1">
                  MODULE {currentModule.id}
                </span>
                <h1 className="font-display text-2xl md:text-4xl font-extrabold text-white">
                  {currentModule.title.replace(/^\d+\.\s*/, '')}
                </h1>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111c2d] border border-white/10 text-xs font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-[#4cd7f6]" />
                <span>{currentModule.duration}</span>
              </div>
            </div>

            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              {currentModule.description}
            </p>

            {/* Simulated Cockpit Player with HUD overlays */}
            <div className="relative h-[280px] md:h-[360px] rounded-2xl overflow-hidden glass-panel border border-[#4cd7f6]/40 hud-corner shadow-[0_0_30px_rgba(8,20,37,0.8)] group">
              <img
                src="https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80"
                alt="Lesson Simulation"
                className={`w-full h-full object-cover transition-transform duration-700 ${isVideoPlaying ? 'scale-105' : 'group-hover:scale-105'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081425] via-[#081425]/40 to-transparent" />

              {/* HUD OVERLAY LABELS */}
              <div className="absolute top-4 left-4 p-3 rounded-lg bg-[#081425]/80 border border-[#4cd7f6]/30 text-[10px] font-mono space-y-0.5 backdrop-blur-md">
                <div className="text-[#4cd7f6] font-bold uppercase">
                  DARSLIK: CHORRAHADA HARAKAT
                </div>
                <div className="text-slate-300">DAVOMIYLIGI: 4:35</div>
                <div className="text-emerald-400">XAVFSIZLIK: YUQORI</div>
              </div>

              {/* Floating Interactive Signal Nodes */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex items-center gap-6">
                <div className="px-3 py-1.5 rounded-full bg-[#081425]/80 border border-[#4cd7f6] text-[#4cd7f6] text-xs font-mono font-bold backdrop-blur-md animate-pulse">
                  {currentModule.simOverlayData.greenTime}
                </div>
                <div className="px-3 py-1.5 rounded-full bg-[#081425]/80 border border-amber-400 text-amber-300 text-xs font-mono font-bold backdrop-blur-md">
                  {currentModule.simOverlayData.waitTime}
                </div>
              </div>

              {/* Play / Pause Toggle Center Button */}
              <button
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#4cd7f6]/30 border-2 border-[#4cd7f6] flex items-center justify-center text-white backdrop-blur-md hover:scale-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(76,215,246,0.6)]"
              >
                <Play className="w-8 h-8 fill-white translate-x-0.5" />
              </button>

              {/* Bottom Gauge & Map HUD Overlays */}
              <div className="absolute bottom-4 left-4 flex items-center gap-3 font-mono text-xs text-[#4cd7f6]">
                <div className="px-3 py-1.5 rounded-xl bg-[#081425]/90 border border-white/10 font-bold text-lg">
                  {currentModule.simOverlayData.speed} <span className="text-xs text-slate-400">km/h</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-[#081425]/90 border border-white/10 font-bold text-lg">
                  {currentModule.simOverlayData.gear}
                </div>
              </div>

              <div className="absolute bottom-4 right-4 hidden sm:block p-2 rounded-xl bg-[#081425]/90 border border-[#4cd7f6]/30 text-[10px] font-mono text-right backdrop-blur-md">
                <span className="text-slate-400 block uppercase">NAVIGATION MAP</span>
                <span className="text-white font-bold">MARKAZIY CHORRAHA</span>
              </div>
            </div>

            {/* Key Concepts & Critical Rule Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
              {/* Key Concepts */}
              <div className="md:col-span-7 space-y-4">
                <h3 className="font-display text-lg font-bold text-white">
                  Key Concepts
                </h3>
                <div className="space-y-3">
                  {currentModule.keyConcepts.map((concept, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#111c2d]/60 border border-white/5">
                      <CheckCircle2 className="w-5 h-5 text-[#4cd7f6] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm text-white">{concept.title}</h4>
                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{concept.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Rule Callout Card */}
              <div className="md:col-span-5 p-5 rounded-2xl bg-[#111c2d] border border-amber-500/30 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Critical Rule</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {currentModule.criticalRule}
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('practice')}
                  className="w-full py-3 rounded-xl bg-[#4cd7f6] text-[#002e6a] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(76,215,246,0.3)]"
                >
                  <span>START PRACTICE QUIZ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
