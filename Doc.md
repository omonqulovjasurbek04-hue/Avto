# AVTO (YHQ) — Loyihani To'liq Ko'rib Chiqish va Kamchiliklar Ro'yxati

> Ushbu hujjat 2026-07-30 kuni backend, web va mobile qismlarini backend API bilan bog'lash bo'yicha bajarilgan ishlarni va shu jarayonda topilgan/qolgan kamchiliklarni sanab o'tadi. `Task.md` — loyihaning rejasi; bu fayl — o'sha rejaga nisbatan **haqiqiy holat** hisoboti.

---

## 0. MUHIM OGOHLANTIRISH — kutilmagan avtomatik commit

Ish jarayonida repo tarixida **men yaratmagan** commit topildi:

```
4f5b1d4 feat(schema): add question and scenario schemas with corresponding TypeScript interfaces
```

Bu commit — vaqt jihatidan mening tahrirlarim bilan mos keladi va **aynan mening o'zgartirgan fayllarimni** o'z ichiga oladi (`schema.prisma`, `seed.ts`, `scene.util.ts`, barcha yangilangan view'lar va h.k.). Lekin commit **xabari** butunlay boshqa narsani tasvirlaydi — "QuestionBankEntry", "PlainOption", "Scenario interface", "Google GenAI research tool" kabi men yaratmagan narsalar haqida yozilgan.

**Xulosa:** Ushbu muhitda (VS Code) fayllarni saqlaganda avtomatik ravishda commit qiluvchi kengaytma (masalan GitDoc kabi "auto-commit on save" plagini) ishlab turibdi va **to'g'ridan-to'g'ri `main` branch'ga** commit qilmoqda — commit xabari esa haqiqiy o'zgarishlarni aniq tasvirlamayapti (ehtimol boshqa/eski holatga asoslangan avtomatik/AI-generatsiya qilingan matn). `git status --short` da hozir ham mening navbatdagi o'zgarishlarim avtomatik ravishda **staged** holatda ko'rinmoqda — men buni o'zim `git add` qilmadim.

**Tavsiya:** VS Code'dagi kengaytmalar ro'yxatini tekshirib, avtomatik commit qiluvchi vositani (agar kerak bo'lmasa) o'chirib qo'ying yoki uni alohida branch'ga commit qiladigan qilib sozlang — hozirgi holatda u `main`'ga to'g'ridan-to'g'ri yozяpti va commit xabarlari ishonchli emas.

---

## 1. Ushbu sessiyada bajarilgan ishlar

### Backend
- `Question`/`Answer` modellariga `sceneJson`, `resolutionJson`, `optionKey`, `externalId` maydonlari qo'shildi — bu `backend/content/sc-0001..0020.json` dagi 20 ta tayyor "chorraha stsenariysi" (yo'llar, ustunlik belgilari, ishtirokchilar, to'g'ri/xato natija va YHQ moddasi) endi haqiqiy savol sifatida ishlatiladi.
- Yangi kategoriya: **"Ustunlik va chorrahalar (Amaliy simulyatsiya)"** — 20 ta savol, har biri video o'rniga **SVG simulyatsiya** orqali natija ko'rsatadi (Cloudflay hisobingiz sozlanmagani sababli video emas, animatsiya tanlandi — sizning tanlovingiz bilan).
- `GET /categories/:id/questions` — endi `scene`/`actors` (ochiq, xavfsiz qism) qaytaradi; `resolutionJson` (to'g'ri javob qaysi ekanini fosh qiladigan qism) **hech qachon** javobdan oldin chiqmaydi — faqat javob berilgandan keyin.
- `POST /practice/check` va `POST /tests/:id/answer` — endi `scene: {status, order, collideWith, ruleCode, ruleText}` qaytaradi, frontend shu orqali animatsiya va YHQ tushuntirishini chizadi.
- Yangi admin endpoint: `GET /admin/categories/:id/questions` — admin panelida savol+javoblarni (isCorrect bilan) ro'yxat qilish uchun.
- Xavfsizlik: Cloudflare webhook imzosini tekshirish `crypto.timingSafeEqual` bilan almashtirildi (avval oddiy `===` edi).
- `.env.example` tuzatildi: haqiqiy ishlatilayotgan o'zgaruvchilar bilan mos qilindi (avval Postgres URL yozilgan edi, aslida SQLite ishlatiladi; `CLOUDFLARE_API_TOKEN` nomi kod bilan endi mos).
- **Seed skripti to'liq qayta yozildi** (pastda 2-bo'limda batafsil — jiddiy xato topilib, tuzatildi).

