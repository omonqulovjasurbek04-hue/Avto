'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="w-full glass-panel border-t border-slate-800/80 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-slate-200">AVTO QOIDALAR</span>
          <span>— Interaktiv Yo'l Harakati Qoidalari Simulyatori</span>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <span>Engine v1.0.0</span>
          <span>•</span>
          <span>PostgreSQL + Prisma</span>
          <span>•</span>
          <span>Next.js + Tailwind</span>
        </div>

        <div className="text-slate-500">
          © {new Date().getFullYear()} YHQ Platformasi. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}
