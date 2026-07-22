// ============================================================
// api.js — Public API entry points (matches __yhqEngine interface)
// ============================================================

import { buildScene, buildFrame } from './scene_builder.js';
import { buildPlayback, buildCorrectPlayback } from './simulation.js';
import { classifyOption } from './outcome.js';
import { sampleAtDistance } from './trajectory.js';

export function sceneInfo(scenarioJson) {
  try {
    const scenario = JSON.parse(scenarioJson);
    const correctPlayback = buildCorrectPlayback(scenario);
    const options = {};

    for (const opt of scenario.question.options) {
      const result = classifyOption(scenario, opt.id);
      options[opt.id] = {
        clean: result.clean || false,
        type: result.clean ? null : (result.type || 'unknown'),
        duration: result.playback ? result.playback.frames.length / 60 : 5,
      };
    }

    const duration = correctPlayback.frames.length / 60;
    const warnings = [];

    if (duration < 4 || duration > 9) {
      warnings.push(`Playback duration ${duration.toFixed(1)}s outside target 4-9s`);
    }

    return JSON.stringify({ options, duration, warnings });
  } catch (err) {
    return JSON.stringify({ error: err.message });
  }
}

export function buildFrameJson(scenarioJson, t) {
  try {
    const scenario = JSON.parse(scenarioJson);
    const playback = buildCorrectPlayback(scenario);
    const frameIndex = Math.min(
      Math.floor(t * 60),
      playback.frames.length - 1,
    );
    const frameState = playback.frames[frameIndex] || { actors: [] };
    const scene = buildFrame(scenario, frameState);
    return JSON.stringify(scene);
  } catch (err) {
    return JSON.stringify({ error: err.message });
  }
}

export function optionFrameJson(scenarioJson, optionId, t) {
  try {
    const scenario = JSON.parse(scenarioJson);
    const result = classifyOption(scenario, optionId);
    if (!result.playback) {
      return JSON.stringify({ ops: [], warnings: ['No playback data'] });
    }
    const frameIndex = Math.min(
      Math.floor(t * 60),
      result.playback.frames.length - 1,
    );
    const frameState = result.playback.frames[frameIndex] || { actors: [] };
    const scene = buildFrame(scenario, frameState);
    return JSON.stringify(scene);
  } catch (err) {
    return JSON.stringify({ error: err.message });
  }
}

export function buildSceneJson(scenarioJson) {
  try {
    const scenario = JSON.parse(scenarioJson);
    const scene = buildScene(scenario);
    return JSON.stringify(scene);
  } catch (err) {
    return JSON.stringify({ error: err.message });
  }
}

export const version = '0.1.0';
