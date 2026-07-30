import React, { useEffect, useState } from 'react';
import { ViewType } from '../types';
import { lessonsApi, Lesson, ApiError } from '../api/client';
import { CheckCircle2, Clock, ArrowRight, ShieldAlert, Loader2 } from 'lucide-react';

interface LessonsViewProps {
  onNavigate: (view: ViewType) => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({ onNavigate }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    lessonsApi
      .list()
      .then((data) => {
        setLessons(data);
        if (data.length > 0) setSelectedLessonId(data[0].id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Darsliklarni yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  }, []);

  const currentLesson = lessons.find((l) => l.id === selectedLessonId) || lessons[0];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-16 flex justify-center">
        <Loader2 className="w-8 h-8 text-[#4cd7f6] animate-spin" />
      </div>
    );
  }

  if (error || !currentLesson) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-16 text-center text-red-300">
        {error || "Darsliklar topilmadi"}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 pt-24 pb-16 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT SIDEBAR: LESSONS LIST */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-display text-xl font-bold text-white px-1">Darsliklar</h2>

          <div className="space-y-3">
            {lessons.map((lesson) => {
              const isActive = lesson.id === selectedLessonId;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={`w-full p-4 rounded-xl text-left border transition-all duration-200 flex items-start gap-3 relative ${
                    isActive
                      ? 'bg-[#152031] border-[#4cd7f6] text-white shadow-[0_0_20px_rgba(76,215,246,0.25)]'
                      : 'bg-[#111c2d]/70 border-white/10 text-slate-300 hover:bg-[#111c2d] hover:border-white/20'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-lg border shrink-0 text-xl leading-none ${
                      isActive ? 'bg-[#4cd7f6]/20 border-[#4cd7f6]' : 'bg-[#1f2a3c] border-white/10'
                    }`}
                  >
                    {lesson.icon}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-display text-sm font-bold leading-snug text-white">{lesson.title}</h3>
                    <p className="text-xs text-slate-400">{lesson.description}</p>
                  </div>
                  {isActive && <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#4cd7f6]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: LESSON DETAILS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#4cd7f6] font-bold block mb-1">
                  {currentLesson.ruleCode}
                </span>
                <h1 className="font-display text-2xl md:text-4xl font-extrabold text-white">{currentLesson.title}</h1>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111c2d] border border-white/10 text-xs font-mono text-slate-300 shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#4cd7f6]" />
                <span>{currentLesson.readTime}</span>
              </div>
            </div>

            <p className="text-sm md:text-base text-slate-300 leading-relaxed">{currentLesson.description}</p>

            <div className="space-y-4 pt-2">
              {currentLesson.sections.map((section, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-[#111c2d]/60 border border-white/5 space-y-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#4cd7f6] shrink-0 mt-0.5" />
                    <div className="space-y-1.5 flex-1">
                      <h4 className="font-bold text-sm text-white">{section.heading}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{section.content}</p>
                      {section.signs && section.signs.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {section.signs.map((code) => (
                            <span
                              key={code}
                              className="px-2 py-0.5 rounded-md bg-[#081425] border border-[#4cd7f6]/30 text-[#4cd7f6] text-[10px] font-mono font-bold"
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-[#111c2d] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono">
                <ShieldAlert className="w-4 h-4" />
                <span>Endi bilimingizni sinab ko'ring</span>
              </div>
              <button
                onClick={() => onNavigate('practice')}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[#4cd7f6] text-[#002e6a] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(76,215,246,0.3)]"
              >
                <span>Amaliyotni boshlash</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
