import { prisma } from "../config/database.mjs";

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { questions: true } } },
  });
}

export async function getCategory(id) {
  return prisma.category.findUnique({ where: { id } });
}

export async function getCategoryQuestions(categoryId) {
  const questions = await prisma.question.findMany({
    where: { categoryId },
    include: {
      answers: {
        select: { id: true, text: true }, // isCorrect HECH QACHON qaytarilmaydi
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  
  // Parse text and rawData fields from JSON strings
  return questions.map(q => ({
    ...q,
    text: q.text, // Keep as string, frontend will parse
    answers: q.answers.map(a => ({
      ...a,
      text: a.text, // Keep as string, frontend will parse
    })),
    rawData: q.rawData, // Keep as string, frontend will parse
  }));
}

export async function createCategory(data) {
  return prisma.category.create({ data });
}

export async function deleteCategory(id) {
  try {
    await prisma.category.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
