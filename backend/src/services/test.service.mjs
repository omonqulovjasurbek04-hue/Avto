import { prisma } from "../config/database.mjs";

export async function startTest(userId, categoryId) {
  const questionCount = await prisma.question.count({ where: { categoryId } });
  if (questionCount === 0) throw new Error("Bu kategoriyada savol yo'q");

  const session = await prisma.testSession.create({
    data: { userId, categoryId },
  });

  return { id: session.id, categoryId, startedAt: session.startedAt, questionCount };
}

export async function answerQuestion(sessionId, userId, questionId, answerId) {
  const session = await prisma.testSession.findFirst({
    where: { id: sessionId, userId, finishedAt: null },
  });
  if (!session) throw new Error("Test sessiyasi topilmadi yoki tugatilgan");

  const already = await prisma.testSessionAnswer.findFirst({
    where: { sessionId, questionId },
  });
  if (already) throw new Error("Bu savolga allaqachon javob berilgan");

  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    include: { video: true },
  });
  if (!answer) throw new Error("Javob topilmadi");

  const isCorrect = answer.isCorrect;

  // video relation allaqachon include orqali kelgan
  const video = answer.video;

  await prisma.testSessionAnswer.create({
    data: { sessionId, questionId, answerId, isCorrect, videoId: answer.videoId },
  });

  return {
    isCorrect,
    videoUrl: video?.url || null,
    videoDuration: video?.duration || 0,
  };
}

export async function finishTest(sessionId, userId) {
  const session = await prisma.testSession.findFirst({
    where: { id: sessionId, userId, finishedAt: null },
  });
  if (!session) throw new Error("Test sessiyasi topilmadi yoki tugatilgan");

  const answers = await prisma.testSessionAnswer.findMany({
    where: { sessionId },
  });

  const total = answers.length;
  const score = answers.filter((a) => a.isCorrect).length;

  await prisma.testSession.update({
    where: { id: sessionId },
    data: { finishedAt: new Date(), score },
  });

  return { score, total, passed: score >= Math.ceil(total * 0.9) };
}

export async function getHistory(userId) {
  return prisma.testSession.findMany({
    where: { userId, finishedAt: { not: null } },
    orderBy: { finishedAt: "desc" },
    take: 50,
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { answers: true } },
    },
  });
}
