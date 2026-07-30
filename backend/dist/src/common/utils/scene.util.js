"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseScene = parseScene;
exports.resolveSceneOutcome = resolveSceneOutcome;
function parseScene(sceneJson) {
    if (!sceneJson)
        return { scene: null, actors: null };
    try {
        const parsed = JSON.parse(sceneJson);
        return { scene: parsed?.scene ?? null, actors: parsed?.actors ?? null };
    }
    catch {
        return { scene: null, actors: null };
    }
}
function resolveSceneOutcome(resolutionJson, optionKey, isCorrect) {
    if (!resolutionJson)
        return null;
    let resolution;
    try {
        resolution = JSON.parse(resolutionJson);
    }
    catch {
        return null;
    }
    const ruleCode = resolution?.rule?.code;
    const ruleText = resolution?.rule?.text?.uz;
    const order = resolution?.order;
    if (isCorrect) {
        return { status: 'safe', order, ruleCode, ruleText };
    }
    const wrong = optionKey ? resolution?.wrong_outcomes?.[optionKey] : undefined;
    const status = wrong?.type === 'collision' ? 'collision' : wrong?.type === 'priority_violation' ? 'priority_violation' : 'fail';
    return { status, collideWith: wrong?.with, order, ruleCode, ruleText };
}
//# sourceMappingURL=scene.util.js.map