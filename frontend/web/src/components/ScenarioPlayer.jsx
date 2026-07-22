import React, { useEffect, useRef, useState } from 'react';
import { PlaybackBar } from './PlaybackBar';
import { OptionsList } from './OptionsList';
import { OutcomeBanner } from './OutcomeBanner';
import { RuleExplanation } from './RuleExplanation';

export function ScenarioPlayer({ scenarioData, lang = 'uz', onAnswerSelected }) {
  const canvasRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [playbackMode, setPlaybackMode] = useState('user');
  const [sceneInfoData, setSceneInfoData] = useState(null);
  const [userResult, setUserResult] = useState(null);

  const rawJsonStr = JSON.stringify(scenarioData);

  useEffect(() => {
    setSelectedOption(null);
    setUserResult(null);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [scenarioData?.id]);

  useEffect(() => {
    if (window.__yhqEngine && scenarioData) {
      try {
        const info = window.__yhqEngine.sceneInfo(rawJsonStr);
        const parsed = typeof info === 'string' ? JSON.parse(info) : info;
        setSceneInfoData(parsed);
      } catch (err) {
        console.error('Failed to parse scene info from engine', err);
      }
    }
  }, [scenarioData, rawJsonStr]);

  const maxTime =
    (selectedOption && sceneInfoData?.options?.[selectedOption]?.duration) ??
    sceneInfoData?.duration ??
    5.0;

  useEffect(() => {
    let animId;
    let lastStamp = performance.now();

    const renderStep = (now) => {
      const delta = (now - lastStamp) / 1000;
      lastStamp = now;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + delta * playbackSpeed;
          if (next >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return next;
        });
      }

      if (canvasRef.current && window.__yhqEngine) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          const rect = canvas.getBoundingClientRect();
          const displayWidth = Math.round(rect.width * dpr);
          const displayHeight = Math.round(rect.height * dpr);

          if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth || 900;
            canvas.height = displayHeight || 900;
          }

          let frameObj;
          if (playbackMode === 'user' && selectedOption) {
            const raw = window.__yhqEngine.optionFrame(rawJsonStr, selectedOption, currentTime);
            frameObj = typeof raw === 'string' ? JSON.parse(raw) : raw;
          } else {
            const raw = window.__yhqEngine.buildFrame(rawJsonStr, currentTime);
            frameObj = typeof raw === 'string' ? JSON.parse(raw) : raw;
          }

          if (frameObj && !frameObj.error) {
            if (window.__yhqDraw) {
              window.__yhqDraw(ctx, frameObj, { size: canvas.width });
            } else {
              drawCanvasFallback(ctx, frameObj, canvas.width);
            }
          }
        }
      }

      animId = requestAnimationFrame(renderStep);
    };

    animId = requestAnimationFrame(renderStep);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, currentTime, playbackSpeed, selectedOption, playbackMode, rawJsonStr, maxTime]);

  const handleSelectOption = (optionId) => {
    setSelectedOption(optionId);
    setPlaybackMode('user');
    setCurrentTime(0);
    setIsPlaying(true);

    if (sceneInfoData && sceneInfoData.options[optionId]) {
      const outcome = sceneInfoData.options[optionId];
      setUserResult({
        correct: !!outcome.clean,
        type: outcome.clean ? 'correct' : outcome.type || 'collision',
      });
    }

    if (onAnswerSelected) onAnswerSelected(optionId);
  };

  const questionText = scenarioData?.question?.text?.[lang] || scenarioData?.question?.text?.['uz'] || '';
  const options = scenarioData?.question?.options || [];
  const correctId = scenarioData?.question?.correct;
  const ruleCode = scenarioData?.resolution?.rule?.code || '';
  const ruleText = scenarioData?.resolution?.rule?.text || null;

  return (
    <div className="grid-2col">
      <div className="stage-card">
        <div className="canvas-wrapper">
          <canvas ref={canvasRef} width={900} height={900} className="scenario-canvas" />
        </div>

        <PlaybackBar
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          currentTime={currentTime}
          maxTime={maxTime}
          onSeek={setCurrentTime}
          playbackSpeed={playbackSpeed}
          onSpeedChange={setPlaybackSpeed}
          onReplay={() => { setCurrentTime(0); setIsPlaying(true); }}
        />
      </div>

      <div className="meta-card">
        <span className="topic-tag">
          {scenarioData?.topic?.replace(/_/g, ' ') || 'Mavzu'}
        </span>

        <h2 className="question-title">{questionText}</h2>

        <OptionsList
          options={options}
          lang={lang}
          selectedOption={selectedOption}
          userResult={userResult}
          correctId={correctId}
          onSelect={handleSelectOption}
        />

        <OutcomeBanner userResult={userResult} />
        <RuleExplanation ruleCode={ruleCode} ruleText={ruleText} lang={lang} />
      </div>
    </div>
  );
}

function drawCanvasFallback(ctx, frame, size) {
  const scale = size / 1000;
  const ops = frame.ops || [];
  ctx.save();
  ctx.scale(scale, scale);
  for (const op of ops) {
    switch (op.type) {
      case 'fillPolygon': {
        const p = op.points;
        if (p && p.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(p[0].x, p[0].y);
          for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
          ctx.closePath();
          ctx.fillStyle = argb(op.colour);
          ctx.fill();
        }
        break;
      }
      case 'strokePath': {
        const p = op.points;
        if (p && p.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(p[0].x, p[0].y);
          for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
          if (op.dash) ctx.setLineDash(op.dash);
          ctx.strokeStyle = argb(op.colour);
          ctx.lineWidth = op.width || 2;
          ctx.stroke();
          ctx.setLineDash([]);
        }
        break;
      }
      case 'fillCircle': {
        ctx.beginPath();
        ctx.arc(op.centre.x, op.centre.y, op.radius || 5, 0, Math.PI * 2);
        ctx.fillStyle = argb(op.colour);
        ctx.fill();
        break;
      }
    }
  }
  ctx.restore();
}

function argb(c) {
  return `rgba(${(c >> 16) & 255},${(c >> 8) & 255},${c & 255},${((c >> 24) & 255) / 255})`;
}
