// ============================================================
// trajectory.js — Bézier curve generation and arc-length param
// ============================================================

import { CENTRE, vec2 } from './core.js';

export function buildTrajectory(entry, exit, fromDir, toDir) {
  const isStraight = fromDir === toDir;
  const isRight = isRightTurn(fromDir, toDir);
  const isLeft = isLeftTurn(fromDir, toDir);
  const isUTurn = fromDir === toDir;

  let curve;
  if (isUTurn) {
    curve = buildUTurn(entry, exit, fromDir);
  } else if (isRight) {
    curve = buildRightTurn(entry, exit, fromDir);
  } else if (isLeft) {
    curve = buildLeftTurn(entry, exit, fromDir, toDir);
  } else {
    curve = buildStraight(entry, exit);
  }

  return arcLengthParameterize(curve);
}

function isRightTurn(from, to) {
  const order = ['N', 'E', 'S', 'W'];
  const fi = order.indexOf(from);
  const ti = order.indexOf(to);
  if (fi === -1 || ti === -1) return false;
  return (ti - fi + 4) % 4 === 1;
}

function isLeftTurn(from, to) {
  const order = ['N', 'E', 'S', 'W'];
  const fi = order.indexOf(from);
  const ti = order.indexOf(to);
  if (fi === -1 || ti === -1) return false;
  return (ti - fi + 4) % 4 === 3;
}

function buildStraight(entry, exit) {
  return { type: 'linear', points: [entry, exit] };
}

function buildRightTurn(entry, exit, fromDir) {
  const perp = turnPerp(fromDir, 'right');
  const cp = vec2(
    CENTRE.x + perp.x * 40,
    CENTRE.y + perp.y * 40,
  );
  return { type: 'quadratic', points: [entry, cp, exit] };
}

function buildLeftTurn(entry, exit, fromDir, toDir) {
  const perp1 = turnPerp(fromDir, 'left');
  const perp2 = turnPerp(toDir, 'right');
  const cp1 = vec2(
    CENTRE.x + perp1.x * 60,
    CENTRE.y + perp1.y * 60,
  );
  const cp2 = vec2(
    CENTRE.x + perp2.x * 60,
    CENTRE.y + perp2.y * 60,
  );
  return { type: 'cubic', points: [entry, cp1, cp2, exit] };
}

function buildUTurn(entry, exit, fromDir) {
  const perp = turnPerp(fromDir, 'right');
  const cp1 = vec2(
    CENTRE.x + perp.x * 30,
    CENTRE.y + perp.y * 30,
  );
  const cp2 = vec2(
    CENTRE.x - perp.x * 30,
    CENTRE.y - perp.y * 30,
  );
  return { type: 'cubic', points: [entry, cp1, cp2, exit] };
}

function turnPerp(dir, side) {
  const map = {
    N: { left: vec2(-1, 0), right: vec2(1, 0) },
    S: { left: vec2(1, 0), right: vec2(-1, 0) },
    E: { left: vec2(0, -1), right: vec2(0, 1) },
    W: { left: vec2(0, 1), right: vec2(0, -1) },
  };
  return map[dir]?.[side] || vec2(0, 0);
}

export function evaluateCurve(curve, t) {
  const pts = curve.points;
  switch (curve.type) {
    case 'linear':
      return lerpPt(pts[0], pts[pts.length - 1], t);
    case 'quadratic':
      return quadraticBezier(pts[0], pts[1], pts[2], t);
    case 'cubic':
      return cubicBezier(pts[0], pts[1], pts[2], pts[3], t);
    default:
      return pts[0];
  }
}

function quadraticBezier(p0, p1, p2, t) {
  const mt = 1 - t;
  return vec2(
    mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  );
}

function cubicBezier(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return vec2(
    mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
    mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y,
  );
}

function lerpPt(a, b, t) {
  return vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
}

function arcLengthParameterize(curve, samples = 100) {
  const table = [{ t: 0, s: 0 }];
  let total = 0;
  let prev = evaluateCurve(curve, 0);
  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const pt = evaluateCurve(curve, t);
    total += pt.distTo(prev);
    table.push({ t, s: total });
    prev = pt;
  }
  return { curve, table, totalLength: total };
}

export function sampleAtDistance(paramCurve, distance) {
  const { curve, table, totalLength } = paramCurve;
  const clamped = Math.max(0, Math.min(distance, totalLength));
  let lo = 0, hi = table.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (table[mid].s <= clamped) lo = mid;
    else hi = mid;
  }
  const a = table[lo], b = table[hi];
  const seg = b.s - a.s || 1;
  const t = a.t + (b.t - a.t) * (clamped - a.s) / seg;
  return {
    position: evaluateCurve(curve, t),
    tangent: tangentAt(curve, t),
    progress: clamped / totalLength,
  };
}

function tangentAt(curve, t, eps = 0.001) {
  const p1 = evaluateCurve(curve, Math.max(0, t - eps));
  const p2 = evaluateCurve(curve, Math.min(1, t + eps));
  return p2.sub(p1).norm();
}
