import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const CONTENT_DIR = fileURLToPath(new URL("../content/", import.meta.url));
const prisma = new PrismaClient();

const TOPIC_MAP = {
  priority_and_intersections: { name: { uz: "Chorraha va ustunlik", ru: "Перекрестки и приоритет", en: "Intersections & Priority" }, slug: "intersections-priority" },
};

async function main() {
  const files = readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const cats = {};

  for (const file of files) {
    const raw = readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const data = JSON.parse(raw);
    const topic = data.topic || "general";

    if (!cats[topic]) {
      const info = TOPIC_MAP[topic] || { name: { uz: topic, en: topic }, slug: topic };
      cats[topic] = await prisma.category.upsert({
        where: { slug: info.slug },
        update: { name: info.name },
        create: { name: info.name, slug: info.slug },
      });
    }

    // text Json formatida: { uz: "...", ru: "...", en: "..." }
    const questionText = typeof data.question.text === 'string'
      ? { uz: data.question.text, en: data.question.text }
      : data.question.text;

    const question = await prisma.question.create({
      data: {
        categoryId: cats[topic].id,
        text: questionText,
        rawData: data,
      },
    });

    for (const opt of data.question.options) {
      const isCorrect = opt.id === data.question.correct;
      // opt.label Json formatida bo'lishi mumkin
      const answerText = typeof opt.label === 'string'
        ? { uz: opt.label, en: opt.label }
        : opt.label;
      await prisma.answer.create({
        data: {
          questionId: question.id,
          text: answerText,
          isCorrect,
        },
      });
    }
  }

  const qCount = await prisma.question.count();
  const aCount = await prisma.answer.count();
  const cCount = await prisma.category.count();
  console.log(`Seeded: ${cCount} categories, ${qCount} questions, ${aCount} answers`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
