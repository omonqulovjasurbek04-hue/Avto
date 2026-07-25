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
        select: { id: true, text: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  // Secure: isCorrect va videoId BU YERDA qaytarilmaydi
  // Faqat POST /api/practice/answer orqali tekshiriladi
  return questions;
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
