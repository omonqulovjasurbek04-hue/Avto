// Exam service.
// Manages exam generation, submission, and history via Prisma/PostgreSQL.
import { prisma } from "../config/database.mjs";
import { listScenarios } from "./scenario.service.mjs";
import { sceneInfo } from "../engine.mjs";
import { getRawScenario } from "./scenario.service.mjs";
import { shuffle } from "../utils/shuffle.mjs";

/**
 * Generate a random exam with 20 questions.
 * @returns {object}
 */
export function generateExam() {
  const all = listScenarios();
  const count = Math.min(20, all.length);
  const selected = shuffle(all).slice(0, count);

  return {
    examId: `exam-gen-${Date.now()}`,
    timeLimitSeconds: 1500, // 25 minutes (CLAUDE.md Phase 8)
    questions: selected.map((s) => s.id),
  };
}

/**
 * Submit exam answers and compute results.
 * Engine evaluates correctness — the client never asserts it.
 * @param {string} userId
 * @param {{ answers: Array<{scenarioId: string, optionId: string}>, durationSeconds: number }} data
 * @returns {Promise<object>}
 */
export async function submitExam(userId, { answers, durationSeconds }) {
  let score = 0;
  const detailed = [];

  for (const item of answers) {
    const raw = getRawScenario(item.scenarioId);
    let isCorrect = false;
    let outcomeType = null;

    if (raw) {
      try {
        const info = sceneInfo(raw);
        const outcome = info.options[item.optionId];
        if (outcome && outcome.clean) {
          isCorrect = true;
          score += 1;
        } else if (outcome) {
          outcomeType = outcome.type || null;
        }
      } catch {
        // Engine error on this scenario — mark as incorrect
      }
    }

    detailed.push({
      scenarioId: item.scenarioId,
      optionId: item.optionId,
      correct: isCorrect,
      outcome: outcomeType,
    });
  }

  // Pass mark scales with question count (~90%)
  const total = answers.length;
  const passed = total > 0 && score >= Math.ceil(total * 0.9);

  // Save to database
  const examAttempt = await prisma.examAttempt.create({
    data: {
      userId,
      score,
      total,
      passed,
      durationSeconds: durationSeconds || 0,
      details: detailed,
    },
    select: {
      id: true,
      score: true,
      total: true,
      passed: true,
      durationSeconds: true,
      details: true,
      createdAt: true,
    },
  });

  return { passed, score, total, result: examAttempt };
}

/**
 * Get exam history for a user.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getExamHistory(userId) {
  return prisma.examAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      score: true,
      total: true,
      passed: true,
      durationSeconds: true,
      details: true,
      createdAt: true,
    },
  });
}
