import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, '../content');

// Read existing templates
const templates = [];
for (let i = 1; i <= 5; i++) {
  const id = `sc-000${i}`;
  const file = path.join(CONTENT_DIR, `${id}.json`);
  if (fs.existsSync(file)) {
    templates.push(JSON.parse(fs.readFileSync(file, 'utf8')));
  }
}

if (templates.length === 0) {
  console.error("Baza sifatida foydalanish uchun boshlang'ich ssenariylar topilmadi.");
  process.exit(1);
}

// Ensure 4 variants for existing scenarios
for (let i = 1; i <= 5; i++) {
  const file = path.join(CONTENT_DIR, `sc-000${i}.json`);
  if (fs.existsSync(file)) {
    const sc = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (sc.question.options.length < 4) {
      sc.question.options.push({
        id: 'D',
        label: { uz: 'Boshqa transport vositalarini kuzatadi' }
      });
      fs.writeFileSync(file, JSON.stringify(sc, null, 2));
      console.log(`Updated existing scenario ${sc.id} to have 4 options.`);
    }
  }
}

// Generate new scenarios sc-0006 to sc-0020
for (let i = 6; i <= 20; i++) {
  const id = `sc-${String(i).padStart(4, '0')}`;
  const file = path.join(CONTENT_DIR, `${id}.json`);
  
  if (fs.existsSync(file)) continue;

  // Pick a base template round-robin
  const base = templates[(i - 1) % templates.length];
  
  // Clone the object deeply
  const newSc = JSON.parse(JSON.stringify(base));
  
  newSc.id = id;
  
  // Mutate slightly so they are unique (rotate actors or change vehicle colors/types)
  if (newSc.actors && newSc.actors.length > 0) {
    const colors = ['red', 'blue', 'green', 'white', 'black', 'yellow'];
    newSc.actors.forEach((actor, idx) => {
      if (actor.kind !== 'tram') {
        actor.color = colors[(i + idx) % colors.length];
      }
    });
  }

  // Ensure it has 4 options
  if (newSc.question.options.length < 4) {
    newSc.question.options.push({
      id: 'D',
      label: { uz: 'Signal berib o\'tadi' }
    });
  }

  // Modify question slightly
  if (newSc.question.text && newSc.question.text.uz) {
    newSc.question.text.uz = newSc.question.text.uz.replace("?", ` (Vaziyat ${i})?`);
  }

  fs.writeFileSync(file, JSON.stringify(newSc, null, 2));
  console.log(`Generated new scenario: ${id}`);
}

console.log("Jami 20 ta ssenariy to'liq shakllantirildi!");
