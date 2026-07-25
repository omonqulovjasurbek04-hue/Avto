import { prisma } from "./config/database.mjs";

export async function getRawScenario(id) {
  const q = await prisma.question.findUnique({ where: { id } });
  return q?.rawData ? JSON.stringify(q.rawData) : null;
}

export async function getScenario(id) {
  const q = await prisma.question.findUnique({ where: { id } });
  return q?.rawData || null;
}
