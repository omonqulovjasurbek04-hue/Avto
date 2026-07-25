// GENERATED FILE - DO NOT EDIT.
// Source: schema/scenario.schema.json
// Regenerate with: node tools/codegen.js

/** Curriculum area. Drives the weak-point map and spaced repetition, so it must be stable once content ships. */
export type Topic =
  | "priority_and_intersections"
  | "signs"
  | "markings"
  | "traffic_lights_and_signals"
  | "speed_and_distance"
  | "overtaking_and_passing"
  | "stopping_and_parking"
  | "pedestrians_and_crossings"
  | "railway_crossings"
  | "special_vehicles"
  | "vehicle_condition"
  | "documents_and_liability"
  | "first_aid";

export const TopicValues: readonly Topic[] = [
  "priority_and_intersections",
  "signs",
  "markings",
  "traffic_lights_and_signals",
  "speed_and_distance",
  "overtaking_and_passing",
  "stopping_and_parking",
  "pedestrians_and_crossings",
  "railway_crossings",
  "special_vehicles",
  "vehicle_condition",
  "documents_and_liability",
  "first_aid",
] as const;

/** SceneType */
export type SceneType =
  | "crossroads_4way"
  | "t_junction"
  | "y_junction"
  | "roundabout"
  | "straight_road"
  | "overtaking"
  | "pedestrian_crossing"
  | "railway_crossing"
  | "narrow_road"
  | "parking_stopping"
  | "residential_yard"
  | "tunnel";

export const SceneTypeValues: readonly SceneType[] = [
  "crossroads_4way",
  "t_junction",
  "y_junction",
  "roundabout",
  "straight_road",
  "overtaking",
  "pedestrian_crossing",
  "railway_crossing",
  "narrow_road",
  "parking_stopping",
  "residential_yard",
  "tunnel",
] as const;

/** Dir */
export type Dir =
  | "N"
  | "S"
  | "E"
  | "W"
  | "NE"
  | "NW"
  | "SE"
  | "SW";

export const DirValues: readonly Dir[] = [
  "N",
  "S",
  "E",
  "W",
  "NE",
  "NW",
  "SE",
  "SW",
] as const;

/** LightPlacement */
export type LightPlacement =
  | "N"
  | "S"
  | "E"
  | "W"
  | "NE"
  | "NW"
  | "SE"
  | "SW"
  | "all";

export const LightPlacementValues: readonly LightPlacement[] = [
  "N",
  "S",
  "E",
  "W",
  "NE",
  "NW",
  "SE",
  "SW",
  "all",
] as const;

/** Priority */
export type Priority =
  | "main"
  | "secondary"
  | "equal";

export const PriorityValues: readonly Priority[] = [
  "main",
  "secondary",
  "equal",
] as const;

/** ActorKind */
export type ActorKind =
  | "car"
  | "truck"
  | "bus"
  | "tram"
  | "motorcycle"
  | "bicycle"
  | "pedestrian"
  | "emergency";

export const ActorKindValues: readonly ActorKind[] = [
  "car",
  "truck",
  "bus",
  "tram",
  "motorcycle",
  "bicycle",
  "pedestrian",
  "emergency",
] as const;

/** ActorRole */
export type ActorRole =
  | "player"
  | "traffic";

export const ActorRoleValues: readonly ActorRole[] = [
  "player",
  "traffic",
] as const;

/** OutcomeType */
export type OutcomeType =
  | "collision"
  | "priority_violation"
  | "sign_violation"
  | "marking_violation"
  | "unnecessary_wait"
  | "unsafe_but_legal";

export const OutcomeTypeValues: readonly OutcomeType[] = [
  "collision",
  "priority_violation",
  "sign_violation",
  "marking_violation",
  "unnecessary_wait",
  "unsafe_but_legal",
] as const;

/** LightState */
export type LightState =
  | "off"
  | "red"
  | "yellow"
  | "green"
  | "green_blink"
  | "yellow_blink";

export const LightStateValues: readonly LightState[] = [
  "off",
  "red",
  "yellow",
  "green",
  "green_blink",
  "yellow_blink",
] as const;

/** MarkingType */
export type MarkingType =
  | "stop_line"
  | "give_way_line"
  | "crosswalk"
  | "solid_line"
  | "dashed_line"
  | "double_solid"
  | "stop_box"
  | "no_stopping"
  | "no_parking"
  | "lane_arrow";

export const MarkingTypeValues: readonly MarkingType[] = [
  "stop_line",
  "give_way_line",
  "crosswalk",
  "solid_line",
  "dashed_line",
  "double_solid",
  "stop_box",
  "no_stopping",
  "no_parking",
  "lane_arrow",
] as const;

