import React from 'react';

export function PlaybackBar({ isPlaying, onTogglePlay, currentTime, maxTime, onSeek, playbackSpeed, onSpeedChange, onReplay }) {
  return (
    <div className="playback-bar">
      <button className="btn-icon" onClick={onTogglePlay} title={isPlaying ? 'Pauza' : "O'ynatish"}>
        {isPlaying ? '⏸' : '▶'}
      </button>

      <input
        type="range"
        min="0"
        max={maxTime}
        step="0.01"
        value={currentTime}
        onChange={(e) => onSeek(parseFloat(e.target.value))}
        className="timeline-scrubber"
      />

      <span className="clock-badge">{currentTime.toFixed(1)}s</span>

      <div className="speed-selector">
        {[0.25, 0.5, 1].map((s) => (
          <button
            key={s}
            className={`speed-btn ${playbackSpeed === s ? 'active' : ''}`}
            onClick={() => onSpeedChange(s)}
          >
            {s}x
          </button>
        ))}
      </div>

      <button className="btn-icon" onClick={onReplay} title="Qaytadan">↺</button>
    </div>
  );
}
