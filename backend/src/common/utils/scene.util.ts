export interface SceneOutcome {
  status: 'safe' | 'collision' | 'priority_violation' | 'fail';
  order?: string[];
  collideWith?: string;
  ruleCode?: string;
  ruleText?: string;
}

export function parseScene(sceneJson: string | null | undefined): { scene: unknown; actors: unknown } {
  if (!sceneJson) return { scene: null, actors: null };
  try {
    const parsed = JSON.parse(sceneJson);
    return { scene: parsed?.scene ?? null, actors: parsed?.actors ?? null };
  } catch {
    return { scene: null, actors: null };
  }
}

export function resolveSceneOutcome(
  resolutionJson: string | null | undefined,
  optionKey: string | null | undefined,
  isCorrect: boolean,
): SceneOutcome | null {
  if (!resolutionJson) return null;

  let resolution: any;
  try {
    resolution = JSON.parse(resolutionJson);
  } catch {
    return null;
  }

  const ruleCode: string | undefined = resolution?.rule?.code;
  const ruleText: string | undefined = resolution?.rule?.text?.uz;
  const order: string[] | undefined = resolution?.order;

  if (isCorrect) {
    return { status: 'safe', order, ruleCode, ruleText };
  }

  const wrong = optionKey ? resolution?.wrong_outcomes?.[optionKey] : undefined;
  const status: SceneOutcome['status'] =
    wrong?.type === 'collision' ? 'collision' : wrong?.type === 'priority_violation' ? 'priority_violation' : 'fail';

  return { status, collideWith: wrong?.with, order, ruleCode, ruleText };
}
