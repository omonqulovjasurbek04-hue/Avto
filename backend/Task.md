# AVTO (YHQ) — Backend

Express REST API + PostgreSQL/Prisma + JWT Auth + pure JS scenario engine.

---
# AVTO (YHQ) — Backend uchun To'liq Struktura va Prompt

Bu — barcha oldingi tuzatishlarni (Auth, Prisma/Postgres, dublikatsiyasiz content serving) o'z ichiga olgan **yakuniy backend** brifi.

## 1. To'liq fayl strukturasi (tuzatilgan)

```
backend/server/
├── package.json                    ← @yhq/server
├── .env                             ← DATABASE_URL, JWT_SECRET, PORT, CORS_ORIGINS
├── prisma/
│   ├── schema.prisma                ← ✅ YANGI: User, Answer, ExamAttempt
│   └── migrations/                  ← Prisma avtomatik generatsiya qiladi
│
├── src/
│   ├── index.mjs                   → Server entry (port 4000, 0.0.0.0)
│   │                                  CORS, static, error handler,
│   │                                  helmet (xavfsizlik header'lari)
│   │
│   ├── auth/                        ← ✅ YANGI
│   │   ├── auth.routes.mjs         → POST /register, /login, GET /me
│   │   ├── auth.controller.mjs     → request/response boshqaruvi
│   │   ├── auth.service.mjs        → parol hash (bcrypt), JWT sign/verify
│   │   └── auth.middleware.mjs     → Bearer token tekshiruvi (requireAuth)
│   │
│   ├── scenarios/
│   │   ├── scenarios.routes.mjs    → GET /scenarios, /:id, /:id/info, /:id/frame
│   │   ├── scenarios.controller.mjs
│   │   └── scenarios.service.mjs   → content.mjs + engine.mjs dan foydalanadi
│   │
│   ├── lessons/
│   │   ├── lessons.routes.mjs      → GET /lessons, /:id
│   │   └── lessons.service.mjs
│   │
│   ├── progress/                    ← ✅ O'ZGARTIRILGAN (endi Prisma orqali)
│   │   ├── progress.routes.mjs     → GET /progress, POST /progress/answer
│   │   │                              (requireAuth middleware bilan himoyalangan)
│   │   └── progress.service.mjs    → Prisma Answer modeliga yozadi/o'qiydi
│   │
│   ├── exams/
│   │   ├── exams.routes.mjs        → GET /exams/generate, POST /exams/submit
│   │   │                              (requireAuth bilan himoyalangan)
│   │   └── exams.service.mjs       → Prisma ExamAttempt modeliga yozadi
│   │
│   ├── admin/
│   │   ├── admin.routes.mjs        → POST/DELETE /admin/scenarios, /lessons
│   │   │                              GET /admin/validate, /admin/stats
│   │   └── admin.middleware.mjs    → ✅ YANGI: requireAdmin (role tekshiruvi)
│   │
│   ├── engine.mjs                  → @yhq/engine wrapper (o'zgarishsiz)
│   │                                  sceneInfo(), frame(), EngineError
│   ├── content.mjs                 → Ssenariy JSON fayllarni CRUD
│   │                                  (path traversal himoyasi, o'zgarishsiz)
│   │
│   ├── db.mjs                      → ❌ ESKI JSON-fayl logikasi OLIB TASHLANADI
│   ├── prisma-client.mjs           → ✅ YANGI: Prisma Client instansiyasi
│   │
│   └── middleware/
│       ├── error.middleware.mjs    → markazlashgan xato boshqaruvi
│       └── rateLimit.middleware.mjs ← ✅ YANGI: /auth/login uchun brute-force himoya
│
├── test/
│   ├── auth.test.mjs               → ✅ YANGI
│   ├── scenarios.test.mjs
│   ├── progress.test.mjs           → ✅ YANGILANGAN (Prisma bilan)
│   └── exams.test.mjs              → ✅ YANGI
│
└── public/
    ├── engine.js                   → ⭐ YAGONA MANBA — frontend/mobile
    │                                  shu yerdan to'g'ridan-to'g'ri oladi
    ├── content/                     → ⭐ YAGONA MANBA — ssenariy JSON'lar
    │                                  (yoki API orqali serve qilinadi,
    │                                  static emas — quyida tushuntirilgan)
    └── index.html                  → landing (ixtiyoriy, saqlanishi mumkin)

    (❌ videos.html, player.html — kerak emas, ular eski video-yondashuv
    qoldig'i, YHQ animatsion engine bilan almashtirilgan)
```

**Muhim qaror:** `content/` papkasi endi **faqat backend'da** yashaydi. Frontend/mobile uni static fayl sifatida emas, balki `GET /api/scenarios/:id` orqali oladi. `engine.js` esa `public/engine.js` orqali **bitta URL'dan** barcha platformalarga serve qilinadi (`sync_content.js`, `sync_engine.js` butunlay o'chiriladi).

## 2. Prisma schema (yakuniy versiya)

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  password     String        // bcrypt hash
  role         String        @default("user") // "user" | "admin"
  createdAt    DateTime      @default(now())
  answers      Answer[]
  examAttempts ExamAttempt[]
}

