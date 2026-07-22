// Scenario content service.
// Wraps content.mjs with a cleaner service interface.
// Scenarios remain as JSON files in /content — they are static content, not user data.
import { listScenarios as _listScenarios, scenario as _scenario, rawScenario as _rawScenario, saveScenario as _saveScenario, deleteScenario as _deleteScenario } from "../content.mjs";

/**
 * List all scenarios with optional filtering.
 * @param {{ topic?: string, type?: string }} filters
 * @returns {Array}
 */
export function listScenarios(filters = {}) {
  let items = _listScenarios();
  if (filters.topic) {
    items = items.filter((s) => s.topic === filters.topic);
  }
  if (filters.type) {
    items = items.filter((s) => s.type === filters.type);
  }
  return items;
}

/**
 * Get a parsed scenario by ID.
 * @param {string} id
 * @returns {object|null}
 */
export function getScenario(id) {
  return _scenario(id);
}

/**
 * Get raw scenario JSON string by ID (for engine).
 * @param {string} id
 * @returns {string|null}
 */
export function getRawScenario(id) {
  return _rawScenario(id);
}

/**
 * Save or update a scenario (admin only).
 * @param {object} data
 * @returns {object}
 */
export function saveScenario(data) {
  return _saveScenario(data);
}

/**
 * Delete a scenario (admin only).
 * @param {string} id
 * @returns {boolean}
 */
export function deleteScenario(id) {
  return _deleteScenario(id);
}
