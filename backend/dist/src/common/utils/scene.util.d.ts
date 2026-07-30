export interface SceneOutcome {
    status: 'safe' | 'collision' | 'priority_violation' | 'fail';
    order?: string[];
    collideWith?: string;
    ruleCode?: string;
    ruleText?: string;
}
export declare function parseScene(sceneJson: string | null | undefined): {
    scene: unknown;
    actors: unknown;
};
export declare function resolveSceneOutcome(resolutionJson: string | null | undefined, optionKey: string | null | undefined, isCorrect: boolean): SceneOutcome | null;
