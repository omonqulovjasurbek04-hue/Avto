import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ShieldCheck, ShieldAlert, Zap, Volume2, VolumeX, Maximize } from 'lucide-react';
import { VideoType } from '../types';

interface VideoPlayerProps {
  playbackUrl?: string;
  videoType?: VideoType;
  durationSec?: number;
  autoPlay?: boolean;
  title?: string;
  onEnded?: () => void;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  playbackUrl,
  videoType = 'CORRECT',
  durationSec = 12,
  autoPlay = true,
  title = "Cloudflare Stream Video",
  onEnded,
  className = "h-[320px] md:h-[380px]",
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Default fallback videos if direct Cloudflare MP4/HLS isn't provided
  const defaultDriveVideo = "https://assets.mixkit.co/videos/preview/mixkit-car-driving-on-a-highway-at-dusk-41558-large.mp4";
  const defaultCrashVideo = "https://assets.mixkit.co/videos/preview/mixkit-[#1283]-car-driving-through-a-dark-tunnel-41557-large.mp4";

  const videoSource = playbackUrl || (videoType === 'CORRECT' ? defaultDriveVideo : defaultCrashVideo);
  const isCorrect = videoType === 'CORRECT';

  useEffect(() => {
    setIsPlaying(autoPlay);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (autoPlay) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [playbackUrl, videoType]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVideoEnded = () => {
    if (isCorrect) {
      // Loop rejimida to'g'ri javob davom etadi
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    } else {
      // Xato javob bir marta kamida 10s ijro etilib, to'xtaydi va onEnded chaqiriladi
      setIsPlaying(false);
      if (onEnded) onEnded();
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={`relative w-full ${className} rounded-2xl overflow-hidden glass-panel border ${
      isCorrect ? 'border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.3)]' : 'border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.3)]'
    } hud-corner flex flex-col justify-between group bg-slate-950`}>
      {/* HTML5 Video Element with Stream Support */}
      <video
        ref={videoRef}
        src={videoSource}
        autoPlay={autoPlay}
        loop={isCorrect}
        muted={isMuted}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
      />

      {/* Futuristic Scanline Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4cd7f6]/5 to-transparent h-16 w-full animate-scan pointer-events-none" />

      {/* TOP STREAM HUD STATUS BADGE */}
      <div className="relative z-10 flex items-center justify-between p-3 md:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-lg border flex items-center gap-2 backdrop-blur-md ${
            isCorrect ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-red-950/80 border-red-500 text-red-300'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-ping ${isCorrect ? 'bg-emerald-400' : 'bg-red-500'}`} />
            {isCorrect ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              {isCorrect ? "TO'G'RI JAVOB (LOOP)" : "XATO JAVOB (AVARIYA - 10S)"}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-slate-300">
            <Zap className="w-3.5 h-3.5 text-[#4cd7f6]" />
            <span>CLOUDFLARE STREAM</span>
          </div>
        </div>

        {/* Mute & Fullscreen toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 border border-white/10 text-slate-200 hover:text-[#4cd7f6] transition-all"
            title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CENTER PLAY BUTTON OVERLAY */}
      <div className="relative z-10 flex items-center justify-center my-auto">
        <button
          onClick={togglePlay}
          className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-white backdrop-blur-md transition-all duration-300 ${
            isPlaying ? 'opacity-0 group-hover:opacity-100 scale-95' : 'opacity-100 scale-100'
          } ${
            isCorrect ? 'bg-emerald-500/30 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-red-500/30 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
          }`}
        >
          {isPlaying ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white translate-x-0.5" />}
        </button>
      </div>

      {/* BOTTOM CONTROL BAR */}
      <div className="relative z-10 flex flex-col justify-end p-3 md:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent space-y-2">
        {/* Progress Timeline */}
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer">
          <div
            className={`h-full transition-all duration-150 ${isCorrect ? 'bg-emerald-400' : 'bg-red-500'}`}
            style={{
              width: videoRef.current && videoRef.current.duration
                ? `${(currentTime / videoRef.current.duration) * 100}%`
                : '0%'
            }}
          />
        </div>

        <div className="flex justify-between items-center text-xs font-mono text-slate-300">
          <span>{title}</span>
          <span>
            {Math.floor(currentTime)}s / {Math.floor(videoRef.current?.duration || durationSec)}s
          </span>
        </div>
      </div>
    </div>
  );
};
