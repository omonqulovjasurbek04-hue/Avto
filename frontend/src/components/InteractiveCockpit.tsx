import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Gauge, ShieldAlert } from 'lucide-react';

interface InteractiveCockpitProps {
  simType?: 'intersection_unregulated' | 'traffic_light' | 'priority_signs' | 'speed_limit' | 'roundabout';
  simLabel?: string;
  heightClass?: string;
  showControls?: boolean;
}

export const InteractiveCockpit: React.FC<InteractiveCockpitProps> = ({
  simType = 'traffic_light',
  simLabel = 'SIM_ENV_04',
  heightClass = 'h-[320px] md:h-[380px]',
  showControls = true,
}) => {
  const [speed, setSpeed] = useState<number>(45);
  const [gear, setGear] = useState<number>(3);
  const [lightState, setLightState] = useState<'red' | 'yellow' | 'green'>('green');
  const [timer, setTimer] = useState<number>(18);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeCar, setActiveCar] = useState<'red' | 'blue' | 'tram' | 'yellow' | null>('red');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Simulated traffic light countdown
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (lightState === 'green') {
            setLightState('yellow');
            return 3;
          } else if (lightState === 'yellow') {
            setLightState('red');
            return 15;
          } else {
            setLightState('green');
            return 20;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, lightState]);

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden glass-panel border border-[#4cd7f6]/30 hud-corner shadow-[0_0_30px_rgba(8,20,37,0.8)] flex flex-col justify-between group`}>
      {/* Background Animated Intersection Canvas / SVG HUD */}
      <div className="absolute inset-0 bg-[#06101e] overflow-hidden select-none">
        {/* Futuristic grid overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#4cd7f6 1px, transparent 1px), linear-gradient(to right, rgba(76,215,246,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(76,215,246,0.05) 1px, transparent 1px)`,
            backgroundSize: '24px 24px, 48px 48px, 48px 48px',
            transform: `scale(${zoomLevel})`,
            transition: 'transform 0.3s ease'
          }}
        />

        {/* 2D/3D Isometric Intersection SVG */}
        <svg 
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: `scale(${zoomLevel})` }}
          viewBox="0 0 800 450" 
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0c182b" />
              <stop offset="100%" stopColor="#15243b" />
            </linearGradient>
            <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glowEffect">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background Night City Buildings */}
          <path d="M50,120 L150,50 L280,120 L280,180 L50,180 Z" fill="#0c1626" stroke="#1f2d42" strokeWidth="1" />
          <path d="M520,60 L680,20 L760,80 L760,180 L520,180 Z" fill="#0e1b2f" stroke="#2a384e" strokeWidth="1" />
          <path d="M280,20 L400,0 L500,30 L500,100 L280,100 Z" fill="#091220" stroke="#1b283b" strokeWidth="1" />

          {/* Glowing Windows */}
          <rect x="70" y="80" width="12" height="20" fill="#4cd7f6" opacity="0.4" />
          <rect x="100" y="90" width="12" height="20" fill="#3b82f6" opacity="0.3" />
          <rect x="560" y="50" width="16" height="24" fill="#4cd7f6" opacity="0.5" />
          <rect x="600" y="70" width="16" height="24" fill="#a078ff" opacity="0.4" />

          {/* Roads Intersection */}
          {/* Vertical Road */}
          <rect x="340" y="0" width="120" height="450" fill="url(#roadGrad)" />
          {/* Horizontal Road */}
          <rect x="0" y="160" width="800" height="130" fill="url(#roadGrad)" />

          {/* Lane Centerlines */}
          <line x1="400" y1="0" x2="400" y2="160" stroke="#4cd7f6" strokeWidth="2" strokeDasharray="8 8" opacity="0.6" />
          <line x1="400" y1="290" x2="400" y2="450" stroke="#4cd7f6" strokeWidth="2" strokeDasharray="8 8" opacity="0.6" />
          <line x1="0" y1="225" x2="340" y2="225" stroke="#4cd7f6" strokeWidth="2" strokeDasharray="8 8" opacity="0.6" />
          <line x1="460" y1="225" x2="800" y2="225" stroke="#4cd7f6" strokeWidth="2" strokeDasharray="8 8" opacity="0.6" />

          {/* Zebra Crosswalk Lines */}
          <g opacity="0.7" fill="#8c909f">
            {/* Top crosswalk */}
            <rect x="345" y="140" width="110" height="15" fill="none" stroke="#d8e3fb" strokeWidth="2" strokeDasharray="6 6" />
            {/* Bottom crosswalk */}
            <rect x="345" y="295" width="110" height="15" fill="none" stroke="#d8e3fb" strokeWidth="2" strokeDasharray="6 6" />
            {/* Left crosswalk */}
            <rect x="320" y="165" width="15" height="120" fill="none" stroke="#d8e3fb" strokeWidth="2" strokeDasharray="6 6" />
            {/* Right crosswalk */}
            <rect x="465" y="165" width="15" height="120" fill="none" stroke="#d8e3fb" strokeWidth="2" strokeDasharray="6 6" />
          </g>

          {/* Traffic Light Signal (Dynamic Red / Yellow / Green) */}
          <g transform="translate(470, 110)">
            <rect x="0" y="0" width="22" height="50" rx="4" fill="#081425" stroke="#4cd7f6" strokeWidth="1.5" />
            {/* Red Light */}
            <circle cx="11" cy="11" r="6" fill={lightState === 'red' ? '#ff4d4d' : '#401010'} filter={lightState === 'red' ? 'url(#glowEffect)' : ''} />
            {/* Yellow Light */}
            <circle cx="11" cy="25" r="6" fill={lightState === 'yellow' ? '#ffcc00' : '#403300'} filter={lightState === 'yellow' ? 'url(#glowEffect)' : ''} />
            {/* Green Light */}
            <circle cx="11" cy="39" r="6" fill={lightState === 'green' ? '#00e676' : '#003318'} filter={lightState === 'green' ? 'url(#glowEffect)' : ''} />
          </g>

          {/* VEHICLES IN SCENARIO */}
          {/* Car 1: Red Car (Primary - Bottom Lane going Up/Right) */}
          <g 
            transform="translate(360, 310)" 
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => setActiveCar('red')}
          >
            <rect x="0" y="0" width="30" height="55" rx="6" fill="#ff3b30" stroke="#ff8080" strokeWidth="1.5" filter="url(#glowEffect)" />
            {/* Windshield */}
            <rect x="4" y="12" width="22" height="14" rx="2" fill="#111c2d" />
            {/* Headlights */}
            <circle cx="6" cy="4" r="3" fill="#fff" />
            <circle cx="24" cy="4" r="3" fill="#fff" />
            {activeCar === 'red' && (
              <rect x="-4" y="-4" width="38" height="63" rx="8" fill="none" stroke="#4cd7f6" strokeWidth="2" strokeDasharray="4 4" />
            )}
            <text x="10" y="34" fill="#ffffff" fontSize="10" fontWeight="bold">A</text>
          </g>

          {/* Car 2: Blue Truck (Right Lane going Left) */}
          <g 
            transform="translate(560, 180)" 
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => setActiveCar('blue')}
          >
            <rect x="0" y="0" width="70" height="34" rx="4" fill="#007aff" stroke="#66b2ff" strokeWidth="1.5" filter="url(#glowEffect)" />
            <rect x="10" y="4" width="20" height="26" rx="2" fill="#081425" />
            {activeCar === 'blue' && (
              <rect x="-4" y="-4" width="78" height="42" rx="6" fill="none" stroke="#4cd7f6" strokeWidth="2" strokeDasharray="4 4" />
            )}
            <text x="32" y="22" fill="#ffffff" fontSize="11" fontWeight="bold">B</text>
          </g>

          {/* Tram / Blue Transit (Left Lane going Right) */}
          <g 
            transform="translate(120, 235)" 
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => setActiveCar('tram')}
          >
            <rect x="0" y="0" width="90" height="28" rx="4" fill="#152031" stroke="#4cd7f6" strokeWidth="1.5" />
            <line x1="10" y1="6" x2="80" y2="6" stroke="#4cd7f6" strokeWidth="2" />
            {activeCar === 'tram' && (
              <rect x="-4" y="-4" width="98" height="36" rx="6" fill="none" stroke="#4cd7f6" strokeWidth="2" strokeDasharray="4 4" />
            )}
            <text x="38" y="18" fill="#4cd7f6" fontSize="10" fontWeight="bold">TRAM</text>
          </g>

          {/* HUD Target Lock & Direction Vectors */}
          <path d="M375,300 L375,210 L450,210" fill="none" stroke="#4cd7f6" strokeWidth="2" strokeDasharray="5 5" opacity="0.8" />
          <polygon points="450,205 460,210 450,215" fill="#4cd7f6" />
        </svg>

        {/* Scanline overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4cd7f6]/5 to-transparent h-12 w-full animate-scan pointer-events-none" />
      </div>

      {/* TOP HUD BAR */}
      <div className="relative z-10 flex items-center justify-between p-3 md:p-4 bg-gradient-to-b from-[#081425]/90 to-transparent backdrop-blur-sm">
        {/* Live Speed & Status Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-lg bg-[#111c2d]/80 border border-[#4cd7f6]/40 flex items-center gap-2 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping" />
            <Gauge className="w-4 h-4 text-[#4cd7f6]" />
            <span className="font-mono text-[#4cd7f6] font-bold text-sm md:text-base">
              {speed} <span className="text-xs text-slate-400">km/h</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1f2a3c]/70 border border-white/10 text-xs text-slate-300 font-mono">
            <span>GEAR</span>
            <span className="text-[#4cd7f6] font-bold text-sm">{gear}</span>
          </div>
        </div>

        {/* Center Environment Code */}
        <div className="font-mono text-xs tracking-widest text-[#4cd7f6]/80 bg-[#081425]/70 border border-[#4cd7f6]/30 px-3 py-1 rounded-md hidden md:block">
          ● {simLabel}
        </div>

        {/* Right Camera & Controls */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.4))}
            className="p-1.5 rounded-lg bg-[#152031]/80 hover:bg-[#1f2a3c] border border-white/10 text-[#d8e3fb] hover:text-[#4cd7f6] transition-all"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.85))}
            className="p-1.5 rounded-lg bg-[#152031]/80 hover:bg-[#1f2a3c] border border-white/10 text-[#d8e3fb] hover:text-[#4cd7f6] transition-all"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-[#4cd7f6]/20 border border-[#4cd7f6]/50 text-[#4cd7f6] hover:bg-[#4cd7f6]/30 transition-all ml-1"
            title={isPlaying ? "Pause simulation" : "Play simulation"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* BOTTOM HUD INSTRUMENT OVERLAY */}
      <div className="relative z-10 flex items-end justify-between p-3 md:p-4 bg-gradient-to-t from-[#081425]/90 via-[#081425]/50 to-transparent">
        {/* Left: Engine Temp / Gauge */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            DVIGATEL HARORATI
          </div>
          <div className="flex items-center gap-1">
            <div className="w-20 md:w-28 h-2 rounded-full bg-[#111c2d] overflow-hidden border border-white/10">
              <div className="h-full bg-gradient-to-r from-[#4cd7f6] via-[#3b82f6] to-[#00e676] w-[65%]" />
            </div>
            <span className="font-mono text-xs text-[#4cd7f6] font-semibold">88°C</span>
          </div>
        </div>

        {/* Center: Interactive Speed Quick Slider */}
        {showControls && (
          <div className="hidden lg:flex items-center gap-2 bg-[#111c2d]/80 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
            <span className="text-xs text-slate-400 font-mono">Tezlik:</span>
            <input 
              type="range" 
              min="0" 
              max="120" 
              value={speed}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSpeed(val);
                setGear(val < 20 ? 1 : val < 40 ? 2 : val < 70 ? 3 : val < 100 ? 4 : 5);
              }}
              className="w-24 accent-[#4cd7f6] cursor-pointer"
            />
            <span className="text-xs text-[#4cd7f6] font-mono font-bold w-12">{speed} km/h</span>
          </div>
        )}

        {/* Right: Gear indicator badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-lg bg-[#111c2d]/90 border border-[#4cd7f6]/30 text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">GEAR</span>
            <span className="font-mono font-extrabold text-xl md:text-2xl text-[#4cd7f6] leading-none">
              {gear}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