model Answer {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  scenarioId String   // masalan "sc-0001"
  optionId   String   // masalan "o1"
  isCorrect  Boolean
  answeredAt DateTime @default(now())

  @@index([userId])
}

model ExamAttempt {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  score     Int
  total     Int
  passed    Boolean
  createdAt DateTime @default(now())

  @@index([userId])
}
```

## 3. Auth middleware (asosiy qism)

```javascript
// src/auth/auth.middleware.mjs
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token topilmadi' });
  }
  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token yaroqsiz yoki eskirgan' });
  }
}

export function requireAdmin(req, res, next) {
  // requireAuth'dan keyin ishlaydi, req.userRole tekshiradi
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat yo\'q' });
  }
  next();
}
```

## 4. Yangilangan API endpointlar (to'liq ro'yxat)

```http
# AUTH
POST   /api/auth/register       { email, password }
POST   /api/auth/login          { email, password }         → { token }
GET    /api/auth/me             (Bearer)                     → { id, email, role }

# SSENARIYLAR (ochiq)
GET    /api/scenarios
GET    /api/scenarios?topic=signs
GET    /api/scenarios/:id
GET    /api/scenarios/:id/info
GET    /api/scenarios/:id/frame?t=2.5&option=o2

# DARSLIKLAR (ochiq)
GET    /api/lessons
GET    /api/lessons/:id

# PROGRESS (Bearer SHART)
GET    /api/progress                          → token'dagi userId'dan
POST   /api/progress/answer  { scenarioId, optionId }

# IMTIHON (Bearer SHART)
GET    /api/exams/generate
POST   /api/exams/submit  { answers: [...] }

# ADMIN (Bearer + role=admin SHART)
POST   /api/admin/scenarios
DELETE /api/admin/scenarios/:id
POST   /api/admin/lessons
DELETE /api/admin/lessons/:id
GET    /api/admin/validate
GET    /api/admin/stats

# STATIK
GET    /engine.js                             → dart2js kompilyatsiya fayli
```

## 5. To'liq Prompt — Backend uchun

```
════════════════════════════════════════════════════════════════
LOYIHA: AVTO (YHQ) — Backend qismi (Node.js + Express)
════════════════════════════════════════════════════════════════

MAVJUD HOLAT:
- Express.js server, port 4000, CORS sozlangan
- Ssenariy va darslik CRUD (content.mjs, lessons.mjs) — JSON fayl
  asosida, path traversal himoyasi bor
- Engine wrapper (@yhq/engine) — sceneInfo(), frame(), EngineError
- DB — hozircha faqat JSON fayl (data/progress.json),
  Mongo/Postgres ulanishi bor lekin CRUD yozilmagan
- Auth tizimi — YO'Q (progress foydalanuvchi ID string bilan
  himoyasiz boshqariladi)
- Content va engine.js frontend/mobile'ga sync skriptlari orqali
  nusxalanadi (sync_content.js, sync_engine.js)

QILINISHI KERAK BO'LGAN O'ZGARISHLAR (ustuvorlik tartibida):

1. PRISMA + POSTGRESQL O'RNATISH:
   - prisma/schema.prisma yaratish: User, Answer, ExamAttempt modellari
   - src/prisma-client.mjs — PrismaClient yagona instansiyasi
   - db.mjs dagi eski JSON-fayl logikasini olib tashlash
   - Migratsiya skripti: mavjud data/progress.json'dan Postgres'ga
     ko'chirish (agar production ma'lumot bo'lsa)

2. AUTH TIZIMINI QURISH:
   - src/auth/ papkasi: auth.routes.mjs, auth.controller.mjs,
     auth.service.mjs, auth.middleware.mjs
   - Parolni bcrypt bilan hash qilish (saltRounds: 10)
   - JWT token (jsonwebtoken kutubxonasi), muddati 7 kun
   - requireAuth middleware — barcha /progress va /exams
     endpointlariga qo'llash
   - requireAdmin middleware — /admin endpointlariga qo'llash
     (User.role === "admin" tekshiruvi)

