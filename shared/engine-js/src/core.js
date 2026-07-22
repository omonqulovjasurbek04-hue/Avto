// ============================================================
// core.js — Vec2, OBB, constants, math utilities
// ============================================================

export const LANE_WIDTH = 60;
export const VEHICLE_LENGTH = 90;
export const VEHICLE_WIDTH = 44;
export const TRAM_LENGTH = 150;
export const CANVAS_SIZE = 1000;
export const CENTRE = { x: 500, y: 500 };
export const SAFETY_GAP = 0.4;
export const TICK_DT = 1 / 60;

export const DIR_VECTORS = {
  N: { x: 0, y: -1 },
  S: { x: 0, y: 1 },
  E: { x: 1, y: 0 },
  W: { x: -1, y: 0 },
  NE: { x: 0.7071, y: -0.7071 },
  NW: { x: -0.7071, y: -0.7071 },
  SE: { x: 0.7071, y: 0.7071 },
  SW: { x: -0.7071, y: 0.7071 },
};

export const OPPOSITE = { N: 'S', S: 'N', E: 'W', W: 'E' };

export class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
  sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
  scale(s) { return new Vec2(this.x * s, this.y * s); }
  dot(v) { return this.x * v.x + this.y * v.y; }
  cross(v) { return this.x * v.y - this.y * v.x; }
  len() { return Math.hypot(this.x, this.y); }
  len2() { return this.x * this.x + this.y * this.y; }
  norm() {
    const l = this.len();
    return l > 0 ? this.scale(1 / l) : new Vec2(0, 0);
  }
  perp() { return new Vec2(-this.y, this.x); }
  distTo(v) { return this.sub(v).len(); }
  angle() { return Math.atan2(this.y, this.x); }
  lerp(v, t) { return new Vec2(this.x + (v.x - this.x) * t, this.y + (v.y - this.y) * t); }
  clone() { return new Vec2(this.x, this.y); }
}

export function vec2(x, y) { return new Vec2(x, y); }
export function vFromDir(dir) {
  const d = DIR_VECTORS[dir];
  return d ? vec2(d.x, d.y) : vec2(0, 0);
}

export class OBB {
  constructor(centre, halfW, halfH, angle) {
    this.c = centre;
    this.hw = halfW;
    this.hh = halfH;
    this.a = angle;
    this._axes = null;
    this._corners = null;
  }

  getAxes() {
    if (!this._axes) {
      const cos = Math.cos(this.a);
      const sin = Math.sin(this.a);
      this._axes = [
        vec2(cos, sin),
        vec2(-sin, cos),
      ];
    }
    return this._axes;
  }

  getCorners() {
    if (!this._corners) {
      const cos = Math.cos(this.a);
      const sin = Math.sin(this.a);
      const dx = vec2(cos * this.hw, sin * this.hw);
      const dy = vec2(-sin * this.hh, cos * this.hh);
      this._corners = [
        this.c.sub(dx).sub(dy),
        this.c.add(dx).sub(dy),
        this.c.add(dx).add(dy),
        this.c.sub(dx).add(dy),
      ];
    }
    return this._corners;
  }

  static fromVehicle(pos, heading, length, width) {
    const angle = Math.atan2(heading.y, heading.x);
    return new OBB(pos, width / 2, length / 2, angle);
  }

  overlaps(other) {
    const axes = [...this.getAxes(), ...other.getAxes()];
    for (const axis of axes) {
      const p1 = this._project(axis);
      const p2 = other._project(axis);
      if (p1.max < p2.min || p2.max < p1.min) return false;
    }
    return true;
  }

  _project(axis) {
    const corners = this.getCorners();
    let min = corners[0].dot(axis);
    let max = min;
    for (let i = 1; i < 4; i++) {
      const d = corners[i].dot(axis);
      if (d < min) min = d;
      if (d > max) max = d;
    }
    return { min, max };
  }
}

export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
export function lerp(a, b, t) { return a + (b - a) * t; }
