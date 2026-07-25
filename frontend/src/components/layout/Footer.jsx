'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-bg-darkest py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        AVTO QOIDALAR &copy; {new Date().getFullYear()}
      </div>
    </footer>
  );
}
