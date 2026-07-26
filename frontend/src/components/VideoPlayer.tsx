import React, { useRef, useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Play, Pause } from 'lucide-react';

interface VideoPlayerProps {
  playbackUrl?: string | null;
  type?: 'CORRECT' | 'WRONG' | null;
  videoType?: string | null;
  durationSec?: number;
  onEnded?: () => void;
  autoPlay?: boolean;
  title?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  playbackUrl,
  type,
  videoType = 'CORRECT',
  durationSec = 10,
  onEnded,
  autoPlay = true,
  title,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [elapsed, setElapsed] = useState(0);

  const effectiveType = type || videoType;
  const isCorrect = effectiveType === 'CORRECT';
  const minDuration = Math.max(10, durationSec);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (autoPlay) {
      video.play().catch((err) => console.log('Autoplay error:', err));
    }

    const handleTimeUpdate = () => {
      setElapsed(video.currentTime);
      if (!isCorrect && video.currentTime >= minDuration) {
        if (onEnded) {
          onEnded();
        }
      }
    };

    const handleEnded = () => {
      if (!isCorrect) {
        if (onEnded) {
          onEnded();
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [playbackUrl, isCorrect, minDuration, onEnded, autoPlay]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[250px] bg-slate-950 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center group">
      {playbackUrl ? (
        <video
          ref={videoRef}
          src={playbackUrl}
          loop={isCorrect}
          playsInline
          muted
          preload="auto"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center border ${
            isCorrect ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-red-500/20 border-red-500/50 text-red-400'
          }`}>
            {isCorrect ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
          <p className="text-sm font-semibold text-slate-200">
            {isCorrect ? "To'g'ri harakatlanish videosi" : "Avariya simulyatsiyasi (Kamida 10s)"}
          </p>
          <span className="text-xs text-slate-500 font-mono">
            {playbackUrl ? playbackUrl : 'Cloudflare Stream Demo Simulation'}
          </span>
        </div>
      )}

      {/* Overlay status badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border shadow-lg backdrop-blur-md ${
          isCorrect 
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
            : 'bg-red-950/80 border-red-500/50 text-red-300'
        }`}>
          {isCorrect ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>TO'G'RI (LOOP ✅)</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>XATO (AVARIYA ❌ — {Math.ceil(elapsed)}s / {minDuration}s)</span>
            </>
          )}
        </span>
      </div>

      {/* Play/Pause overlay button */}
      {playbackUrl && (
        <button
          onClick={togglePlay}
          className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-900/80 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};
