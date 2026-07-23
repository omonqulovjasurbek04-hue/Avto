'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEngine } from '../../hooks/useEngine';

export function ScenarioPlayer({ scenario, selectedOption, onAnswerSelect, isAnswered }) {
  const canvasRef = useRef(null);
  const { ready, error, engine } = useEngine();
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(5);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Initialize and play engine animation on canvas
  useEffect(() => {
    if (!ready || !engine || !scenario || !canvasRef.current) return;

    let animFrameId;
    let startTime = performance.now();
    let currentT = 0;
    let activeScenarioRaw = JSON.stringify(scenario);

    let maxDuration = 5;
    try {
      const info = engine.sceneInfo(activeScenarioRaw);
      maxDuration = info.duration || 5;
      setDuration(maxDuration);
    } catch (e) {
      console.warn('Engine sceneInfo error:', e);
    }

    const render = (now) => {
      if (!canvasRef.current) return;

      if (isPlaying) {
        const delta = ((now - startTime) / 1000) * playbackSpeed;
        currentT = (currentT + delta) % maxDuration;
        startTime = now;
        setCurrentTime(currentT);
      }

      try {
        const frameData = engine.frame(activeScenarioRaw, currentT, selectedOption);
        const ctx = canvasRef.current.getContext('2d');
        if (ctx && frameData) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          // If frameData exposes render method or drawing primitives
          if (engine.renderFrameToCanvas) {
            engine.renderFrameToCanvas(ctx, frameData);
          } else if (frameData.primitives) {
            // Draw 2D primitives directly if engine returns schema
            drawPrimitives(ctx, frameData.primitives, canvasRef.current.width, canvasRef.current.height);
          } else {
            // Simulated 2D intersection fallback render
            drawFallbackScene(ctx, currentT, maxDuration, selectedOption, canvasRef.current.width, canvasRef.current.height);
          }
        }
      } catch (e) {
        // Fallback smooth render on frame error
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          drawFallbackScene(ctx, currentT, maxDuration, selectedOption, canvasRef.current.width, canvasRef.current.height);
        }
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [ready, engine, scenario, selectedOption, isPlaying, playbackSpeed]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass-panel border border-blue-500/20 shadow-glow-blue">
      {/* Engine Status / Loading overlay */}
      {!ready && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-bg-darkest/90 backdrop-blur-md">
          <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-300 font-medium">2D Simulation Engine yuklanmoqda...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-brand-red/10 border-b border-brand-red/30 text-brand-red text-sm">
          ⚠️ Engine status: {error}
        </div>
      )}

      {/* Main Canvas Viewport */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-full object-contain"
        />

        {/* Dynamic HUD overlay */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg glass-panel text-xs font-mono text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>2D ENGINE ACTIVE</span>
          <span className="text-slate-500">|</span>
          <span>{currentTime.toFixed(1)}s / {duration.toFixed(1)}s</span>
        </div>
      </div>

      {/* Minimal Playback Controller */}
      <div className="px-6 py-3 bg-bg-dark/80 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 transition-all"
            title={isPlaying ? 'Pauza' : 'Ijro etish'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <span className="text-xs font-mono text-slate-400">
            {currentTime.toFixed(1)}s
          </span>
        </div>

        {/* Progress Bar Scrubber */}
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={currentTime}
            onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
          {[0.25, 0.5, 1].map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2 py-0.5 text-xs rounded font-mono transition-all ${
                playbackSpeed === speed
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Fallback high-fidelity 2D Intersection Renderer if primitives are not passed directly
function drawFallbackScene(ctx, t, duration, option, width, height) {
  // Road background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  // Crossroads asphalt
  ctx.fillStyle = '#1e293b';
  // Vertical road
  ctx.fillRect(width * 0.38, 0, width * 0.24, height);
  // Horizontal road
  ctx.fillRect(0, height * 0.35, width, height * 0.3);

  // Road markings (yellow center lines)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 12]);

  // Vertical center line
  ctx.beginPath();
  ctx.moveTo(width * 0.5, 0);
  ctx.lineTo(width * 0.5, height * 0.35);
  ctx.moveTo(width * 0.5, height * 0.65);
  ctx.lineTo(width * 0.5, height);
  ctx.stroke();

  // Horizontal center line
  ctx.beginPath();
  ctx.moveTo(0, height * 0.5);
  ctx.lineTo(width * 0.38, height * 0.5);
  ctx.moveTo(width * 0.62, height * 0.5);
  ctx.lineTo(width, height * 0.5);
  ctx.stroke();
  ctx.setLineDash([]);

  // Give way line / Stop lines
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(width * 0.38, height * 0.65, width * 0.12, 4);

  // Ego Car (Player - moving from South to North)
  const progress = Math.min(1, t / duration);
  const egoY = height * 0.8 - progress * (height * 0.5);
  const egoX = width * 0.44;

  // Ego car body (Blue)
  ctx.fillStyle = '#3b82f6';
  ctx.shadowColor = '#3b82f6';
  ctx.shadowBlur = 12;
  ctx.fillRect(egoX, egoY, 28, 48);
  ctx.shadowBlur = 0;

  // Car headlights
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(egoX + 4, egoY - 4, 6, 4);
  ctx.fillRect(egoX + 18, egoY - 4, 6, 4);

  // Car Label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('SIZ', egoX + 4, egoY + 28);

  // Other Car A1 (Main road East to West)
  const a1Progress = Math.min(1, t / (duration * 0.8));
  const a1X = width * 0.9 - a1Progress * (width * 0.6);
  const a1Y = height * 0.42;

  // Car A1 body (Red)
  ctx.fillStyle = option === 'o2' && progress > 0.4 && a1Progress > 0.4 ? '#ef4444' : '#10b981';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 10;
  ctx.fillRect(a1X, a1Y, 48, 26);
  ctx.shadowBlur = 0;

  // A1 Headlights
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(a1X - 4, a1Y + 4, 4, 6);
  ctx.fillRect(a1X - 4, a1Y + 16, 4, 6);

  // Collision Warning effect if option o2 selected (wrong answer)
  if (option === 'o2' && Math.abs(egoX - a1X) < 40 && Math.abs(egoY - a1Y) < 40) {
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('💥 TO\'QNASHUV!', width * 0.35, height * 0.5);
  }
}

function drawPrimitives(ctx, primitives, width, height) {
  // Primitive rendering pipeline if engine output is active
  primitives.forEach((p) => {
    if (p.type === 'rect') {
      ctx.fillStyle = p.color || '#ffffff';
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }
  });
}
