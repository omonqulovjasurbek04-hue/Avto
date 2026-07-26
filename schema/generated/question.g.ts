// Auto-generated from schema. Do not edit.

export interface QuestionBankEntry {
  id: string;
  schema_version: number;
  topic: Topic;
  text: LocalizedText;
  options: PlainOption[];
  correct: string;
  rule: Rule;
  scenario_id?: string;
  media?: Media;
  free_tier?: boolean;
}

export interface PlainOption {
  id: string;
  label: LocalizedText;
}

export interface Media {
  kind: MediaKind;
  asset: string;
}

export type MediaKind = "image" | "diagram";