### Web (frontend/)
- `frontend/src/api/client.ts` — to'liq API klient (auth, categories, practice, tests, lessons, admin), token yangilash (refresh) mantiqi bilan.
- `AuthContext` + `AuthModal` + `App.tsx` — endi **haqiqiy** ro'yxatdan o'tish/kirish/chiqish (avval bu butunlay soxta edi — istalgan email/parol bilan "kirish" mumkin edi).
- `SceneStage.tsx` — yangi komponent: backend'dan kelgan `scene`/`actors` ma'lumoti asosida chorrahani, ustunlik belgilarini va ishtirokchilarni chizadi; javobdan keyin xavfsiz o'tish (yashil, tsiklik) yoki to'qnashuv (qizil, bir marta + YHQ moddasi matni) animatsiyasini ko'rsatadi.
- `PracticeView`, `ExamView`, `LessonsView`, `AnalyticsView`, `AdminView` — barchasi **mock ma'lumotdan haqiqiy backend so'rovlariga** o'tkazildi.
- `ExamView` — endi haqiqiy `TestSession` oqimi (`/tests/start` → `/tests/:id/answer` → `/tests/:id/finish`) bilan ishlaydi.
- `AdminView` — kategoriyalar va savollarni ro'yxatlash/qo'shish/o'chirish real API orqali; video yuklash tugmasi haqiqiy `/admin/videos/upload-url`ni chaqiradi (Cloudflare sozlanmagani uchun aniq xabar chiqaradi, soxta progress-bar emas).

Barcha o'zgarishlar `tsc --noEmit` va `vite build` orqali xatosiz ekanligi tekshirildi; backend `nest build` xatosiz.

---

## 2. Tuzatilgan jiddiy xatolik: seed skripti FK (Foreign Key) muammosi

**Nima bo'ldi:** Men avval yozgan `prisma/seed.ts` har safar ishga tushganda savol/javoblarni **o'chirib, qaytadan yaratardi** (yangi ID bilan). Buni sinab ko'rganimda — haqiqiy foydalanuvchi biror savolga javob bergandan keyin (`TestSessionAnswer` yozuvi yaratilgach) seed'ni qayta ishga tushirsam, backend **"ForeignKeyConstraintViolation"** xatosi bilan qulab tushishini aniqladim (chunki eski javob o'chirilmoqchi bo'ladi, lekin unga tarix orqali hali ham murojaat bor).

**Tuzatish:** `Question`ga `externalId` (unique), `Answer`ga `(questionId, optionKey)` unique cheklov qo'shildi; endi seed skripti o'chirib-qayta yaratish o'rniga **upsert** (mavjud bo'lsa yangilaydi, bo'lmasa yaratadi) qiladi — ID'lar hech qachon o'zgarmaydi, shuning uchun mavjud test tarixi buzilmaydi.

**Muhim:** Bu tuzatish uchun `npx prisma db push --accept-data-loss` bajarilishi kerak edi — bu buyruq Prisma tomonidan "AI agent tomonidan bajarilishi xavfli" deb belgilangan va sizdan aniq ruxsat so'ralgan edi (siz "Ha, davom eting" dedingiz). Amalda hech qanday ma'lumot yo'qolmadi — faqat ikkita unique indeks qo'shildi, va men buni qayta test qilib tasdiqladim (real javob + qayta seed = xatosiz).

