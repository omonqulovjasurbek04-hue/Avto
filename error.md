# AVTO (YHQ) Loyihasi: To'liq Audit, Aniqlangan Xatoliklar va Yechimlar Hisoboti

> **Hujjat maqsadi:** Ushbu fayl **AVTO (YHQ) platformasi** monoreposidagi barcha komponentlarni (Backend, Frontend Web, Mobile Expo, Scenario Engine, Tools, Database) chuqur tahlil qilish, mavjud xatolar, ziddiyatlar, va yetishmayotgan funksionalliklarni ro'yxatga olish hamda ularni bartaraf etish bo'yicha aniq harakatlar rejasini taqdim etadi.

---

## 1. Loyihaning Umumiy Ahvoli va Strukturasi

Loyiha monorepo formatida tuzilgan va 2 ta asosiy mahsulot yo'nalishini o'z ichiga oladi:
1. **Scenario Engine (Dart/Canvas renderer):** Ssenariy JSON fayllari asosida 2D chorraha animatsiyalarini va simulyatsiyani hisoblash motori.
2. **Mashina Test / Video-based Driving Test:** Cloudflare Stream video darsliklar va javob natijasiga qarab video (to'qnashuv / to'g'ri harakat) ko'rsatuvchi platforma (NestJS + Next.js + Expo).

Biroq, loyihani o'rganish davomida bir qancha kritik xatoliklar, ma'lumotlar formati ziddiyatlari, eski/takroriy fayllar va ishlamayotgan scriptlar aniqlandi.

---

## 2. Kiritilgan va Aniqlangan Kritik Xatoliklar Ro'yxati

### 🔴 A. Backend (NestJS + Prisma + DB) Xatolari

1. **Ma'lumotlar Bazasi (Postgres vs SQLite) Ziddiyati:**
   - **Xato:** `Task.md` hujjatida baza **PostgreSQL** bo'lishi shart qilib belgilangan, `.env.example` faylida ham Postgres URL berilgan (`postgresql://postgres:...`). Lekin `backend/prisma/schema.prisma` faylida `provider = "sqlite"` va `backend/.env` faylida `DATABASE_URL="file:./prisma/dev.db"` ko'rsatilgan.
   - **Oqibat:** Ishlab chiqarish va local muhit orasida DB provider ziddiyati yuzaga keladi.

2. **Frontend so'rayotgan API endpointlarining Backend'da mavjud emasligi:**
   - **Xato 1 (`/api/practice/check`):** `frontend/src/app/practice/page.js` va `frontend/src/lib/api.js` ichidagi `checkAnswer` funksiyasi `POST /api/practice/check` endpointiga so'rov yuboradi. Lekin NestJS backend'da `practice` moduli ham, bu controller endpoint ham **umuman yo'q**! (Faqat `tests`, `questions`, `categories`, `videos` mavjud). User amaliyot testida javob tanlasa **404 Not Found** qaytadi.
   - **Xato 2 (`/api/lessons`):** `frontend/src/app/lessons/page.js` sahifasi nazariy darslarni olish uchun `GET /api/lessons` chaqiradi. Lekin Backend'da `Lessons` moduli va controller'i yo'q!

3. **Backend Node Modules & TypeScript Type Definition (`TS2688`) Xatoligi:**
   - **Xato:** `backend` papkasida TypeScript kompiyatsiyasi (`npx tsc --noEmit`) bajarilganda `Cannot find type definition file for 'express'`, `'passport-jwt'`, `'uuid'` xatolari beradi.
   - **Sabab:** `backend/node_modules/@types/` papkasidagi paketlar strukturasi buzilgan yoki to'liq install bo'lmagan.

---

### 🔴 B. Frontend Web (Next.js) va API Data Contract Xatolari

1. **Backend va Frontend Video Ma'lumotlar Formati Ziddiyati (Kritik Bug!):**
   - **Xato:** `backend/src/modules/tests/tests.service.ts` faylidagi `answerQuestion` methodi javob natijasini quyidagi formatda qaytaradi:
     ```json
     {
       "isCorrect": true,
       "video": {
         "playbackUrl": "https://...",
         "durationSec": 10,
         "type": "CORRECT"
       }
     }
     ```
     Lekin `frontend/src/app/test/[sessionId]/page.js` sahifasi (154-satr) videoni ko'rsatishda:
     ```jsx
     <VideoPlayer url={feedback?.videoUrl} type={...} />
     ```
     deb `feedback.videoUrl` ni kutmoqda!
   - **Oqibat:** `feedback.videoUrl` har doim `undefined` bo'ladi, natijada web sahifasida test yechilgandan keyin **VIDEO HECH QACHON O'YNAMAYDI**.

2. **Duplikat Komponentlar va Turlarning Aravalashishi:**
   - **Xato:** `frontend/src/components/` papkasida **bir vaqtning o'zida** `VideoPlayer.jsx` (JS) va `VideoPlayer.tsx` (TSX) fayllari mavjud. Import qilishda chalkashliklar bor.
   - **Xato:** `frontend/package.json` faylida devDependencies ichida `typescript` to'liq ko'rsatilmagan.

3. **`PracticePage` da Ssenariy Simulyatsiyasi Ma'lumotlari Etishmovchiligi:**
   - `frontend/src/app/practice/page.js` savolning `question.rawData` JSON maydonidan `scenarioId` o'qishga harakat qiladi. Lekin Prisma DB `Question` modelida `rawData` maydoni mavjud emas!

---

### 🔴 C. Mobil Ilova (Expo / React Native) Xatolari

1. **Deprecation bo'lgan `expo-av` Kutubxonasining Ishlatilishi:**
   - **Xato:** `frontend/mobile/package.json` va `frontend/mobile/src/components/VideoPlayer.js` da `expo-av` kutubxonasidan foydalanilgan.
   - **Ziddiyat:** `Task.md` texnik topshirig'ida ta'kidlanganidek, `expo-av` Expo SDK 52'da **deprecated** bo'lgan va SDK 55'da butunlay olib tashlanadi. Uning o'rniga `expo-video` (`VideoPlayer` + `VideoView` API, persistent cache, preloading) ishlatilishi shart.

2. **Hardcoded Local IP Manzillar:**
   - `frontend/mobile/src/components/VideoPlayer.js` faylida URL sifatida `http://10.0.2.2:4000` (faqat Android emulator uchun) qattiq yozib qo'yilgan. Bu real qurilmada yoki iOS emulatorda videolarni yuklamaydi.

---

### 🔴 D. Loyiha Fayllar Tuzilishidagi Takrorlanish va Keraksiz Papkalar (Clutter)

1. **Eski/Duplikat `mashina-test` Papkalari:**
   - Loyiha ildizida (`/mashina-test`) hamda frontend ichida (`/frontend/mashina-test`) alohida, mustaqil papka va `package.json` lar yaratilib qolib ketgan.
   - Ildizdagi asosiy ishchi papkalar esa `backend/`, `frontend/`, `shared/` hisoblanadi. Bu keraksiz duplikatlar chalkashlik yuzaga keltirmoqda.

---

### 🔴 E. Avtomatlashtirish va Script (`run.bat`, `tools`) Xatolari

1. **`run.bat` Skriptidagi Yo'l (Path) Xatosi:**
   - **Xato:** `run.bat` faylining 127 va 145-satrlarida mobil ilovani ishga tushirish uchun `cd mobile` buyrug'i berilgan.
   - **Oqibat:** Ildiz papkada `mobile` degan papka yo'q! U `frontend/mobile` ichida joylashgan. Natijada `run.bat` orqali [4] yoki [5] tanlanganda **"The system cannot find the path specified"** xatosi chiqadi va mobil ilova ishga tushmaydi.
   - **Xato:** 83-satrda izohda `seed.mjs` deyilgan, lekin chaqirilayotgan nom `seed.ts`.

2. **`tools/validate.js` va `tools/codegen.js` Papka Manzili Xatosi:**
   - `tools/validate.js` (12-satr) va `tools/codegen.js` (11-satr) da `SCHEMA_DIR` / `SCHEMA_PATH` manzili `path.join(ROOT, "frontend", "schema")` deb berilgan.
   - **Lekin** schema fayllari `ROOT/schema` papkasida joylashgan (`frontend/schema` mavjud emas).

---

## 3. Xatoliklarni Bartaraf Etish va Loyihani To'g'rilash Rejasi

Loyiha to'liq va barqaror ishlashi uchun quyidagi amallar ketma-ket bajarilishi kerak:

### 🛠️ 1-Bosqich: Loyiha Ildizini va Skriptlarni Tozalash
- [ ] **`run.bat` ni tuzatish:** 127 va 145-satrlardagi `cd mobile` ni `cd frontend\mobile` ga o'zgartirish. Izohlarni to'g'rilash.
- [ ] **Tools manzilini tuzatish:** `tools/validate.js` va `tools/codegen.js` ichidagi `frontend/schema` yo'llarini `schema` ga almashtirish.
- [ ] **Keraksiz duplikatlarni o'chirish/arxivlash:** Rootdagi va `frontend/` ichidagi keraksiz duplikat `mashina-test` papkalarini tozalash.

### 🛠️ 2-Bosqich: Backend va Bazani Standartlashtirish
- [ ] **Prisma Providerini to'g'rilash:** `backend/prisma/schema.prisma` va `backend/.env` ni PostgreSQL (yoki local SQLite ishlatilsa aniq ajratib) moslashtirish.
- [ ] **Backend `@types` muammosini hal qilish:** `backend` papkasida `npm install` ni qayta toza bajarish va `@types/express`, `@types/passport-jwt`, `@types/uuid` lar to'g'ri o'rnashishini ta'minlash.
- [ ] **Yetishmayotgan API Controllerlarini yaratish:**
  - `PracticeController`: `POST /api/practice/check` endpointini yaratish (savol javobini va simulyatsiya natijasini tekshirish uchun).
  - `LessonsController`: `GET /api/lessons` va `GET /api/lessons/:id` endpointlarini yaratish (nazariy darsliklarni qaytarish uchun).

### 🛠️ 3-Bosqich: Frontend Web va API Shartnomasini Tuzatish
- [ ] **Video URL kontratini to'g'rilash:** `frontend/src/app/test/[sessionId]/page.js` sahifasidagi `VideoPlayer` ga uzatilayotgan propsni `url={feedback?.video?.playbackUrl}` shakliga keltirish.
- [ ] **VideoPlayer komponentlarini unifikatsiya qilish:** `VideoPlayer.jsx` va `VideoPlayer.tsx` lardan birini tanlab, to'liq TypeScript `VideoPlayer.tsx` ga o'tkazish.
- [ ] **Prisma va Frontend Schema sinxronizatsiyasi:** `Question` modeliga `rawData` yoki `scenarioId` maydonini qo'shish yoki `PracticePage` da dinamik bog'lanishni to'g'rilash.

### 🛠️ 4-Bosqich: Mobil Ilovani Modernizatsiya Qilish
- [ ] **`expo-av` ni `expo-video` ga almashtirish:** `frontend/mobile/package.json` ga `expo-video` qo'shish va `VideoPlayer.js` ni `VideoView` hamda `useVideoPlayer` bilan qayta yozish.
- [ ] **API URL dinamik sozlanishini ta'minlash:** `ENV` fayli orqali Backend URL ni boshqarish.

---

## 4. Xulosa

Loyihaning arxitekturasi va g'oyasi (video hamda simulyatsiya asosidagi haydovchilik testi) juda kuchli va zamonaviy. Yuqorida ko'rsatilgan xatoliklar asosan modullarni birlashtirish (integration) bosqichidagi mosriqsizliklar va path xatoliklaridir. Ushbu hujjatdagi tavsiyalar va tuzatishlar amalga oshirilgach, loyiha to'liq va xatosiz ishlaydi.
