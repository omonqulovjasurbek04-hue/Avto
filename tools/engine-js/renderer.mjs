// Replays an engine display list on a Canvas 2D context.
//
// This is the ONLY drawing code in the JS stack. It knows how to fill a
// polygon, stroke a path and fill a circle — nothing about roads, lanes or
// layering, all of which live in the engine. It is byte-for-byte the same
// contract the browser viewer uses, so web and viewer cannot diverge.

/** @param {number} argb */
function rgba(argb) {
  const a = ((argb >>> 24) & 0xff) / 255;
  return `rgba(${(argb >> 16) & 0xff},${(argb >> 8) & 0xff},${argb & 0xff},${a})`;
}

function tracePoints(ctx, flat, closed) {
  ctx.beginPath();
  ctx.moveTo(flat[0], flat[1]);
  for (let i = 2; i < flat.length; i += 2) ctx.lineTo(flat[i], flat[i + 1]);
  if (closed) ctx.closePath();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {import("./types.d.ts").Frame} frame
 * @param {{ size: number }} opts  pixel size of the (square) canvas
 */
export function drawDisplayList(ctx, frame, { size }) {
  const s = size / frame.canvas;
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.clearRect(0, 0, frame.canvas, frame.canvas);
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";

  for (const op of frame.ops) {
    switch (op.op) {
      case "fillPolygon":
        tracePoints(ctx, op.points, true);
        ctx.fillStyle = rgba(op.colour);
        ctx.fill();
        break;
      case "strokePath":
        tracePoints(ctx, op.points, op.closed);
        ctx.strokeStyle = rgba(op.colour);
        ctx.lineWidth = op.width;
        ctx.setLineDash(op.dash || []);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      case "fillCircle":
        ctx.beginPath();
        ctx.arc(op.centre[0], op.centre[1], op.radius, 0, Math.PI * 2);
        ctx.fillStyle = rgba(op.colour);
        ctx.fill();
        break;
    }
  }
}