3. PROGRESS VA EXAMS'NI PRISMA'GA KO'CHIRISH:
   - progress.service.mjs — endi req.userId (JWT'dan) orqali
     Prisma Answer modeliga yozadi/o'qiydi
   - exams.service.mjs — ExamAttempt modeliga yozadi
   - Eski :userId URL parametri OLIB TASHLANADI (endi token'dan olinadi)

4. CONTENT/ENGINE DUBLIKATSIYASINI TUGATISH:
   - sync_content.js va sync_engine.js skriptlarini O'CHIRISH
   - content/ papkasi FAQAT backend/server/public/content/ da qoladi
   - public/engine.js — CORS va Cache-Control header bilan
     to'g'ri sozlash (frontend/mobile shu yerdan olishi uchun)

5. XAVFSIZLIK VA CHEKLOVLAR:
   - helmet middleware qo'shish (HTTP header xavfsizligi)
   - rateLimit middleware — /auth/login endpointiga
     (5 daqiqada 5 urinish, brute-force himoyasi)
   - .env orqali JWT_SECRET, DATABASE_URL boshqarish,
     hech qachon kod ichida hardcode qilinmaydi

TEXNIK CHEKLOVLAR (o'zgarishsiz saqlanadi):
- Engine (@yhq/engine) logikasi O'ZGARTIRILMAYDI — faqat
  scenarios.service.mjs uni chaqirish usuli saqlanadi
- Ssenariy JSON formati (schema/scenario.schema.json) O'ZGARMAYDI
- Barcha javoblar JSON formatida, xato holatlar aniq status kod
  bilan qaytadi (400, 401, 403, 404, 422, 500)

BAJARISH TARTIBI:
  BOSQICH 1: prisma/schema.prisma + prisma-client.mjs
  BOSQICH 2: auth/ papkasi to'liq (routes, controller, service, middleware)
  BOSQICH 3: progress va exams servislarini Prisma'ga ko'chirish
  BOSQICH 4: sync skriptlarini o'chirish, static serving sozlash
  BOSQICH 5: helmet + rateLimit + testlar (auth.test.mjs, progress.test.mjs)

QABUL QILISH MEZONLARI:
☐ POST /api/auth/register va /login ishlaydi, JWT qaytaradi
☐ Token'siz /api/progress so'rovi 401 qaytaradi
☐ Noto'g'ri parol bilan 5 marta urinishdan keyin rateLimit ishlaydi
☐ /api/progress/answer chaqirilganda Postgres'da Answer yozuvi paydo bo'ladi
☐ /engine.js va /content/*.json to'g'ridan-to'g'ri backend'dan
  ochiladi, hech qanday frontend papkasida nusxa yo'q
☐ Barcha eski testlar (4 ta) + yangi auth testlari muvaffaqiyatli o'tadi

Iltimos, BOSQICH 1 dan boshlab, prisma/schema.prisma va
src/prisma-client.mjs fayllarini to'liq kod bilan yarating.
════════════════════════════════════════════════════════════════
```

Shu promptga muvofiq **Prisma schema va client** kodini hoziroq to'liq yozib beraymi, yoki avval **auth.service.mjs** (JWT+bcrypt logikasi) dan boshlaylikmi?
# Mashina Test — Node.js Backend (NestJS) — To'liq Struktura va Prompt

> Faqat backend (API) qismi. Web (Next.js) va mobil (React Native/Expo) — ikkalasi ham shu bitta API'ga ulanadi, lekin ular alohida bosqichda quriladi.

---

## 1. Texnologik tanlov (asoslab)

| Qatlam | Tanlov | Versiya |
|---|---|---|
| Til/Runtime | TypeScript / Node.js | Node ≥ 20 |
| Framework | **NestJS** | 11.x (barqaror) |
| ORM | **Prisma** | 7.x |
| Baza | **PostgreSQL** | 15+ |
| Auth | JWT (access + refresh) + argon2 | — |
| Validatsiya | class-validator / class-transformer | — |
| Video xostinig | Cloudflare Stream | — |
| Test | Jest | — |
| Keyinroq (MVP'dan keyin) | Redis + BullMQ | keshlash, queue, rate-limit store |

**Nega NestJS, Express emas?** Sizda Laravel tajribasi bor — NestJS aynan shu fikrlash uslubini takrorlaydi: controller/service/module ajratilgan, dependency injection Laravel'ning service container'iga o'xshaydi, guard'lar Laravel middleware/policy'ga, decorator'lar esa route attributelariga mos keladi. Express bilan bularning barchasini qo'lda qurishga to'g'ri keladi. Yagona kamchiligi — biroz ko'proq boshlang'ich boilerplate, lekin loyihangizda auth + admin + bir nechta modul borligi sababli bu investitsiya o'zini oqlaydi.

**Nega PostgreSQL, MySQL emas?** Oldingi tavsiyada MySQL "Laravel ekotizimida qulayroq" degan sabab bilan tanlangan edi — bu sabab Node.js'ga o'tganingizda kuchini yo'qotadi. Prisma ikkalasini ham bir xil qulaylik bilan qo'llab-quvvatlaydi, lekin Postgres'ning JSONB (statistikalar, kelajakda ko'p tilli matn uchun) va indexlash imkoniyatlari kuchliroq. Agar sizda tayyor arzon MySQL hosting bo'lsa, farq muhim emas — lekin noldan boshlasangiz, Postgres tavsiya etiladi.

**Prisma 7 haqida bilish kerak bo'lgan narsa:** endi `prisma migrate dev`dan keyin `prisma generate` avtomatik ishlamaydi va seed skripti ham migratsiyadan keyin o'zi ishga tushmaydi — ikkalasini ham qo'lda chaqirish kerak (pastda, 6-bo'limda ko'rsatilgan). Bazani hostlash uchun o'zingizning Postgres serveringiz, yoki Prisma'ning o'z managed xizmati (Prisma Postgres), yoki Neon/Supabase/Railway kabi variantlar bab-baravar ishlaydi.

---

## 2. To'liq papka strukturasi

```
backend/
├── src/
│   ├── main.ts                        ← entry point: CORS, global pipe/filter
│   ├── app.module.ts                  ← root module
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts     ← register/login/refresh/logout
│   │   │   ├── auth.service.ts        ← parol xeshlash, token generatsiya
│   │   │   ├── strategies/
│   │   │   │   ├── jwt-access.strategy.ts
│   │   │   │   └── jwt-refresh.strategy.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── decorators/
│   │   │   │   ├── roles.decorator.ts        ← @Roles('ADMIN')
│   │   │   │   └── current-user.decorator.ts ← @CurrentUser()
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       ├── login.dto.ts
│   │   │       └── refresh.dto.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.controller.ts    ← GET /users/me
│   │   │
│   │   ├── categories/
│   │   │   ├── categories.module.ts
│   │   │   ├── categories.controller.ts
│   │   │   ├── categories.service.ts
│   │   │   └── dto/create-category.dto.ts
│   │   │
│   │   ├── questions/
│   │   │   ├── questions.module.ts
│   │   │   ├── questions.controller.ts
│   │   │   ├── questions.service.ts   ← ⚠️ xavfsizlik qoidasi shu yerda (4.2)
│   │   │   └── dto/
│   │   │       ├── create-question.dto.ts
│   │   │       └── create-answer.dto.ts
│   │   │
│   │   ├── tests/
│   │   │   ├── tests.module.ts
│   │   │   ├── tests.controller.ts    ← /tests/start, /:id/answer, /:id/finish
│   │   │   ├── tests.service.ts       ← ASOSIY BIZNES MANTIQ
│   │   │   └── dto/
│   │   │       ├── start-test.dto.ts
│   │   │       └── submit-answer.dto.ts
│   │   │
│   │   ├── videos/
│   │   │   ├── videos.module.ts
│   │   │   ├── videos.controller.ts   ← admin upload-url + Stream webhook
│   │   │   ├── videos.service.ts      ← Cloudflare Stream API klienti
│   │   │   └── dto/create-video.dto.ts
│   │   │
│   │   └── admin/
│   │       ├── admin.module.ts
│   │       └── admin-stats.controller.ts
│   │
│   ├── common/
│   │   ├── filters/http-exception.filter.ts
│   │   ├── interceptors/logging.interceptor.ts
│   │   └── constants/index.ts
│   │
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts          ← PrismaClient wrapper (onModuleInit)
│   │
│   └── config/
│       └── configuration.ts            ← env o'qish/validatsiya
│
├── prisma/
│   ├── schema.prisma
│   ├── prisma.config.ts                ← Prisma 7: config endi shu yerda
│   ├── seed.ts                         ← boshlang'ich kategoriyalar/savollar
│   └── migrations/                     ← [AUTO]
│
├── test/
│   ├── app.e2e-spec.ts
│   └── tests.service.spec.ts
│
├── .env.example
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## 3. Prisma schema (to'liq)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum VideoType {
  CORRECT
  WRONG
}

model User {
  id            String         @id @default(uuid())
  name          String
  email         String?        @unique
  phone         String?        @unique
  password      String
  role          Role           @default(USER)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  testSessions  TestSession[]
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String    @id @default(uuid())
  tokenHash String    @unique
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())
}

model Category {
  id           String        @id @default(uuid())
  name         String
  slug         String        @unique
  order        Int           @default(0)
  questions    Question[]
  testSessions TestSession[]
}

model Question {
  id             String               @id @default(uuid())
  categoryId     String
  category       Category             @relation(fields: [categoryId], references: [id])
  text           String
  imageUrl       String?
  order          Int                  @default(0)
  answers        Answer[]
  sessionAnswers TestSessionAnswer[]
  createdAt      DateTime             @default(now())

  @@index([categoryId])
}

model Answer {
  id             String              @id @default(uuid())
  questionId     String
  question       Question            @relation(fields: [questionId], references: [id], onDelete: Cascade)
  text           String
  isCorrect      Boolean             @default(false)
  videoId        String?
  video          Video?              @relation(fields: [videoId], references: [id])
  sessionAnswers TestSessionAnswer[]

  @@index([questionId])
}

model Video {
  id           String    @id @default(uuid())
  type         VideoType
  title        String?
  streamUid    String    @unique   // Cloudflare Stream video UID
  playbackUrl  String              // HLS manifest URL
  thumbnailUrl String?
  durationSec  Int
  status       String    @default("processing") // processing | ready | error
  createdAt    DateTime  @default(now())
  answers      Answer[]
}

model TestSession {
  id         String               @id @default(uuid())
  userId     String
  user       User                 @relation(fields: [userId], references: [id])
  categoryId String
  category   Category             @relation(fields: [categoryId], references: [id])
  startedAt  DateTime             @default(now())
  finishedAt DateTime?
  totalScore Int?
  totalCount Int?
  answers    TestSessionAnswer[]

  @@index([userId])
}

model TestSessionAnswer {
  id         String      @id @default(uuid())
  sessionId  String
  session    TestSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  questionId String
  question   Question    @relation(fields: [questionId], references: [id])
  answerId   String
  answer     Answer      @relation(fields: [answerId], references: [id])
  isCorrect  Boolean
  answeredAt DateTime    @default(now())

  @@index([sessionId])
}
```

**Eslatma (til):** hozircha `text` maydonlari bitta til (o'zbekcha). Agar boshidanoq ru/en ham kerak bo'lsa, `text String` o'rniga `text Json` (masalan `{ uz, ru, en }`) qilib boshlash osonroq — keyin schema migratsiyasi bilan o'zgartirish ko'proq vaqt oladi.

---

## 4. Asosiy arxitektura qoidalari

### 4.1 Auth oqimi
1. `POST /auth/register` — parol argon2id bilan xeshlanadi
2. `POST /auth/login` — access token (~15 daqiqa) + refresh token (~30 kun) qaytaradi
3. Refresh token bazada **hash holida** saqlanadi (plaintext emas) — DB sizib chiqsa ham token ishlatib bo'lmaydi
4. Har `refresh` chaqirilganda eski refresh token bekor qilinib, yangisi beriladi (rotation) — o'g'irlangan tokenni aniqlash osonlashadi
5. Login/register endpointlariga `@nestjs/throttler` orqali rate-limit qo'yiladi (masalan, 1 daqiqada 5 urinish) — brute-force'dan himoya

### 4.2 ⚠️ MUHIM: to'g'ri javobni oldindan yashirish
`GET /categories/:id/questions` orqali savollar ro'yxati kelganda, har bir javob variantida faqat `id` va `text` bo'lishi kerak — **`isCorrect` va `videoId`/video URL hech qachon shu endpointda qaytmasligi kerak.** Aks holda foydalanuvchi brauzer devtools'ining Network tabini ochib, savolga javob berishdan oldin to'g'ri javobni bilib oladi. To'g'ri javob va tegishli video **faqat** `POST /tests/:sessionId/answer` chaqirilib, o'sha bitta tanlangan javob uchun qaytariladi. Bu hech bir oldingi hujjatda aytilmagan, lekin production'da eng ko'p uchraydigan xavfsizlik xatolaridan biri.

### 4.3 Video mantig'i — bitta video, ko'p javobda
`videoId` maydoni `Answer` jadvalida, `Question` jadvalida EMAS. Shu sababli bitta "avariya" videosini bir nechta turli savollarning xato javoblarida qayta ishlatish mumkin — bu video omborini 3–4 barobar kamaytiradi (avval ham to'g'ri topilgan yondashuv, shu yerda saqlab qolindi).

### 4.4 Cloudflare Stream integratsiyasi
Video fayllar backend serveridan emas, to'g'ridan-to'g'ri Cloudflare'ga yuklanadi:
1. Admin panel `POST /admin/videos/upload-url` chaqiradi (👑 himoyalangan)
2. Backend Cloudflare Stream API'dan bir martalik `direct_upload` URL so'raydi, `Video` yozuvini `status: processing` bilan yaratadi
3. Admin frontend faylni to'g'ridan-to'g'ri o'sha URL'ga yuklaydi (backend orqali emas — katta video fayllar serverni band qilmaydi)
4. Cloudflare video tayyor bo'lgach, bizning `POST /videos/webhook` manzilimizga xabar yuboradi
5. Webhook `Video` yozuvini yangilaydi: `status: ready`, `durationSec`, `playbackUrl`, `thumbnailUrl`
6. Bu endpoint JWT bilan EMAS, Cloudflare'ning `Webhook-Signature` header'i (HMAC) orqali tekshiriladi

**Format haqida:** avvalgi tavsiyalarda H.264 va WebM'ni qo'lda tayyorlash aytilgan edi — bu endi shart emas. Cloudflare Stream'ga bitta manba video yuklansa, u avtomatik ravishda HLS'ga (turli bitrate'lar bilan) o'giradi va tarmoq sifatiga qarab moslashtirib beradi.

### 4.5 Admin ruxsatlari
`RolesGuard` + `@Roles('ADMIN')` decorator orqali. `User.role` maydoni `USER`/`ADMIN` — boshqa admin darajalari kerak bo'lsa, keyin enum'ga qo'shish oson.

---

## 5. API endpointlar (to'liq)

```
# AUTH — public
POST   /api/auth/register            { name, email|phone, password }
POST   /api/auth/login               { email|phone, password } → { accessToken, refreshToken, user }
POST   /api/auth/refresh             { refreshToken } → { accessToken, refreshToken }
POST   /api/auth/logout        🔒

# USERS
GET    /api/users/me           🔒

# CATEGORIES
GET    /api/categories                              — public
POST   /api/categories                         👑
PATCH  /api/categories/:id                     👑
DELETE /api/categories/:id                     👑

# QUESTIONS  (⚠️ 4.2-band: isCorrect/video public javobda yo'q)
GET    /api/categories/:id/questions                — public
POST   /api/questions                          👑
PATCH  /api/questions/:id                      👑
DELETE /api/questions/:id                      👑
POST   /api/questions/:id/answers              👑
PATCH  /api/answers/:id                        👑

# TESTS  🔒 (barchasi)
POST   /api/tests/start              { categoryId } → { sessionId, question }
POST   /api/tests/:sessionId/answer  { questionId, answerId }
       → { isCorrect, video: { playbackUrl, durationSec, type }, nextQuestion? }
POST   /api/tests/:sessionId/finish  → { score, total, percentage }
GET    /api/tests/history            → sessiyalar ro'yxati
GET    /api/tests/:sessionId         → bitta sessiya tafsiloti

# VIDEOS
POST   /api/admin/videos/upload-url  👑 → { uploadUrl, videoId }
POST   /api/videos/webhook              (Cloudflare imzosi bilan, JWT yo'q)

# ADMIN
GET    /api/admin/stats              👑 → { totalUsers, totalQuestions, totalSessions, avgScore }
```
🔒 — login qilingan foydalanuvchi   👑 — faqat ADMIN

---

## 6. O'rnatish va ishga tushirish

```bash
# 1. NestJS loyihasini yaratish
npm i -g @nestjs/cli
nest new backend --package-manager npm --strict
cd backend

# 2. Kerakli kutubxonalar
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/config @nestjs/throttler
npm install argon2 class-validator class-transformer
npm install @prisma/client
npm install -D prisma @types/passport-jwt

# 3. Prisma ishga tushirish (v7 — prisma.config.ts avtomatik yaratiladi)
npx prisma init --datasource-provider postgresql
# → prisma/schema.prisma faylini 3-bo'limdagi schema bilan to'ldiring

# 4. Birinchi migratsiya
npx prisma migrate dev --name init
npx prisma generate        # v7'da endi AVTOMATIK ishlamaydi — qo'lda chaqiring

# 5. Boshlang'ich ma'lumot (prisma/seed.ts yozilgach)
npx prisma db seed         # v7'da bu ham migratsiyadan keyin avtomatik EMAS

# 6. Serverni ishga tushirish
npm run start:dev
# → http://localhost:4000
```

### .env.example
```env
PORT=4000
NODE_ENV=development

DATABASE_URL="postgresql://user:password@localhost:5432/mashina_test"

JWT_ACCESS_SECRET=change-me-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change-me-min-32-chars
JWT_REFRESH_EXPIRES_IN=30d

CLOUDFLARE_ACCOUNT_ID=xxxxxxxx
CLOUDFLARE_API_TOKEN=xxxxxxxx
CLOUDFLARE_STREAM_WEBHOOK_SECRET=xxxxxxxx

CORS_ORIGINS=http://localhost:3000,exp://192.168.1.10:8081
```

---

## 7. Ishlab chiqish bosqichlari

| Hafta | Ish | Natija |
|---|---|---|
| 1 | Skelet, Prisma schema+migratsiya, AuthModule to'liq | Ro'yxatdan o'tish/kirish ishlaydi |
| 2 | Categories + Questions modullari (xavfsizlik qoidasi bilan), seed | Admin savol qo'sha oladi, public API o'qiydi |
| 3 | TestsModule — asosiy mantiq | To'liq test oqimi backend tomonda ishlaydi |
| 4 | VideosModule — Cloudflare Stream + webhook | Video yuklash → avtomatik bog'lanish |
| 5 | Admin stats, rate-limit, Jest testlar, prod sozlamalar | Deploy uchun tayyor |

| # | Qism | % |
|---|---|---|
| Auth (JWT, guard, decorator) | 15% |
| Prisma schema + migratsiya + seed | 10% |
| Categories/Questions (+ xavfsizlik qoidasi) | 15% |
| Tests logikasi | 25% |
| Videos/Cloudflare Stream integratsiyasi | 20% |
| Admin stats + testlash + polish | 15% |

---

## 8. To'liq AI-prompt (nusxa ko'chirib ishlatish uchun)

```
LOYIHA: "Haydovchilik test simulyatori" — backend qismi (Node.js/NestJS API)

KONTEKST:
Bu backend ikkita frontendga (Next.js web va React Native/Expo mobil) xizmat
qiladigan yagona REST API. Foydalanuvchi ro'yxatdan o'tadi, kategoriya tanlab
test boshlaydi, savollarga javob beradi. Har bir JAVOBGA (savolga emas) video
bog'langan: to'g'ri javobda "haydash" videosi (✅), xato javobda kamida
10 soniyalik "avariya" videosi (❌). Video fayllarning o'zi Cloudflare
Stream'da saqlanadi, backend faqat metadata bilan ishlaydi.

STACK: NestJS 11 (TypeScript, Node 20+), Prisma ORM 7 + PostgreSQL, JWT auth
(access+refresh, argon2id xeshlash), class-validator DTO'lar, Cloudflare
Stream REST API, Jest.

MA'LUMOTLAR MODELLARI:
- User (id, name, email, phone, password, role: USER|ADMIN)
- RefreshToken (tokenHash, userId, expiresAt)
- Category (id, name, slug, order)
- Question (id, categoryId, text, imageUrl?, order)
- Answer (id, questionId, text, isCorrect, videoId?)
- Video (id, type: CORRECT|WRONG, streamUid, playbackUrl, durationSec, status)
- TestSession (id, userId, categoryId, startedAt, finishedAt, totalScore)
- TestSessionAnswer (id, sessionId, questionId, answerId, isCorrect, answeredAt)

MUHIM QOIDALAR:
1. XAVFSIZLIK: public `/categories/:id/questions` endpointi javob
   variantlarini qaytarganda `isCorrect` va video ma'lumotlarini albatta
   OLIB TASHLASHI kerak. To'g'ri javob va video FAQAT
   `POST /tests/:sessionId/answer` chaqirilgandan keyin, o'sha bitta
   tanlangan javob uchun qaytariladi.
2. Bitta "wrong" video bir nechta Answer yozuvida qayta ishlatilishi
   mumkin — videoId Answer jadvalida saqlanadi, Question jadvalida emas.
3. Cloudflare Stream webhook endpointi JWT bilan emas, Cloudflare'ning
   webhook-signature header'i orqali tekshiriladi.
4. Barcha parollar argon2id bilan xeshlanadi, refresh tokenlar bazada
   HASH holida saqlanadi (plaintext emas), refresh chaqirilganda rotation
   qo'llaniladi.
5. Login/register endpointlariga rate-limiting qo'llanadi
   (@nestjs/throttler).

Iltimos quyidagilarni TO'LIQ, ishlaydigan TypeScript kodi bilan, birma-bir
yarating (placeholder yoki "// TODO" qoldirmasdan):
1. Loyiha skeleti — package.json, tsconfig.json, nest-cli.json, .env.example
2. prisma/schema.prisma (yuqoridagi modellar bilan) + prisma/seed.ts
   (3 ta namunaviy kategoriya, har birida 2-3 ta savol bilan)
3. PrismaModule / PrismaService
4. AuthModule — to'liq: controller, service, DTO'lar, JWT access/refresh
   strategiyalar, JwtAuthGuard, RolesGuard, @Roles() va @CurrentUser()
   decoratorlar
5. CategoriesModule va QuestionsModule — yuqoridagi xavfsizlik qoidasiga
   qat'iy rioya qilgan holda
6. TestsModule — test boshlash/javob berish/yakunlash to'liq mantiq bilan
7. VideosModule — Cloudflare Stream'dan yuklash URL olish va webhook
   qabul qilish logikasi bilan
8. Global ValidationPipe, HttpExceptionFilter va main.ts sozlamalari
   (CORS bilan)
```

---

## 9. Ochiq savollar

1. **Auth usuli** — faqat email+parolmi, yoki telefon+SMS OTP ham kerakmi? (O'zbekistonda telefon orqali ro'yxatdan o'tish odatiy, lekin Eskiz.uz/Play Mobile kabi SMS gateway qo'shimcha integratsiya talab qiladi)
2. **Video ishlab chiqarish** — 50–100 videoni kim va qanday tayyorlaydi? Backend tayyor bo'lsa ham, kontent bo'lmasa ilova ishlamaydi — bu loyihaning eng ko'p vaqt oladigan qismi bo'lishi mumkin.
3. **Tillar** — hozircha faqat o'zbekchami? (Keyin ru/en qo'shish `text` maydonini Json'ga o'zgartirishni talab qiladi — buni boshida hal qilish qulayroq)
4. **Admin sonmi** — faqat siz kontent boshqarasizmi, yoki bir nechta admin bo'ladimi? (schema buni `role` orqali allaqachon qo'llab-quvvatlaydi)
Tayyor. Qisqacha nima bor:

1-2-bo'lim — stack tanlovi (NestJS, Prisma 7, PostgreSQL) va sabablari + to'liq papka strukturasi
3-bo'lim — to'liq Prisma schema (8 model)
4-bo'lim — 3 ta muhim, hech qayerda aytilmagan nozik joy: to'g'ri javobni oldindan yashirish (xavfsizlik), video-per-answer qayta ishlatish, Cloudflare Stream upload+webhook oqimi
5-9-bo'lim — to'liq API ro'yxati, o'rnatish buyruqlari, .env, bosqichlar/% jadvali va nusxa ko'chirib ishlatsa bo'ladigan AI-prompt
## eng


## Architecture

```
backend/
├── prisma/
│   └── schema.prisma          ← PostgreSQL models (User, Answer, ExamAttempt, Scenario, Lesson)
├── src/
│   ├── index.mjs              ← Express server entry (port 4000, CORS, static, error handler)
│   ├── routes.mjs             ← All API routes (auth, scenarios, lessons, progress, exams, admin)
│   ├── engine.mjs             ← Pure JS engine loader from public/engine.js
│   ├── content.mjs            ← Scenario CRUD from ../../content/*.json (20 files)
│   ├── lessons.mjs            ← Lesson CRUD from data/lessons/*.json (4 seed lessons)
│   ├── db.mjs                 ← DB abstraction: JSON file fallback (data/progress.json)
│   └── auth/
│       ├── auth.routes.mjs    ← /api/auth/register, login, /me (JWT, bcrypt)
│       └── auth.middleware.mjs ← authMiddleware (required), optionalAuth (optional)
├── public/
│   ├── engine.js              ← Pure JS scenario engine (0.1.0, from shared/engine-js)
│   ├── player.html, index.html, landing.html
│   ├── sw.js, manifest.webmanifest, icon.svg
│   └── videos/                ← Video content
├── data/
│   ├── progress.json          ← [Runtime] JSON fallback user progress store
│   └── lessons/               ← [Runtime] Lesson JSON files (lesson-01..04)
├── .env.example               ← Template: PORT, JWT_SECRET, DATABASE_URL, CORS_ORIGINS
├── package.json               ← type: module, deps: express, cors, bcryptjs, jsonwebtoken
└── Task.md
```

## Pure JS Engine (not Dart)

`engine.mjs` reads `public/engine.js` (from `shared/engine-js/`), evaluates it, and exposes:
- `sceneInfo(src)` — classify options (clean/outcome type), return duration + warnings
- `frame(src, {t, option})` — render frame at time `t`, optionally for a wrong option
- `engine.version` — `"0.1.0"`

No Dart SDK needed. No `@yhq/engine` npm dependency. No `loadEngineNode()`.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | - | Server health + engine version + db mode |
| POST | `/api/auth/register` | - | Register with phone + password (returns JWT) |
| POST | `/api/auth/login` | - | Login (returns JWT) |
| GET | `/api/auth/me` | Bearer | Current user info |
| GET | `/api/scenarios` | - | List all (filter: ?topic=, ?type=) |
| GET | `/api/scenarios/:id` | - | Full scenario JSON |
| GET | `/api/scenarios/:id/info` | - | Engine outcome classification |
| GET | `/api/scenarios/:id/frame` | - | Frame ops (?t=5, &option=o1) |
| GET | `/api/lessons` | - | List all lessons |
| GET | `/api/lessons/:id` | - | Lesson detail |
| GET | `/api/progress/:userId` | optionalAuth | User progress stats |
| POST | `/api/progress/:userId/answer` | optionalAuth | Record answer + engine evaluation |
| GET | `/api/exams/generate` | - | Generate 20-question exam |
| POST | `/api/exams/:userId/submit` | optionalAuth | Submit exam, auto-grade |
| POST | `/api/admin/scenarios` | Bearer | Create/update scenario |
| DELETE | `/api/admin/scenarios/:id` | Bearer | Delete scenario |
| POST | `/api/admin/lessons` | Bearer | Create/update lesson |
| DELETE | `/api/admin/lessons/:id` | Bearer | Delete lesson |
| GET | `/api/admin/validate` | Bearer | Engine validation for all scenarios |
| GET | `/api/admin/stats` | Bearer | System statistics |

## Auth Flow

1. **Register** → `POST /api/auth/register` with `{phone, password, name?}`
2. **Login** → `POST /api/auth/login` with `{phone, password}`
3. Both return `{token, user: {id, phone, email, name}}`
4. Use token as `Authorization: Bearer <token>` for protected routes
5. Auth requires PostgreSQL (Prisma) — without `DATABASE_URL`, auth returns 503

### Middleware
- `authMiddleware` — required for admin routes and `/me`
- `optionalAuth` — extracts user if token present, doesn't reject if not

## Database

### Primary: PostgreSQL via Prisma

Models:
- `User` — id, phone (unique), email (unique), password (bcrypt), name
- `Answer` — id, userId, scenarioId, optionId, isCorrect, outcomeType
- `ExamAttempt` — id, userId, score, total, passed, durationSeconds, details (JSON)
- `Scenario` — id, topic, sceneType (cached metadata from /content/)
- `Lesson` — id, title, topic, ruleCode

Setup:
```bash
cp .env.example .env    # Set DATABASE_URL
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push to PostgreSQL
npm run dev
```

### Fallback: JSON files

When `DATABASE_URL` is not set, user progress, answers, and exams are stored in `data/progress.json`. Auth (register/login) requires PostgreSQL — falls back to 503.

## Database Organization

| Data | Storage | Path |
|------|---------|------|
| Scenario content (source of truth) | JSON files | `/content/sc-*.json` (20 files) |
| Scenario list + engine metadata | API-generated | from engine at runtime |
| User auth + JWT | PostgreSQL (Prisma) | `DATABASE_URL` required |
| User progress, answers, exams | JSON file | `data/progress.json` (or PostgreSQL) |
| Lessons | JSON files | `data/lessons/lesson-*.json` (4 files) |

## How the Engine Works

1. `engine.mjs` loads `public/engine.js` using `(0, eval)(code)` into `globalThis.__yhqEngine`
2. `sceneInfo(src)` parses scenario JSON, simulates all options, returns `{options: {A, B, C, D, o1, o2, ...}, duration, warnings}`
3. `frame(src, {t, option})` renders frame as display list: `[{type: "fillPolygon"|"strokePath"|"fillCircle", points, colour, width, dash}]`
4. Client (web/mobile) renders the display list on Canvas 2D

## Content Sources

- **Scenarios**: `../../content/` (repo root) — 20 JSON scenario files, `sc-0001` through `sc-0020`
- **Lessons**: `data/lessons/` — 4 seed lessons auto-created on first read

## Session Summary (Jul 2026)

### What was built
- **engine.mjs**: Replaced old `@yhq/engine/node` dart2js loader with pure JS engine loader from `public/engine.js`
- **auth.routes.mjs**: JWT register/login/me with import ordering fix, Prisma error handling, 503 fallback
- **routes.mjs**: Added authMiddleware to admin routes, optionalAuth to user-scoped routes, engine.version fallback
- **content.mjs**: Fixed content path from `../../../content/` to `../../content/` (was resolving one level too high)

### Verified
- `npm install` passes (120 packages, 0 vulnerabilities)
- `npm run dev` starts on port 4000 with engine 0.1.0
- `/api/health` → OK engine=0.1.0 db=json
- `/api/scenarios` → 20 items with correct metadata
- `/api/scenarios/sc-0001/info` → options D/o1/o2, duration 10.0s
- `/api/scenarios/sc-0001/frame?t=0&option=D` → 20 ops (fillPolygon, strokePath, fillCircle)
- `/api/lessons` → 4 items
- `/api/exams/generate` → 20 questions
- `/api/progress/user-web/answer` → correct answer recording with outcome classification
- Auth → 503 (no PostgreSQL, expected dev behavior)
