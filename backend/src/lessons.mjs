// Database and content management for YHQ Theory Lessons (Darsliklar)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const LESSONS_DIR = fileURLToPath(new URL("../data/lessons/", import.meta.url));

function safeLessonPath(id) {
  if (!id || !/^[\w-]+$/.test(id)) return null;
  const target = path.join(LESSONS_DIR, `${id}.json`);
  const resolved = path.resolve(target);
  const base = path.resolve(LESSONS_DIR);
  if (!resolved.startsWith(base + path.sep) && resolved !== base) {
    return null;
  }
  return resolved;
}

const INITIAL_LESSONS = [
  {
    id: "lesson-01",
    title: "1. Yo'l belgilari va chiziqlari",
    topic: "yol_belgilari",
    description: "Ogohlantiruvchi, imtiyoz, taqiqlovchi, buyuruvchi va axborot-ishora belgilari hamda yo'l chiziqlari.",
    ruleCode: "YHQ 5-6-bandlar",
    icon: "🛑",
    readTime: "10 daqiqa",
    sections: [
      {
        heading: "Ogohlantiruvchi belgilar",
        content: "Ogohlantiruvchi belgilar haydovchilarga harakatlanishda tegishli choralar ko'rishni talab etadigan xavfli yo'l qismlariga yaqinlashayotganligi haqida axborot beradi.",
        signs: ["1.1", "1.2", "1.22"]
      },
      {
        heading: "Imtiyoz belgilari",
        content: "Imtiyoz belgilari chorrahalarni, yo'lning tor qismlarini o'tish navbatini belgilaydi. 'Asosiy yo'l' (2.1) va 'Yo'l bering' (2.4) eng muhim imtiyoz belgilaridir.",
        signs: ["2.1", "2.4", "2.5"]
      },
      {
        heading: "Taqiqlovchi belgilar",
        content: "Yo'l harakatiga muayyan cheklashlar kiritadi yoki ularni bekor qiladi. Masalan: 'Kirish taqiqlangan' (3.1), 'Harakatlanish taqiqlangan' (3.2).",
        signs: ["3.1", "3.2", "3.24"]
      }
    ],
    relatedScenarioIds: ["sc-0001", "sc-0002"]
  },
  {
    id: "lesson-02",
    title: "2. Chorrahalardan o'tish qoidalari",
    topic: "crossroads",
    description: "Teng ahamiyatli va teng ahamiyatga ega bo'lmagan chorrahalarda harakatlanish imtiyozlari hamda o'ng qo'l qoidasi.",
    ruleCode: "YHQ 13-band",
    icon: "🚦",
    readTime: "15 daqiqa",
    sections: [
      {
        heading: "Tartibga solinggan chorrahalar",
        content: "Svetofor yoki tartibga soluvchining ishoralari barcha imtiyoz belgilaridan ustun turadi. Svetoforning yashil chirog'i yonib tursa, imtiyoz belgisiga amal qilinmaydi.",
        signs: []
      },
      {
        heading: "Tartibga solinmagan chorrahalar va Asosiy yo'l",
        content: "Asosiy yo'lda kelayotgan haydovchi ikkinchi darajali yo'ldagilarga nisbatan imtiyozga ega. Agar yo'llar teng ahamiyatli bo'lsa, 'O'ng qo'l qoidasi' amal qiladi: o'ng tomondan kelayotgan transport vositasiga yo'l beriladi.",
        signs: ["2.1", "2.4"]
      },
      {
        heading: "Chorrahada burilish holatlari",
        content: "Chapga yoki qayta burilayotgan haydovchi qarama-qarshi tomondan to'g'ri yoki o'ngga harakatlanayotgan transport vositalariga yo'l berishi shart.",
        signs: []
      }
    ],
    relatedScenarioIds: ["sc-0001", "sc-0003", "sc-0005"]
  },
  {
    id: "lesson-03",
    title: "3. Harakatlanish tezligi va masofa",
    topic: "speed_limits",
    description: "Aholi punktlarida va ulardan tashqaridagi tezlik me me'yorlari hamda xavfsiz oraliq masofa.",
    ruleCode: "YHQ 9-band",
    icon: "⚡",
    readTime: "8 daqiqa",
    sections: [
      {
        heading: "Ruxsat etilgan maksimal tezliklar",
        content: "Aholi punktlarida yengil avtomobillar uchun maksimal tezlik 60 km/soat (maktab va turar-joy hududlarida 30-50 km/soat). Aholi punktlaridan tashqarida — 90 km/soat.",
        signs: ["3.24"]
      },
      {
        heading: "Xavfsiz masofa",
        content: "Haydovchi oldinda borayotgan transport vositasi keskin to'xtaganda to'qnashuvning oldini oladigan xavfsiz masofani saqlashi shart.",
        signs: []
      }
    ],
    relatedScenarioIds: ["sc-0004"]
  },
  {
    id: "lesson-04",
    title: "4. Quvib o'tish va to'xtash qoidalari",
    topic: "overtaking",
    description: "Quvib o me'yorlari, taqiqlangan joylar va to'xtab turish qoidalari.",
    ruleCode: "YHQ 11-12-bandlar",
    icon: "🏎️",
    readTime: "12 daqiqa",
    sections: [
      {
        heading: "Quvib o'tish taqiqlangan joylar",
        content: "Chorrahalarda, piyodalar o'tish joylarida, temir yo'l o'tish joylarida (100m yaqinida), ko'priklarda va ko'rish imkoniyati cheklangan burilishlarda quvib o'tish taqiqlanadi.",
        signs: ["3.20"]
      },
      {
        heading: "To'xtash va to'xtab turish",
        content: "Yo'lning o'ng tomonidagi yon chekkasida, trotuarga yaqin joyda ruxsat etiladi. Chorraha kesishmasidan 5 metr va piyodalar o'tish joyidan 5 metr masofada to'xtash taqiqlanadi.",
        signs: ["3.27", "3.28"]
      }
    ],
    relatedScenarioIds: ["sc-0002", "sc-0004"]
  }
];

function ensureInit() {
  mkdirSync(LESSONS_DIR, { recursive: true });
  const files = readdirSync(LESSONS_DIR).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    for (const lesson of INITIAL_LESSONS) {
      writeFileSync(path.join(LESSONS_DIR, `${lesson.id}.json`), JSON.stringify(lesson, null, 2));
    }
  }
}

export function listLessons() {
  ensureInit();
  return readdirSync(LESSONS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(path.join(LESSONS_DIR, f), "utf8"));
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function getLessonById(id) {
  ensureInit();
  const file = safeLessonPath(id);
  if (!file || !existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function saveLesson(lesson) {
  ensureInit();
  if (!lesson.id) {
    lesson.id = `lesson-${Date.now()}`;
  }
  const file = safeLessonPath(lesson.id);
  if (!file) throw new Error("Invalid lesson ID format");
  writeFileSync(file, JSON.stringify(lesson, null, 2));
  return lesson;
}

export function deleteLesson(id) {
  ensureInit();
  const file = safeLessonPath(id);
  if (!file) return false;
  if (existsSync(file)) {
    unlinkSync(file);
    return true;
  }
  return false;
}