/** TramAxis */
export type TramAxis =
  | "NS"
  | "EW";

export const TramAxisValues: readonly TramAxis[] = [
  "NS",
  "EW",
] as const;

/** TimeOfDay */
export type TimeOfDay =
  | "day"
  | "night"
  | "dusk";

export const TimeOfDayValues: readonly TimeOfDay[] = [
  "day",
  "night",
  "dusk",
] as const;

/** Weather */
export type Weather =
  | "clear"
  | "rain"
  | "snow"
  | "fog";

export const WeatherValues: readonly Weather[] = [
  "clear",
  "rain",
  "snow",
  "fog",
] as const;

/** MediaKind */
export type MediaKind =
  | "image"
  | "diagram";

export const MediaKindValues: readonly MediaKind[] = [
  "image",
  "diagram",
] as const;

/** Locale code -> string. No locale is privileged; completeness is reported by tooling, not enforced here. */
export type LocalizedText = Record<string, string>;

export interface Scenario {
  id: string;
  schema_version: number;
  question_id: string;
  topic: Topic;
  scene: Scene;
  actors: Actor[];
  question: Question;
  resolution: Resolution;
}

/** Language-independent. No human-readable strings may appear here. */
export interface Scene {
  type: SceneType;
  roads: Road[];
  tram_track?: TramTrack;
  signs?: Sign[];
  markings?: Marking[];
  lights?: TrafficLight[];
  conditions?: Conditions;
}

export interface Road {
  dir: Dir;
  /** Lanes carrying traffic toward the intersection. */
  lanes_in: number;
  /** Lanes carrying traffic away from the intersection. */
  lanes_out: number;
  priority: Priority;
}

export interface TramTrack {
  along: TramAxis;
}

export interface Sign {
  at: Dir;
  /** YHQ sign code, e.g. "2.4". A code, not prose. */
  code: string;
}

export interface Marking {
  type: MarkingType;
  at?: Dir;
}

export interface TrafficLight {
  at: LightPlacement;
  state: LightState;
}

export interface Conditions {
  time?: TimeOfDay;
  weather?: Weather;
}

/** Language-independent. No human-readable strings may appear here. */
export interface Actor {
  id: string;
  kind: ActorKind;
  role?: ActorRole;
  from: Dir;
  to: Dir;
  color?: string;
  /** Index of the incoming lane on the `from` road, 0 = nearest the centreline. */
  lane_in?: number;
  /** Index of the outgoing lane on the `to` road, 0 = nearest the centreline. */
  lane_out?: number;
}

export interface Question {
  text: Record<string, string>;
  options: Option[];
  correct: string;
}

export interface Option {
  id: string;
  /** Actor id this option asserts should proceed first. Omitted for options that assert nobody proceeds. */
  refers_to?: string;
  label: Record<string, string>;
}

export interface Resolution {
  /** Sequence in which actors clear the conflict zone. */
  order: string[];
  rule: Rule;
  /** Authoring hint for content review only. Never authoritative over simulation. */
  wrong_outcomes?: Record<string, Outcome>;
}

export interface Rule {
  code: string;
  text: Record<string, string>;
}

export interface Outcome {
  type: OutcomeType;
  /** Actor id involved, where the outcome type implies a second party. */
  with?: string;
}

export interface QuestionBankEntry {
  id: string;
  schema_version: number;
  topic: Topic;
  text: Record<string, string>;
  options: PlainOption[];
  correct: string;
  rule: Rule;
  /** Present only for spatial questions. The named scenario owns the scene, actors and resolution; its embedded `question` block is authoritative for wording, and this entry is the index record. */
  scenario_id?: string;
  /** Static illustration for non-spatial questions that need one. Never video - see principle 5. */
  media?: Media;
  /** Available before purchase. The free tier is capped at 25 questions. */
  free_tier?: boolean;
}

export interface PlainOption {
  id: string;
  label: Record<string, string>;
}

export interface Media {
  kind: MediaKind;
  /** Path relative to the media root. A file name, not prose. */
  asset: string;
}

/** Property defaults declared in the schema, by "Type.property". */
export const SCHEMA_DEFAULTS: Record<string, unknown> = {
  "Scene.signs": [],
  "Scene.markings": [],
  "Scene.lights": [],
  "Conditions.time": "day",
  "Conditions.weather": "clear",
  "Actor.role": "traffic",
  "Actor.lane_in": 0,
  "Actor.lane_out": 0,
  "Resolution.wrong_outcomes": {},
  "QuestionBankEntry.free_tier": false,
};
