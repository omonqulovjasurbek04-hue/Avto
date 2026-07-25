// Practice service — xavfsiz javob tekshirish uchun
// GET /api/categories/:id/questions dan isCorrect YASHIRILADI
// Bu service faqat bitta tanlangan javobni tekshiradi
import { prisma } from "../config/database.mjs";

/**
 * Check a single answer without creating a test session.
 * @param {string} questionId
 * @param {string} answerId
 * @returns {Promise<{ isCorrect: boolean, correctAnswerId: string | null }>}
 */
export async function checkAnswer(questionId, answerId) {
  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    select: { id: true, isCorrect: true, questionId: true },
  });

  if (!answer || answer.questionId !== questionId) {
    const err = new Error("Javob topilmadi");
    err.status = 404;
    throw err;
  }

  if (!answer.isCorrect) {
    // Xato javob — to'g'ri javob ID sini qaytaramiz (frontend izohlash uchun)
    const correct = await prisma.answer.findFirst({
      where: { questionId, isCorrect: true },
      select: { id: true },
    });
    return { isCorrect: false, correctAnswerId: correct?.id || null };
  }

  return { isCorrect: true, correctAnswerId: null };
}
