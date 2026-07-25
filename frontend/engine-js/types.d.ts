// Shapes the compiled engine emits. These mirror engine_dart's display list;
// they are documentation for JS consumers, not a second source of truth.

/** 32-bit ARGB colour, as the engine encodes it. */
export type Argb = number;

export interface FillPolygonOp {
  op: "fillPolygon";
  /** Flattened [x0, y0, x1, y1, ...] in logical canvas units. */
  points: number[];
  colour: Argb;
}

export interface StrokePathOp {
  op: "strokePath";
  points: number[];
  closed: boolean;
  colour: Argb;
  width: number;
  /** Dash pattern in logical units; absent or [] means solid. */
  dash?: number[];
}

export interface FillCircleOp {
  op: "fillCircle";
  centre: [number, number];
  radius: number;
  colour: Argb;
}

export type DisplayOp = FillPolygonOp | StrokePathOp | FillCircleOp;

/** One rendered frame: a square logical canvas and the ops to paint on it. */
export interface Frame {
  canvas: number;
  ops: DisplayOp[];
  error?: string;
}

export interface OptionOutcome {
  /** True when the option is a legal, correct answer. */
  clean: boolean;
  /** Outcome classifier when not clean (collision, priority_violation, ...). */
  type?: string;
  /** Playback length for this option, seconds. */
  duration: number;
}

export interface SceneInfo {
  /** Playback length of the correct answer, seconds. */
  duration: number;
  options: Record<string, OptionOutcome>;
  error?: string;
}

/** The engine surface, as strings-in / strings-out from the dart2js bundle. */
export interface EngineApi {
  version: string;
  /** Static scene at t=0. `src` is a scenario JSON string. Returns a Frame JSON string. */
  buildScene(src: string): string;
  /** Correct-answer frame at `time` seconds. Returns a Frame JSON string. */
  buildFrame(src: string, time: number): string;
  /** Scene metadata: durations and per-option outcomes. Returns a SceneInfo JSON string. */
  sceneInfo(src: string): string;
  /** Frame at `time` for the student's chosen `optionId`. Returns a Frame JSON string. */
  optionFrame(src: string, optionId: string, time: number): string;
}

export function loadEngineNode(): EngineApi;
export function drawDisplayList(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  opts: { size: number },
): void;
