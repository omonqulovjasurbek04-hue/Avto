// User progress service.
// Manages answer recording and progress statistics via Prisma/PostgreSQL.
// Each user can only access their own data (userId from JWT, never from URL).
import { prisma } from "../config/database.mjs";

/**
 * Get user's full progress: answers, statistics.
 * @param {string} userId
 * @returns {Promise<object>}
 */
export async function getUserProgress(userId) {
  const [answers, stats] = await Promise.all([
    prisma.answer.findMany({
      where: { userId },
      orderBy: { answeredAt: "desc" },
      take: 500, // Cap at 500 most recent
      select: {
        id: true,
        scenarioId: true,
        optionId: true,
        isCorrect: true,
        outcome: true,
        answeredAt: true,
      },
    }),
    prisma.answer.groupBy({
      by: ["isCorrect"],
      where: { userId },
      _count: true,
    }),
  ]);

  let correct = 0;
  let wrong = 0;
  for (const row of stats) {
    if (row.isCorrect) correct = row._count;
    else wrong = row._count;
  }

  return { answers, correct, wrong, total: correct + wrong };
}

/**
 * Get progress statistics only (no answer list).
 * @param {string} userId
 * @returns {Promise<object>}
 */
export async function getProgressStats(userId) {
  const stats = await prisma.answer.groupBy({
    by: ["isCorrect"],
    where: { userId },
    _count: true,
  });

  let correct = 0;
  let wrong = 0;
  for (const row of stats) {
    if (row.isCorrect) correct = row._count;
    else wrong = row._count;
  }

  // Also get unique scenarios answered
  const uniqueScenarios = await prisma.answer.findMany({
    where: { userId },
    distinct: ["scenarioId"],
    select: { scenarioId: true },
  });

  return {
    correct,
    wrong,
    total: correct + wrong,
    uniqueScenarios: uniqueScenarios.length,
  };
}

/**
 * Save an answer attempt.
 * @param {string} userId
 * @param {{ scenarioId: string, optionId: string, isCorrect: boolean, outcome: string|null }} data
 * @returns {Promise<object>}
 */
export async function saveAnswer(userId, { scenarioId, optionId, isCorrect, outcome }) {
  const answer = await prisma.answer.create({
    data: {
      userId,
      scenarioId,
      optionId,
      isCorrect,
      outcome: outcome || null,
    },
    select: {
      id: true,
      scenarioId: true,
      optionId: true,
      isCorrect: true,
      outcome: true,
      answeredAt: true,
    },
  });

  return answer;
}
