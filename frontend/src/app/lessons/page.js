'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listLessons()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.lessons || []);
        setLessons(list);
        if (list.length > 0) setSelectedLesson(list[0]);
      })
      .catch((err) => {
        setError(err?.message || 'Darslarni yuklashda xatolik');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gradient">📖 YHQ Nazariy Darsliklar</h1>
        </div>
        <div className="p-6 rounded-2xl glass-card text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gradient">
            📖 YHQ Nazariy Darsliklar
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Yo'l harakati qoidalarining asosiy mavzulari va rasmiy bandlari
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar Topic List */}
        <div className="space-y-2 md:col-span-1">
          <h2 className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-3">
            Mavzular Ro'yxati ({lessons.length})
          </h2>

          {lessons.map((lesson) => {
            const isSelected = selectedLesson?.id === lesson.id;
            return (
              <button
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson)}
                className={`w-full p-4 rounded-xl text-left border transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-blue-600/20 border-brand-blue text-white shadow-glow-blue'
                    : 'glass-card hover:bg-slate-800/80 text-slate-300 border-slate-700/60'
                }`}
              >
                <span className="text-2xl">{lesson.icon || '📘'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span>⏱️ {lesson.readTime || '10 min'}</span>
                    <span>•</span>
                    <span className="text-blue-400 font-mono">{lesson.ruleCode}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Lesson Viewer */}
        <div className="md:col-span-2 space-y-6 glass-panel p-6 md:p-8 rounded-2xl border border-slate-800">
          {selectedLesson ? (
            <>
              <div className="border-b border-slate-800 pb-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <span>{selectedLesson.ruleCode}</span>
                  <span>•</span>
                  <span>{selectedLesson.readTime}</span>
                </div>

                <h2 className="text-2xl font-bold font-heading text-slate-100">
                  {selectedLesson.title}
                </h2>

                <p className="text-sm text-slate-300">
                  {selectedLesson.description}
                </p>
              </div>

              {/* Lesson Sections */}
              <div className="space-y-6">
                {selectedLesson.sections?.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-lg font-bold font-heading text-brand-blue flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-blue" />
                      {section.heading}
                    </h3>

                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                      {section.content}
                    </p>

                    {section.signs && section.signs.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-400">Belgilar:</span>
                        {section.signs.map((sign, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs"
                          >
                            🛑 {sign}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Mavzuni tanlang
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
