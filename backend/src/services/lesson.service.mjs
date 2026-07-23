// Lesson service.
// Wraps lessons.mjs with a cleaner service interface.
// Lessons remain as JSON files in /data/lessons — static content.
import { listLessons as _listLessons, getLessonById as _getLessonById, saveLesson as _saveLesson, deleteLesson as _deleteLesson } from "../lessons.mjs";

/**
 * List all theory lessons.
 * @returns {Array}
 */
export function listLessons() {
  return _listLessons();
}

/**
 * Get a lesson by ID.
 * @param {string} id
 * @returns {object|null}
 */
export function getLessonById(id) {
  return _getLessonById(id);
}

/**
 * Save or create a lesson (admin only).
 * @param {object} data
 * @returns {object}
 */
export function saveLesson(data) {
  return _saveLesson(data);
}

/**
 * Delete a lesson (admin only).
 * @param {string} id
 * @returns {boolean}
 */
export function deleteLesson(id) {
  return _deleteLesson(id);
}
