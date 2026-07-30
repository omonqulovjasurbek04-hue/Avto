import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
});
const prisma = new PrismaClient({ adapter });

interface SceneOption {
  id: string;
  refers_to?: string;
  label: Record<string, string>;
}

interface SceneFile {
  id: string;
  topic: string;
  scene: Record<string, unknown>;
  actors: Record<string, unknown>[];
  question: {
    text: Record<string, string>;
    options: SceneOption[];
    correct: string;
  };
  resolution: Record<string, unknown>;
}

async function seedSceneQuestions() {
  const contentDir = path.join(__dirname, '../content');
  if (!fs.existsSync(contentDir)) return;

  const files = fs
    .readdirSync(contentDir)
    .filter((f) => f.startsWith('sc-') && f.endsWith('.json'))
    .sort();
  if (files.length === 0) return;

  const category = await prisma.category.upsert({
    where: { slug: 'priority-practice' },
    update: { name: 'Ustunlik va chorrahalar (Amaliy simulyatsiya)' },
    create: {
      name: 'Ustunlik va chorrahalar (Amaliy simulyatsiya)',
      slug: 'priority-practice',
      order: 10,
    },
  });

  // Upsert by the file's stable id (sc-0001, ...) so re-running this never
  // deletes rows that real TestSessionAnswer history may already reference.
  for (const [idx, file] of files.entries()) {
    const raw: SceneFile = JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf-8'));

    const question = await prisma.question.upsert({
      where: { externalId: raw.id },
      update: {
        categoryId: category.id,
        text: raw.question.text.uz,
        order: idx + 1,
        sceneJson: JSON.stringify({ scene: raw.scene, actors: raw.actors }),
        resolutionJson: JSON.stringify(raw.resolution),
      },
      create: {
        externalId: raw.id,
        categoryId: category.id,
        text: raw.question.text.uz,
        order: idx + 1,
        sceneJson: JSON.stringify({ scene: raw.scene, actors: raw.actors }),
        resolutionJson: JSON.stringify(raw.resolution),
      },
    });

    for (const option of raw.question.options) {
      await prisma.answer.upsert({
        where: { questionId_optionKey: { questionId: question.id, optionKey: option.id } },
        update: { text: option.label.uz, isCorrect: option.id === raw.question.correct },
        create: {
          questionId: question.id,
          optionKey: option.id,
          text: option.label.uz,
          isCorrect: option.id === raw.question.correct,
        },
      });
    }
  }

  console.log(`${category.name}: ${category.slug} — ${files.length} ta amaliy savol (sahna asosida)`);
}

async function main() {
  const adminPassword = await argon2.hash('admin123');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@yhq.uz' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@yhq.uz',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Admin: ${admin.email}`);

  const categories = [
    {
      name: 'Yo\'l belgilari',
      slug: 'road-signs',
      order: 1,
      questions: [
        {
          text: '"Yo\'l berish" belgisi qanday shaklga ega?',
          answers: [
            { text: 'Uchburchak, qizil hoshiyali', isCorrect: true },
            { text: 'Dumaloq, qizil fonli', isCorrect: false },
            { text: 'To\'rtburchak, ko\'k fonli', isCorrect: false },
            { text: 'Sakkiz burchakli, qizil', isCorrect: false },
          ],
        },
        {
          text: 'Qaysi belgi "To\'xtash taqiqlangan" ma\'nosini bildiradi?',
          answers: [
            { text: 'Qizil hoshiyali dumaloq, ichi oq, qizil chiziq', isCorrect: true },
            { text: 'Ko\'k dumaloq, oq strelka', isCorrect: false },
            { text: 'Sariq uchburchak, qora strelka', isCorrect: false },
            { text: 'To\'rtburchak ko\'k, oq avtobus', isCorrect: false },
          ],
        },
      ],
    },
    {
      name: 'Svetofor va signallar',
      slug: 'traffic-lights',
      order: 2,
      questions: [
        {
          text: 'Svetoforning yashil chirog\'i yonganda nima qilish kerak?',
          answers: [
            { text: 'Harakatni boshlash mumkin', isCorrect: true },
            { text: 'To\'xtab, atrofni kuzatish kerak', isCorrect: false },
            { text: 'Faqat o\'ngga burilish mumkin', isCorrect: false },
            { text: 'Signaldan qat\'iy nazar to\'xtash kerak', isCorrect: false },
          ],
        },
        {
          text: 'Sariq miltillovchi svetofor nimani anglatadi?',
          answers: [
            { text: 'Tartibga solinmagan chorraha', isCorrect: true },
            { text: 'Harakat taqiqlangan', isCorrect: false },
            { text: 'Tezlikni oshirish mumkin', isCorrect: false },
            { text: 'Faqat piyodalar o\'tishi mumkin', isCorrect: false },
          ],
        },
      ],
    },
    {
      name: 'Ustunlik huquqi',
      slug: 'right-of-way',
      order: 3,
      questions: [
        {
          text: 'Teng chorrahada birinchi o\'tish huquqi kimda?',
          answers: [
            { text: 'O\'ng tomondan kelayotgan transportda', isCorrect: true },
            { text: 'Chap tomondan kelayotgan transportda', isCorrect: false },
            { text: 'Katta avtomobilda', isCorrect: false },
            { text: 'Tezroq kelayotgan transportda', isCorrect: false },
          ],
        },
        {
          text: 'Asosiy yo\'lda ketayotgan haydovchiga nisbatan yon yo\'ldan chiqayotgan haydovchi qanday harakat qilishi kerak?',
          answers: [
            { text: 'Yo\'l berishi kerak', isCorrect: true },
            { text: 'Birinchi bo\'lib o\'tishi mumkin', isCorrect: false },
            { text: 'Signaldan qat\'iy nazar harakatlanishi mumkin', isCorrect: false },
            { text: 'Faqat kuzatib harakatlanishi kerak', isCorrect: false },
          ],
        },
      ],
    },
  ];

  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug, order: cat.order },
    });

    for (const [qi, q] of cat.questions.entries()) {
      const externalId = `${cat.slug}-q${qi + 1}`;
      const question = await prisma.question.upsert({
        where: { externalId },
        update: { categoryId: created.id, text: q.text, order: qi + 1 },
        create: { externalId, categoryId: created.id, text: q.text, order: qi + 1 },
      });

      for (const [ai, a] of q.answers.entries()) {
        const optionKey = String.fromCharCode(65 + ai); // A, B, C, D...
        await prisma.answer.upsert({
          where: { questionId_optionKey: { questionId: question.id, optionKey } },
          update: { text: a.text, isCorrect: a.isCorrect },
          create: { questionId: question.id, optionKey, text: a.text, isCorrect: a.isCorrect },
        });
      }
    }

    const qCount = await prisma.question.count({ where: { categoryId: created.id } });
    console.log(`${cat.name}: ${created.slug} — ${qCount} ta savol`);
  }

  await seedSceneQuestions();

  const totalQ = await prisma.question.count();
  const totalA = await prisma.answer.count();
  const totalCat = await prisma.category.count();
  console.log(`\nJami: ${totalCat} kategoriya, ${totalQ} savol, ${totalA} javob`);
}

main()
  .catch((e) => {
    console.error('Seed xatosi:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
