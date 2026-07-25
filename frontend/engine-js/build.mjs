#!/usr/bin/env node
// Builds engine.js bundle from src/ modules.
// Usage: node build.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC = path.join(__dirname, 'src');
const DEST = path.join(__dirname, 'engine.js');

function build() {
  const files = [
    'core.js', 'layout.js', 'trajectory.js',
    'simulation.js', 'outcome.js', 'scene_builder.js',
    'api.js', 'renderer.js',
  ];

  let bundle = `// AVTO (YHQ) Scenario Engine v0.1.0
// Built from: src/${files.join(', ')}
// Do not edit directly — edit src/ and run node build.mjs

(function(global) {
  'use strict';

  // ---- Vec2 class ----
  class Vec2 {
    constructor(x, y) { this.x = x; this.y = y; }
    add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
    scale(s) { return new Vec2(this.x * s, this.y * s); }
    dot(v) { return this.x * v.x + this.y * v.y; }
    len() { return Math.hypot(this.x, this.y); }
    norm() { const l = this.len(); return l > 0 ? this.scale(1/l) : new Vec2(0,0); }
    perp() { return new Vec2(-this.y, this.x); }
    distTo(v) { return this.sub(v).len(); }
    lerp(v, t) { return new Vec2(this.x + (v.x - this.x) * t, this.y + (v.y - this.y) * t); }
    clone() { return new Vec2(this.x, this.y); }
  }

  function vec2(x, y) { return new Vec2(x, y); }

  // ---- Constants ----
  const LANE_WIDTH = 60;
  const VEHICLE_LENGTH = 90;
  const VEHICLE_WIDTH = 44;
  const TRAM_LENGTH = 150;
  const CANVAS_SIZE = 1000;
  const CENTRE = { x: 500, y: 500 };
  const SAFETY_GAP = 0.4;
  const TICK_DT = 1 / 60;
  const SPEED_MS = 8;

  const DIR_VECTORS = {
    N: { x: 0, y: -1 }, S: { x: 0, y: 1 },
    E: { x: 1, y: 0 }, W: { x: -1, y: 0 },
  };

  const OPPOSITE = { N: 'S', S: 'N', E: 'W', W: 'E' };

  // ---- OBB ----
  class OBB {
    constructor(c, hw, hh, a) { this.c = c; this.hw = hw; this.hh = hh; this.a = a; this._corners = null; }
    getCorners() {
      if (!this._corners) {
        const cos = Math.cos(this.a), sin = Math.sin(this.a);
        const dx = vec2(cos * this.hw, sin * this.hw);
        const dy = vec2(-sin * this.hh, cos * this.hh);
        this._corners = [this.c.sub(dx).sub(dy), this.c.add(dx).sub(dy), this.c.add(dx).add(dy), this.c.sub(dx).add(dy)];
      }
      return this._corners;
    }
    overlaps(other) {
      const ca = this.getCorners(), cb = other.getCorners();
      const axes = this._getAxes().concat(other._getAxes());
      for (const axis of axes) {
        const p1 = project(ca, axis), p2 = project(cb, axis);
        if (p1.max < p2.min || p2.max < p1.min) return false;
      }
      return true;
    }
    _getAxes() {
      const cos = Math.cos(this.a), sin = Math.sin(this.a);
      return [vec2(cos, sin), vec2(-sin, cos)];
    }
    static fromVehicle(pos, heading, length, width) {
      return new OBB(pos, width / 2, length / 2, Math.atan2(heading.y, heading.x));
    }
  }

  function project(corners, axis) {
    let min = corners[0].dot(axis), max = min;
    for (let i = 1; i < 4; i++) { const d = corners[i].dot(axis); if (d < min) min = d; if (d > max) max = d; }
    return { min, max };
  }

  // ---- Layout derivation ----
  function deriveLayout(scene) {
    const roads = scene.roads || [];
    const roadGeom = {};
    for (const r of roads) {
      const d = DIR_VECTORS[r.dir]; if (!d) continue;
      const halfW = (r.lanes_in + r.lanes_out) * LANE_WIDTH / 2;
      const perp = vec2(-d.y, d.x);
      const ce = vec2(CENTRE.x + d.x * CANVAS_SIZE, CENTRE.y + d.y * CANVAS_SIZE);
      roadGeom[r.dir] = {
        dir: r.dir, priority: r.priority, halfW,
        polygon: [
          vec2(CENTRE.x + perp.x * halfW, CENTRE.y + perp.y * halfW),
          vec2(CENTRE.x - perp.x * halfW, CENTRE.y - perp.y * halfW),
          vec2(ce.x - perp.x * halfW, ce.y - perp.y * halfW),
          vec2(ce.x + perp.x * halfW, ce.y + perp.y * halfW),
        ],
        entryPoint: vec2(CENTRE.x + (d.x * CANVAS_SIZE), CENTRE.y + (d.y * CANVAS_SIZE)),
        stopPoint: vec2(CENTRE.x + d.x * LANE_WIDTH * 1.5, CENTRE.y + d.y * LANE_WIDTH * 1.5),
      };
    }
    return { roads: roadGeom };
  }

  function vFromDir(dir) { const d = DIR_VECTORS[dir]; return d ? vec2(d.x, d.y) : vec2(0, 0); }

  // ---- Trajectory generation ----
  function buildTrajectory(entry, exit, fromDir, toDir) {
    const pts = toDir === fromDir
      ? [entry, vec2(CENTRE.x, CENTRE.y), exit]
      : [entry, vec2(CENTRE.x, CENTRE.y), exit];
    const totalLen = arcLen(pts, 50);
    return { points: pts, totalLength: totalLen };
  }

  function arcLen(pts, n) {
    let total = 0;
    for (let i = 1; i <= n; i++) {
      const a = evalPt(pts, (i - 1) / n), b = evalPt(pts, i / n);
      total += a.distTo(b);
    }
    return total;
  }

  function evalPt(pts, t) {
    if (pts.length === 2) return pts[0].lerp(pts[1], t);
    if (pts.length === 3) return quadBez(pts[0], pts[1], pts[2], t);
    return cubicBez(pts[0], pts[1], pts[2], pts[3], t);
  }

  function quadBez(p0, p1, p2, t) { const m = 1 - t; return vec2(m*m*p0.x + 2*m*t*p1.x + t*t*p2.x, m*m*p0.y + 2*m*t*p1.y + t*t*p2.y); }
  function cubicBez(p0, p1, p2, p3, t) { const m = 1 - t; return vec2(m*m*m*p0.x + 3*m*m*t*p1.x + 3*m*t*t*p2.x + t*t*t*p3.x, m*m*m*p0.y + 3*m*m*t*p1.y + 3*m*t*t*p2.y + t*t*t*p3.y); }

  function sampleTrajectory(traj, dist) {
    const t = Math.max(0, Math.min(1, dist / traj.totalLength));
    return { position: evalPt(traj.points, t), progress: t };
  }

  // ---- Simulation ----
  function simulateOrder(scenario, order) {
    const layout = deriveLayout(scenario.scene);
    const actors = {};
    for (const a of scenario.actors) actors[a.id] = a;

    const entries = order.map((id) => {
      const a = actors[id]; if (!a) return null;
      const entry = layout.roads[a.from]?.entryPoint || vec2(CENTRE.x, CENTRE.y);
      const dir = DIR_VECTORS[a.from];
      const exit = vec2(CENTRE.x - dir.x * CANVAS_SIZE, CENTRE.y - dir.y * CANVAS_SIZE);
      const traj = buildTrajectory(entry, exit, a.from, a.to);
      return { id, actor: a, traj, dist: 0, speed: SPEED_MS, releaseTime: 0 };
    }).filter(Boolean);

    const active = [];
    const frames = [];
    let collision = null;

    for (let tick = 0; tick <= 600; tick++) {
      const time = tick * TICK_DT;
      while (entries.length > 0 && time >= (active.length > 0 ? active[active.length - 1].releaseTime + SAFETY_GAP : 0)) {
        active.push(entries.shift());
      }
      for (const a of active) a.dist += a.speed * TICK_DT;

      // collision detection
      for (let i = 0; i < active.length && !collision; i++) {
        for (let j = i + 1; j < active.length && !collision; j++) {
          const si = sampleTrajectory(active[i].traj, active[i].dist);
          const sj = sampleTrajectory(active[j].traj, active[j].dist);
          const oi = OBB.fromVehicle(si.position, vec2(1, 0), actors[active[i].id]?.kind === 'tram' ? TRAM_LENGTH : VEHICLE_LENGTH, VEHICLE_WIDTH);
          const oj = OBB.fromVehicle(sj.position, vec2(1, 0), actors[active[j].id]?.kind === 'tram' ? TRAM_LENGTH : VEHICLE_LENGTH, VEHICLE_WIDTH);
          if (oi.overlaps(oj)) collision = { tick, actorA: active[i].id, actorB: active[j].id };
        }
      }

      const state = { actors: active.map((a) => {
        const s = sampleTrajectory(a.traj, a.dist);
        return { id: a.id, x: s.position.x, y: s.position.y, progress: s.progress };
      })};
      frames.push(state);
      if (collision) break;

      active.forEach((a) => { if (a.dist >= a.traj.totalLength) a.done = true; });
      for (let i = active.length - 1; i >= 0; i--) {
        if (active[i].done) active.splice(i, 1);
      }
      if (active.length === 0 && entries.length === 0 && tick > 10) break;
    }

    return { frames, collision };
  }

  // ---- Outcome classification ----
  function classifyOption(scenario, optionId) {
    const opt = scenario.question.options.find((o) => o.id === optionId);
    if (!opt) return { optionId, clean: false, type: 'unknown' };
    if (optionId === scenario.question.correct) {
      return { optionId, clean: true, type: 'correct', playback: simulateOrder(scenario, scenario.resolution.order) };
    }
    const refersTo = opt.refers_to || scenario.actors[0]?.id;
    const order = [refersTo, ...scenario.resolution.order.filter((id) => id !== refersTo)];
    const playback = simulateOrder(scenario, order);
    let type = 'unnecessary_wait';
    if (playback.collision) type = 'collision';
    else {
      const playerRoad = scenario.scene.roads.find((r) => r.dir === scenario.actors.find((a) => a.id === refersTo)?.from);
      if (playerRoad && playerRoad.priority !== 'main') type = 'priority_violation';
    }
    return { optionId, clean: false, type, playback };
  }

  // ---- Scene builder ----
  const GRASS = 0xFF1A2E1A, ROAD = 0xFF334155, MARKING = 0xFF94A3B8;
  const CAR = 0xFF3B82F6, EGO = 0xFF10B981;

  function buildScene(scenario) {
    const layout = deriveLayout(scenario.scene);
    const ops = [];
    ops.push({ type: 'fillPolygon', points: [vec2(0,0), vec2(1000,0), vec2(1000,1000), vec2(0,1000)], colour: GRASS });
    for (const dir of Object.keys(layout.roads)) {
      const r = layout.roads[dir];
      ops.push({ type: 'fillPolygon', points: r.polygon, colour: ROAD });
      const d = DIR_VECTORS[dir], perp = vec2(-d.y, d.x);
      ops.push({ type: 'strokePath', points: [vec2(CENTRE.x + perp.x*r.halfW, CENTRE.y + perp.y*r.halfW), vec2(CENTRE.x - perp.x*r.halfW, CENTRE.y - perp.y*r.halfW)], colour: MARKING, width: 1, dash: [8,6] });
    }
    for (const m of (scenario.scene.markings || [])) {
      const r = layout.roads[m.at]; if (!r) continue;
      const d = DIR_VECTORS[m.at], perp = vec2(-d.y, d.x);
      const depth = LANE_WIDTH * 1.5;
      ops.push({ type: 'strokePath', points: [vec2(CENTRE.x + perp.x*r.halfW + d.x*depth, CENTRE.y + perp.y*r.halfW + d.y*depth), vec2(CENTRE.x - perp.x*r.halfW + d.x*depth, CENTRE.y - perp.y*r.halfW + d.y*depth)], colour: 0xFFFFFFFF, width: 3, dash: m.type === 'give_way_line' ? [10,8] : null });
    }
    for (const s of (scenario.scene.signs || [])) {
      const r = layout.roads[s.at]; if (!r) continue;
      const d = DIR_VECTORS[s.at], perp = vec2(-d.y, d.x);
      const pos = vec2(CENTRE.x + perp.x*(r.halfW+20) + d.x*LANE_WIDTH*1.5, CENTRE.y + perp.y*(r.halfW+20) + d.y*LANE_WIDTH*1.5);
      ops.push({ type: 'fillCircle', centre: pos, radius: 12, colour: s.code.startsWith('2') ? 0xFFFFDD00 : 0xFFEF4444 });
      ops.push({ type: 'fillCircle', centre: pos, radius: 8, colour: 0xFFFFFFFF });
    }
    for (const a of scenario.actors) {
      const r = layout.roads[a.from]; if (!r) continue;
      const d = DIR_VECTORS[a.from];
      const pos = r.entryPoint;
      const colour = a.role === 'player' ? EGO : CAR;
      const hw = 22, hh = a.kind === 'tram' ? 75 : 45;
      const cos = a.kind === 'tram' ? 0 : 1, sin = 0;
      ops.push({ type: 'fillPolygon', points: [vec2(pos.x - hw, pos.y - hh), vec2(pos.x + hw, pos.y - hh), vec2(pos.x + hw, pos.y + hh), vec2(pos.x - hw, pos.y + hh)], colour });
    }
    return { ops, warnings: [] };
  }

  function buildFrame(scenario, frameState) {
    const base = buildScene(scenario);
    if (frameState && frameState.actors) {
      for (const a of frameState.actors) {
        const colour = CAR;
        const hw = 22, hh = 45;
        const pos = vec2(a.x || 500, a.y || 500);
        base.ops.push({ type: 'fillPolygon', points: [vec2(pos.x - hw, pos.y - hh), vec2(pos.x + hw, pos.y - hh), vec2(pos.x + hw, pos.y + hh), vec2(pos.x - hw, pos.y + hh)], colour });
      }
    }
    return base;
  }

  // ---- Public API ----
  function sceneInfo(json) {
    try {
      const s = JSON.parse(json);
      const correctOrder = s.resolution.order;
      const playback = simulateOrder(s, correctOrder);
      const options = {};
      for (const o of s.question.options) {
        const result = classifyOption(s, o.id);
        options[o.id] = { clean: result.clean, type: result.clean ? null : result.type, duration: result.playback ? result.playback.frames.length / 60 : 5 };
      }
      return { options, duration: playback.frames.length / 60, warnings: [] };
    } catch (e) { return { error: e.message }; }
  }

  function buildFrameJson(json, t) {
    try {
      const s = JSON.parse(json);
      const playback = simulateOrder(s, s.resolution.order);
      const idx = Math.min(Math.max(0, Math.floor(t * 60)), playback.frames.length - 1);
      return buildFrame(s, playback.frames[idx]);
    } catch (e) { return { error: e.message }; }
  }

  function optionFrameJson(json, optId, t) {
    try {
      const s = JSON.parse(json);
      const result = classifyOption(s, optId);
      if (!result.playback) return { ops: [] };
      const idx = Math.min(Math.max(0, Math.floor(t * 60)), result.playback.frames.length - 1);
      return buildFrame(s, result.playback.frames[idx]);
    } catch (e) { return { error: e.message }; }
  }

  function buildSceneJson(json) {
    try { return buildScene(JSON.parse(json)); }
    catch (e) { return { error: e.message }; }
  }

  // ---- Canvas renderer ----
  function drawDisplayList(ctx, frame, opts) {
    const scale = (opts?.size || CANVAS_SIZE) / CANVAS_SIZE;
    ctx.save();
    ctx.scale(scale, scale);
    const ops = frame.ops || [];
    for (const op of ops) {
      switch (op.type) {
        case 'fillPolygon': {
          const p = op.points;
          ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y);
          for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
          ctx.closePath(); ctx.fillStyle = argb(op.colour); ctx.fill();
          break;
        }
        case 'strokePath': {
          const p = op.points;
          ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y);
          for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
          if (op.dash) ctx.setLineDash(op.dash);
          ctx.strokeStyle = argb(op.colour); ctx.lineWidth = op.width || 2; ctx.stroke();
          ctx.setLineDash([]);
          break;
        }
        case 'fillCircle': {
          ctx.beginPath(); ctx.arc(op.centre.x, op.centre.y, op.radius || 5, 0, Math.PI * 2);
          ctx.fillStyle = argb(op.colour); ctx.fill();
          break;
        }
      }
    }
    ctx.restore();
  }

  function argb(c) {
    return 'rgba(' + ((c>>16)&255) + ',' + ((c>>8)&255) + ',' + (c&255) + ',' + (((c>>24)&255)/255) + ')';
  }

  // ---- Register ----
  const engine = {
    buildScene: buildSceneJson,
    buildFrame: buildFrameJson,
    sceneInfo: sceneInfo,
    optionFrame: optionFrameJson,
    drawDisplayList: drawDisplayList,
    version: '0.1.0',
  };

  global.__yhqEngine = engine;
  global.__yhqDraw = drawDisplayList;

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
`;

  fs.writeFileSync(DEST, bundle, 'utf8');
  console.log(`Built engine bundle: ${DEST} (${(bundle.length / 1024).toFixed(1)} KB)`);
}

build();
