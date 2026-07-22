import React, { useEffect, useRef, useState } from 'react';
import { drawDisplayList } from '@yhq/engine/renderer';

export function ScenarioPlayer({ scenarioData, lang = 'uz', onAnswerSelected }) {
  const canvasRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [playbackMode, setPlaybackMode] = useState('user'); // 'user' | 'correct'
  const [sceneInfoData, setSceneInfoData] = useState(null);
  const [userResult, setUserResult] = useState(null);

  const rawJsonStr = JSON.stringify(scenarioData);

  // Initialize scene info using engine
  useEffect(() => {
    if (window.__yhqEngine && scenarioData) {
      try {
        const info = JSON.parse(window.__yhqEngine.sceneInfo(rawJsonStr));
        setSceneInfoData(info);
      } catch (err) {
        console.error("Failed to parse scene info from engine", err);
      }
    }
  }, [scenarioData]);

  // Playback length: the engine reports a duration per option (a collision
  // freezes early), so a chosen answer scrubs over its own timeline; otherwise
  // the correct-answer duration. Field name is `duration` (see sceneInfo).
  const maxTime =
    (selectedOption && sceneInfoData?.options?.[selectedOption]?.duration) ??
    sceneInfoData?.duration ??
    5.0;

  // Animation Loop
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

      // Draw current frame onto Canvas
      if (canvasRef.current && window.__yhqEngine) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          let frameJson;
          if (playbackMode === 'user' && selectedOption) {
            frameJson = window.__yhqEngine.optionFrame(rawJsonStr, selectedOption, currentTime);
          } else {
            frameJson = window.__yhqEngine.buildFrame(rawJsonStr, currentTime);
          }
          if (frameJson) {
            const frameObj = JSON.parse(frameJson);
            drawDisplayList(ctx, frameObj, { size: canvasRef.current.width });
          }
        }
      }

      animId = requestAnimationFrame(renderStep);
    };

    animId = requestAnimationFrame(renderStep);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, currentTime, playbackSpeed, selectedOption, playbackMode, rawJsonStr, maxTime]);

  const handleSelectOption = async (optionId) => {
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

    if (onAnswerSelected) {
      onAnswerSelected(optionId);
    }
  };

  const questionText = scenarioData?.question?.text?.[lang] || scenarioData?.question?.text?.['uz'] || '';
  const options = scenarioData?.question?.options || [];
  const correctId = scenarioData?.question?.correct;
  const ruleText = scenarioData?.resolution?.rule?.text?.[lang] || scenarioData?.resolution?.rule?.text?.['uz'] || '';
  const ruleCode = scenarioData?.resolution?.rule?.code || '';

  return (
    <div className="grid-2col">
      {/* Canvas & Playback Stage */}
      <div className="stage-card">
        <div className="canvas-wrapper">
          <canvas ref={canvasRef} width={900} height={900} className="scenario-canvas" />
        </div>

        <div className="playback-bar">
          <button
            className="btn-icon"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pauza" : "O'ynatish"}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <input
            type="range"
            min="0"
            max={maxTime}
            step="0.01"
            value={currentTime}
            onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
            className="timeline-scrubber"
          />

          <span className="clock-badge">{currentTime.toFixed(1)}s</span>

          <div className="speed-selector">
            {[0.25, 0.5, 1].map((s) => (
              <button
                key={s}
                className={`speed-btn ${playbackSpeed === s ? 'active' : ''}`}
                onClick={() => setPlaybackSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            className="btn-icon"
            onClick={() => {
              setCurrentTime(0);
              setIsPlaying(true);
            }}
            title="Qaytadan"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Question Metadata & Option Selection */}
      <div className="meta-card">
        <span className="topic-tag">{scenarioData?.topic?.replace(/_/g, ' ') || 'Mavzu'}</span>

        <h2 className="question-title">{questionText}</h2>

        <div className="options-list">
          {options.map((opt) => {
            const label = opt.label?.[lang] || opt.label?.['uz'] || '';
            const isSelected = selectedOption === opt.id;
            const isCorrect = opt.id === correctId;
            let extraClass = '';
            if (userResult) {
              if (isSelected && userResult.correct) extraClass = 'correct-highlight';
              if (isSelected && !userResult.correct) extraClass = 'wrong-highlight';
            }

            return (
              <button
                key={opt.id}
                className={`option-btn ${isSelected ? 'selected' : ''} ${extraClass}`}
                onClick={() => handleSelectOption(opt.id)}
              >
                <span>{label}</span>
                {isSelected && userResult?.correct && <span>✅</span>}
                {isSelected && !userResult?.correct && <span>❌</span>}
              </button>
            );
          })}
        </div>

        {/* Outcome Feedback Banner */}
        {userResult && (
          <div className={`outcome-banner ${userResult.type}`}>
            {userResult.correct ? (
              <>
                <span>✅</span>
                <div>
                  <div>To'g'ri javob!</div>
                  <div style={{ fontSize: '12px', fontWeight: 400 }}>Chorrahadan xavfsiz va qoidaga muvofiq o'tildi.</div>
                </div>
              </>
            ) : (
              <>
                <span>💥</span>
                <div>
                  <div>
                    {userResult.type === 'collision' && "Diqqat: To'qnashuv yuz berdi!"}
                    {userResult.type === 'priority_violation' && "Xato: Asosiy yo'ldagi transportga yo'l berilmadi!"}
                    {userResult.type === 'unnecessary_wait' && "Xato: Imtiyozga ega bo'lsangiz ham bekorga kutdingiz!"}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginTop: '4px', color: '#cbd5e1' }}>
                    Animatsiyada {userResult.type === 'collision' ? "qizil ramka bilan to'qnashuv nuqtasi" : "xato manevr"} ko'rsatildi. Iltimos, xavfsizlik qoidasiga va o'tish ketma-ketligiga e'tibor qarating!
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Rule Explanation */}
        {userResult && ruleText && (
          <div className="rule-box">
            <div className="rule-code">YHQ {ruleCode}-band:</div>
            <div>{ruleText}</div>
          </div>
        )}
      </div>
    </div>
  );
}