Shuningdek, tuzatishdan oldingi noto'g'ri seed ishga tushishlaridan qolgan **26 ta "yetim" (externalId'siz) dublikat savol** va sinov uchun yaratilgan 2 ta test foydalanuvchi (`smoketest@…`, `fktest@…`) tozalandi — hozir baza toza holatda.

---

## 3. Ikkinchi bosqichda bajarilgan ishlar (mobile ulash + qolgan kamchiliklar tuzatildi)

Birinchi hisobotdan keyin quyidagilar ham bajarildi va **haqiqiy Chromium brauzerda** (Playwright orqali) sinaldi:

### Mobile ilova — endi to'liq ulangan
- `frontend/mobile/store/authStore.ts` (zustand, avvaldan mavjud bo'lib ishlatilmagan kutubxona) — login/register/logout/restore.
- `frontend/mobile/services/api.ts` — token saqlash + **401 bo'lganda avtomatik refresh** va qayta urinish.
- `frontend/mobile/app/login.tsx` — yangi ekran (login/register formasi).
- `frontend/mobile/app/_layout.tsx` — ilova ochilganda tokenni tekshiradi, foydalanuvchi yo'q bo'lsa `/login`ga yo'naltiradi.
- `frontend/mobile/components/SceneView.tsx` — `react-native-svg` orqali (bu ham avvaldan mavjud, ishlatilmagan kutubxona edi) chorraha/ishtirokchi/natija animatsiyasi — web'dagi `SceneStage`ning soddalashtirilgan mobil versiyasi (harakat animatsiyasiz, statik holat + rang/banner orqali natija).
- `frontend/mobile/app/test/[sessionId].tsx` — **to'liq qayta yozildi**: endi haqiqiy `/tests/start → /tests/:id/answer → /tests/:id/finish` oqimi bilan ishlaydi, savol `index.tsx`dan navigatsiya parametri orqali uzatiladi.
- Tekshirildi: `npx tsc --noEmit` xatosiz, va `npx expo export --platform android` — **1029 modul xatosiz bundle qilindi** (real Metro bundler orqali; emulyator yo'qligi sababli vizual ravishda telefonda sinalmadi — bu haliham ochiq holat, pastda yozilgan).

### Boshqa tuzatilgan kamchiliklar
- **Email yoki telefon orqali ro'yxatdan o'tish/kirish** qo'shildi (`Task.md` talabi) — backend `RegisterDto`/`LoginDto` yangilandi (`identifier` maydoni orqali login), web va mobil forma ham shu bo'yicha yangilandi. `curl` orqali barcha kombinatsiya (faqat email, faqat telefon, ikkalasi ham yo'q — xato qaytaradi, email bilan kirish, telefon bilan kirish) sinaldi.
- **Imtihon sessiyasi endi sahifa yangilanishidan keyin ham tiklanadi** — `ExamView` holati (`sessionId`, joriy savol, tarix, tugash vaqti) `localStorage`da saqlanadi. **Muhim topilma:** bu SPA'da hech qanday URL-marshrutlash (routing) yo'q — barcha "sahifalar" faqat React state (`activeView`) orqali almashadi. Demak brauzerni yangilash (F5) **doim Bosh sahifaga** qaytaradi, qaysi bo'limda turgan bo'lsangiz ham. Tuzatishim shuni ta'minlaydi: agar keyin qayta "Imtihon" bo'limiga o'tsangiz, tugallanmagan sessiya davom etadi (savol raqami, tarix, taymer to'g'ri tiklanadi) — sinaldi va tasdiqlandi (skrinshot: 20 savoldan 2-savolga javob berilgach sahifa to'liq qayta yuklandi, keyin "Imtihon"ga qaytilganda aynan 2-savolda, 1/20 javob bilan, taymer davom etgan holda tiklandi).
- `AuthModal`dagi ishlamaydigan (faqat `alert` chiqaruvchi) "Parolni unutdingizmi?" tugmasi olib tashlandi — chunki backend'da bunday endpoint yo'q edi va tugma foydalanuvchini chalg'itardi.

### Brauzerda to'liq tekshirilgan oqim (Playwright, Chromium)
Quyidagilar real backend + real brauzerda ishlayotgani tasdiqlandi (console xatosi 0 ta):
1. Ro'yxatdan o'tish → header'da haqiqiy ism ko'rinishi.
2. Practice: "Ustunlik va chorrahalar" kategoriyasi → SVG sahna (yo'llar, "SIZ"/"TRM" ishtirokchilari) to'g'ri chizildi.
3. Imtihon: 20 savolli kategoriyada boshlash → 2 savolga javob → sahifani to'liq qayta yuklash → "Imtihon"ga qaytish → **aynan shu sessiya, 2-savolda, tarix va taymer bilan tiklandi**.
4. Oddiy (USER) foydalanuvchi Admin Panelga kirganda "Ruxsat yo'q" xabari chiqishi tasdiqlandi.

---

## 4. Hali qolgan kamchiliklar (2-bosqichdan keyin)

### Mobile
- Kod yozilgan, tip xatosiz va Metro orqali bundle qilingan, lekin **haqiqiy qurilma/emulyatorda vizual ravishda sinalmagan** (bu muhitda Android/iOS emulyator yo'q). Ishga tushirishdan oldin `npx expo start` bilan haqiqiy qurilmada bir bor tekshirib chiqish tavsiya etiladi.

### Kontent to'liq emas
- Faqat **"Ustunlik va chorrahalar"** kategoriyasida (20 ta savol) vizual SVG-simulyatsiya bor. Qolgan 3 ta kategoriya (`Yo'l belgilari`, `Svetofor va signallar`, `Ustunlik huquqi`) — jami 6 ta savol — hech qanday `scene` ma'lumotiga ega emas (Mobile View skrinshotida ham shu holat ko'rinadi — bu kontent tayyorlanmaganidan, kod xatosidan emas).

### Cloudflare / video quvuri sinalmagan
- `CLOUDFLARE_ACCOUNT_ID`/`CLOUDFLARE_API_TOKEN` sozlanmagani sababli `/admin/videos/upload-url` va webhook oqimi **hech qachon haqiqiy sharoitda sinalmagan** — faqat "Cloudflare not configured" xatosi qaytarilishi tekshirildi.

---

## 5. Tavsiya etiladigan keyingi qadamlar (ustuvorlik bo'yicha)

1. **VS Code avtomatik-commit kengaytmasini tekshiring/o'chiring** — hozir noaniq commit xabarlari bilan to'g'ridan-to'g'ri `main`'ga yozilmoqda (0-bo'lim).
2. Mobile ilovani haqiqiy qurilma/emulyatorda (`npx expo start`) bir bor ko'zdan kechiring.
3. Qolgan 3 ta kategoriya uchun ham `sc-*.json` formatidagi stsenariylar tayyorlash.

---

## 6. Uchinchi bosqich — Graphify orqali tahlil va butun loyihani tuzatish

Grafify skill (`.claude/skills/graphify/`) loyiha ustida ishga tushirildi (833 nodes, 1165 edges, 0 import cycle) — arxitektura darajasida jiddiy muammo topilmadi (kutilgan bog'lanishlar: Prisma/decorator'lar orqali). Shundan so'ng qolgan `Doc.md` kamchiliklari + qo'lda ko'rib chiqish orqali quyidagilar tuzatildi:

### KRITIK — topilgan haqiqiy xavfsizlik/mantiq xatosi: refresh token IMZOSI noto'g'ri edi
**Bu loyihada avvaldan bor, men yaratmagan eng jiddiy xato edi.** `AuthModule`da `JwtModule.register({ secret: JWT_ACCESS_SECRET })` — bitta global `JwtService` FAQAT access-secret bilan sozlangan edi. `AuthService.generateTokens()` esa refresh tokenni ham xuddi shu (access) sirli kalit bilan imzolardi, lekin `JwtRefreshStrategy` uni **`JWT_REFRESH_SECRET`** bilan tekshiradi. Natijada **`POST /auth/refresh` hech qachon ishlamagan** — har doim imzo mos kelmasligi sababli "Unauthorized" qaytargan (buni yangi login-logout testini sinab ko'rganimda tasodifan aniqladim; toza server bilan ham qayta tasdiqladim). Amalda bu shuni anglatadi: 15 daqiqalik access token muddati tugagach, foydalanuvchi **hech qachon** jim tarzda yangilanmagan — token muddati tugashi bilan darhol tizimdan chiqib ketishga majbur bo'lardi.

**Tuzatish:** `generateTokens()`da refresh token endi aniq `secret: JWT_REFRESH_SECRET` bilan imzolanadi. `curl` orqali to'liq sinaldi: ro'yxatdan o'tish → darhol `/auth/refresh` → muvaffaqiyatli yangi token juftligi qaytdi.

### Logout endi faqat joriy qurilmani chiqaradi
`Doc.md`ning 4-bo'limida yozilgan nozik joy tuzatildi: `POST /auth/logout` endi `{refreshToken}`ni tanasida qabul qiladi (`refresh` endpoint kabi) va faqat o'sha bitta sessiyani bekor qiladi; `refreshToken` berilmasa — barchasini bekor qiladi (`logoutAll`, eski xulq-atvor sifatida saqlab qolindi). Web va mobil klientlar mos ravishda yangilandi. `AuthContext`dagi tartib xatosi ham tuzatildi (avval token **tozalangandan keyin** logout so'rovi yuborilardi — demak `refreshToken` allaqachon yo'qolgan bo'lardi; endi so'rov birinchi ketadi). `curl` bilan sinaldi: sessiya-2ni chiqarish sessiya-1ga ta'sir qilmasligi tasdiqlandi.

### SPA endi haqiqiy URL-marshrutlash bilan ishlaydi
`react-router-dom` qo'shildi. `App.tsx` endi `activeView` React state o'rniga haqiqiy `<Routes>`/`<Route>` ishlatadi (`/`, `/lessons`, `/practice`, `/exam`, `/analytics`, `/admin`, `/mobil`). Natijada **F5 (sahifani yangilash) endi qaysi bo'limda tursangiz — o'sha yerda qoladi**, Bosh sahifaga qaytmaydi. Brauzerda sinaldi: `/lessons`da yangilash → `/lessons`da qoladi; to'g'ridan-to'g'ri `/practice`, `/exam` manzillariga o'tish ham ishlaydi.

### MobileView.tsx endi haqiqiy backend ma'lumotidan foydalanadi
Avval butunlay soxta (`mockData.ts`) edi. Endi real `categoriesApi`/`practiceApi`/`testsApi` orqali ishlaydi, savol javobini tekshirishda haqiqiy `SceneStage` animatsiyasi ko'rsatiladi, "Tarix" va "Profil" tablari haqiqiy foydalanuvchi ma'lumotini (yoki tizimga kirish talabini) ko'rsatadi. Endi ishlatilmay qolgan `frontend/src/data/mockData.ts` va `frontend/src/components/VideoPlayer.tsx` fayllari, shuningdek `types.ts`dagi 10 ta ishlatilmagan eski tip (`VideoItem`, `Question`, `UserStats` va h.k.) o'chirildi.

### Bundle hajmi kamaytirildi (code-splitting)
Barcha marshrut komponentlari (`LessonsView`, `PracticeView`, `ExamView`, `AnalyticsView`, `AdminView`, `MobileView`) endi `React.lazy()` orqali yuklanadi. Asosiy JS bundle **706 KB → 271 KB** ga tushdi (gzip: 208 KB → 85 KB); `AnalyticsView` (recharts kutubxonasi tufayli 372 KB) endi faqat `/analytics`ga kirilganda yuklanadi. Vite'ning "chunk 500KB dan katta" ogohlantirishi endi chiqmaydi.

### Hammasi qayta tekshirildi
Backend `nest build`, web `tsc --noEmit` + `vite build`, mobil `tsc --noEmit` + `expo export --platform android` (1029 modul) — barchasi xatosiz. Playwright orqali brauzerda: ro'yxatdan o'tish, marshrutlash (chuqur havola + F5), code-splitting (barcha lazy sahifalar yuklandi), MobileView haqiqiy ma'lumot bilan — barchasi console xatosi 0 ta holda tasdiqlandi.
