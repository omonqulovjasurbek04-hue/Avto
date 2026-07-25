// ============================================================
// renderer.js — Canvas 2D display list renderer
// ============================================================

const CANVAS_SIZE = 1000;

export function drawDisplayList(ctx, frame, opts = {}) {
  const size = opts.size || CANVAS_SIZE;
  const scale = size / CANVAS_SIZE;
  const ops = frame.ops || [];

  ctx.save();
  ctx.scale(scale, scale);

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

function argbToRgba(argb) {
  const a = ((argb >> 24) & 0xFF) / 255;
  const r = (argb >> 16) & 0xFF;
  const g = (argb >> 8) & 0xFF;
  const b = argb & 0xFF;
  return `rgba(${r},${g},${b},${a})`;
}
