// Auto-generated from schema. Do not edit.

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
  lanes_in: number;
  lanes_out: number;
  priority: Priority;
}

export interface TramTrack {
  along: TramAxis;
}

export interface Sign {
  at: Dir;
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

export interface Actor {
  id: string;
  kind: ActorKind;
  role?: ActorRole;
  from: Dir;
  to: Dir;
  color?: string;
  lane_in?: number;
  lane_out?: number;
}

export interface Question {
  text: LocalizedText;
  options: Option[];
  correct: string;
}

export interface Option {
  id: string;
  refers_to?: string;
  label: LocalizedText;
}

export interface Resolution {
  order: string[];
  rule: Rule;
  wrong_outcomes?: { [key: string]: Outcome };
}

export interface Rule {
  code: string;
  text: LocalizedText;
}

export interface Outcome {
  type: OutcomeType;
  with?: string;
}

export type Topic = "priority_and_intersections" | "signs" | "markings" | "traffic_lights_and_signals" | "speed_and_distance" | "overtaking_and_passing" | "stopping_and_parking" | "pedestrians_and_crossings" | "railway_crossings" | "special_vehicles" | "vehicle_condition" | "documents_and_liability" | "first_aid";

export type SceneType = "crossroads_4way" | "t_junction" | "y_junction" | "roundabout" | "straight_road" | "overtaking" | "pedestrian_crossing" | "railway_crossing" | "narrow_road" | "parking_stopping" | "residential_yard" | "tunnel";

export type Dir = "N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW";

export type LightPlacement = "N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW" | "all";

export type Priority = "main" | "secondary" | "equal";

export type ActorKind = "car" | "truck" | "bus" | "tram" | "motorcycle" | "bicycle" | "pedestrian" | "emergency";

export type ActorRole = "player" | "traffic";

export type OutcomeType = "collision" | "priority_violation" | "sign_violation" | "marking_violation" | "unnecessary_wait" | "unsafe_but_legal";

export type LightState = "off" | "red" | "yellow" | "green" | "green_blink" | "yellow_blink";

export type MarkingType = "stop_line" | "give_way_line" | "crosswalk" | "solid_line" | "dashed_line" | "double_solid" | "stop_box" | "no_stopping" | "no_parking" | "lane_arrow";

export type TramAxis = "NS" | "EW";

export type TimeOfDay = "day" | "night" | "dusk";

export type Weather = "clear" | "rain" | "snow" | "fog";

