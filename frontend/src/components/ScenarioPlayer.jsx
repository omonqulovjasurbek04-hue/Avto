'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

const CANVAS_SIZE = 1000; // Fixed size for engine calculations
const SCENARIO_API = '/api/scenarios'; // Proxy orqali backend API

// Convert ARGB to CSS rgba
function argbToRgba(argb) {
  const a = ((argb >> 24) & 0xFF) / 255;
  const r = (argb >> 16) & 0xFF;
  const g = (argb >> 8) & 0xFF;
  const b = argb & 0xFF;
  return `rgba(${r},${g},${b},${a})`;
}

// Canvas renderer - similar to engine-js/renderer.js
function drawDisplayList(ctx, frame, scale = 1) {
  const ops = frame?.ops || [];
  
  ctx.save();
  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  for (const op of ops) {
    switch (op.type) {
      case 'fillPolygon':
        drawFillPolygon(ctx, op);
        break;
      case 'strokePath':
        drawStrokePath(ctx, op);
        break;
      case 'fillCircle':
        drawFillCircle(ctx, op);
        break;
    }
  }

  ctx.restore();
}

function drawFillPolygon(ctx, op) {
  const pts = op.points;
  if (!pts || pts.length < 3) return;

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = argbToRgba(op.colour);
  ctx.fill();
}

function drawStrokePath(ctx, op) {
  const pts = op.points;
  if (!pts || pts.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  if (op.closed) ctx.closePath();

  if (op.dash) {
    ctx.setLineDash(op.dash);
  }

  ctx.strokeStyle = argbToRgba(op.colour);
  ctx.lineWidth = op.width || 2;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawFillCircle(ctx, op) {
  ctx.beginPath();
  ctx.arc(op.centre.x, op.centre.y, op.radius || 5, 0, Math.PI * 2);
  ctx.fillStyle = argbToRgba(op.colour);
  ctx.fill();
}

/**
 * ScenarioPlayer - Interactive Canvas component for YHQ simulations
 * Props:
 * - scenarioId: The scenario to load
 * - selectedOption: Currently selected answer option
 * - onOptionResult: Callback when animation shows result (collision/safe)
 */
export default function ScenarioPlayer({ 
  scenarioId, 
  selectedOption, 
  onOptionResult,
  className = '' 
}) {
  const canvasRef = useRef(null);
  const [scenario, setScenario] = useState(null);
  const [scenarioInfo, setScenarioInfo] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Load scenario and info from backend
  useEffect(() => {
    if (!scenarioId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`${SCENARIO_API}/${scenarioId}`).then(r => r.json()),
      fetch(`${SCENARIO_API}/${scenarioId}/info`).then(r => r.json())
    ])
    .then(([scenarioData, infoData]) => {
      setScenario(scenarioData);
      setScenarioInfo(infoData);
      setCurrentTime(0);
      setLoading(false);
    })
    .catch(err => {
      setError(err.message || 'Failed to load scenario');
      setLoading(false);
    });
  }, [scenarioId]);

  // Load frame data for current time and option
  const loadFrame = useCallback(async (time, optionId = null) => {
    if (!scenarioId) return null;

    try {
      const url = optionId 
        ? `${SCENARIO_API}/${scenarioId}/frame?t=${time}&option=${optionId}`
        : `${SCENARIO_API}/${scenarioId}/frame?t=${time}`;
      
      const response = await fetch(url);
      const frameData = await response.json();
      return frameData;
    } catch (err) {
      console.error('Failed to load frame:', err);
      return null;
    }
  }, [scenarioId]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !scenarioInfo) return;

    const animate = async (timestamp) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = (timestamp - lastTimeRef.current) / 1000 * playbackSpeed;
      const newTime = Math.min(currentTime + deltaTime, scenarioInfo.duration);

      setCurrentTime(newTime);
      lastTimeRef.current = timestamp;

      // Load and render frame
      const frame = await loadFrame(newTime, selectedOption);
      if (frame) {
        setCurrentFrame(frame);
      }

      // Check if animation finished
      if (newTime >= scenarioInfo.duration) {
        setIsPlaying(false);
        if (onOptionResult && selectedOption) {
          // Determine result based on frame outcome
          const outcome = frame?.outcome || 'safe';
          onOptionResult({
            option: selectedOption,
            outcome,
            isCorrect: outcome === 'safe' || outcome === 'legal'
          });
        }
      } else {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = 0;
    };
  }, [isPlaying, playbackSpeed, currentTime, scenarioInfo, selectedOption, loadFrame, onOptionResult]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentFrame) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(rect.width, rect.height) * dpr;

    // Set canvas size
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // Scale for high DPI
    const scale = size / CANVAS_SIZE;
    drawDisplayList(ctx, currentFrame, scale);
  }, [currentFrame]);

  // Control functions
  const handlePlay = () => {
    if (!scenarioInfo) return;
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    lastTimeRef.current = 0;
  };

  const handleSeek = (time) => {
    setCurrentTime(Math.max(0, Math.min(time, scenarioInfo?.duration || 0)));
    lastTimeRef.current = 0;
  };

  if (loading) {
    return (
      <div className={`${className} aspect-video rounded-3xl glass-card border border-blue-500/20 shadow-depth-shadow flex items-center justify-center`}>
        <div className="flex items-center gap-3 text-slate-300">
          <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Simulyatsiya yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} aspect-video rounded-3xl glass-card border border-red-500/30 shadow-depth-shadow flex items-center justify-center`}>
        <div className="text-center text-red-400">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative rounded-3xl glass-card border border-blue-500/20 shadow-depth-shadow overflow-hidden`}>
      {/* Canvas */}
      <div className="aspect-video relative bg-slate-900/50">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* Overlay HUD */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-md border-t border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-2 h-full">
            {/* Time display */}
            <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
              <span>{Math.floor(currentTime)}s</span>
              {scenarioInfo && (
                <>
                  <span>/</span>
                  <span>{Math.floor(scenarioInfo.duration)}s</span>
                </>
              )}
            </div>
            
            {/* Playback controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                title="Reset"
              >
                ⏮
              </button>
              
              <button
                onClick={isPlaying ? handlePause : handlePlay}
                className="w-10 h-8 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 text-blue-400 flex items-center justify-center transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
            </div>

            {/* Speed control */}
            <div className="flex items-center gap-1">
              {[0.25, 0.5, 1.0, 2.0].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 text-xs rounded ${
                    playbackSpeed === speed 
                      ? 'bg-brand-blue/30 text-blue-400' 
                      : 'text-slate-400 hover:text-slate-300'
                  } transition-colors`}
                >
                  {speed}×
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {scenarioInfo && (
        <div className="absolute bottom-16 left-0 right-0 px-4">
          <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-blue to-cyan-500 transition-all duration-100"
              style={{ width: `${(currentTime / scenarioInfo.duration) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}