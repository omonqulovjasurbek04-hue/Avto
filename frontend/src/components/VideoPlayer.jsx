'use client';

import React, { useRef, useEffect, useState } from 'react';

export default function VideoPlayer({ url, type, onEnded }) {
  const videoRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    if (type === 'correct') {
      videoRef.current.loop = true;
    } else {
      videoRef.current.loop = false;
    }
    setLoaded(false);
    setError(false);
  }, [url, type]);

  if (!url) return null;

  return (
    <div className="rounded-xl overflow-hidden bg-black/60 border border-slate-700">
      <video
        ref={videoRef}
        src={url}
        controls
        autoPlay
        className="w-full max-h-[400px] object-contain"
        onLoadedData={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(true); }}
        onEnded={type === 'wrong' ? onEnded : undefined}
      />
      {error && (
        <div className="flex items-center justify-center py-4 text-red-400 text-sm">
          Video yuklab bo'lmadi
        </div>
      )}
      {!loaded && !error && (
        <div className="flex items-center justify-center py-8 text-slate-400 text-sm">
          <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mr-2" />
          Video yuklanmoqda...
        </div>
      )}
    </div>
  );
}
