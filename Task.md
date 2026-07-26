# Mashina Test — Loyiha bo'yicha To'liq Qo'llanma (Dasturchi uchun)

> Bu — loyihaning YAKUNIY, yagona hujjati: nima uchun, nima, qanday va qaysi tartibda qurilishi kerakligi — barchasi tushuntirilgan holda, bitta joyda.

## Mundarija
1. [Loyiha nima va nega shunday qurilgan](#1)
2. [Texnologik stack](#2)
3. [Monorepo strukturasi](#3)
4. [Ma'lumotlar bazasi](#4)
5. [API — to'liq va tuzatilgan ro'yxat](#5)
6. [5+1 qoida — buzilmasligi kerak](#6)
7. [Backend — modul-modul](#7)
8. [Web — sahifa-sahifa](#8)
9. [Mobile — ekran-ekran](#9)
10. [Video qanday ishlaydi (Cloudflare)](#10)
11. [0 dan ishga tushirish](#11)
12. [Ishlab chiqish tartibi](#12)
13. [YAGONA to'liq AI-prompt](#13)
14. [Ochiq savollar](#14)

---

<a id="1"></a>
## 1. Loyiha nima va nega shunday qurilgan

**Nima:** Foydalanuvchi ro'yxatdan o'tadi, test kategoriyasini (masalan "Yo'l belgilari") tanlaydi, savollarga birma-bir javob beradi. Har bir **javobga** — savolga emas — video bog'langan: to'g'ri javob berilsa, mashina to'g'ri yurishda davom etayotgan video ko'rsatiladi (loop rejimida, ✅), xato javob berilsa — kamida 10 soniyalik avariya videosi (bir marta, ❌).

**Nega bitta backend, ikkita frontend:** Web (kompyuter) va mobil (telefon) — ikkalasi ham bir xil ma'lumotga muhtoj. Agar har biri o'z mantig'ini alohida yozsa, ikkitasini alohida saqlash va sinxron tutish kerak bo'lardi. Shu sabab — **bitta** Backend (NestJS API) ma'lumotni saqlaydi va tekshiradi, ikkalasi ham shunga so'rov yuboradi.

**Nega har bir javobga video, har bir savolga emas:** bitta "avariya" videosini bir nechta turli savolning xato javoblarida qayta ishlatish mumkin — bu 50-100 ta video o'rniga sezilarli kamroq video suratga olish/tayyorlashni talab qiladi.

**Nega videoning o'zi bizning serverimizda emas:** video — og'ir fayl. Agar u bizning serverimizdan o'tsa, 100 kishi bir vaqtda test topshirganda server "tiqilib qoladi". Shu sabab video **Cloudflare Stream**da saqlanadi — bizning backend faqat "qayerdan olish kerak" (manzil) ma'lumotini beradi.

---

<a id="2"></a>
## 2. Texnologik stack

| Qatlam | Texnologiya | Nega aynan shu |
|---|---|---|
| Backend | NestJS 11 (TypeScript, Node 20+) | Laravel'ga eng yaqin fikrlash uslubi — module/controller/service/guard |
| ORM | Prisma 7 | TypeScript bilan tabiiy integratsiya, SQL qo'lda yozilmaydi |
| Baza | PostgreSQL 15+ | Node/Prisma ekotizimida eng ko'p qo'llab-quvvatlanadigan, kuchli baza |
| Auth | JWT (access+refresh) + argon2id | Sanctum'ning Node.js ekvivalenti |
| Web | Next.js 16 (App Router, Turbopack) + Tailwind | Sizda mavjud tajriba, tez UI qurish |
| Mobil | React Native + Expo (Expo Router) | Web bilan bir xil til (React/TS) — mantiqning katta qismi umumiy |
| Video | Cloudflare Stream | Yagona manba yuklab, avtomatik barcha formatga (HLS) o'giradi |
| Monorepo | npm workspaces + Turborepo | Uchala qismni bitta buyruq bilan ishga tushirish, tip almashish |
| Test | Jest | NestJS'ning standart tanlovi |

---

<a id="3"></a>
## 3. Monorepo strukturasi

```
mashina-test/
├── package.json        (workspaces: backend, web, mobile, shared)
├── turbo.json
├── backend/              → 7-bo'lim
├── web/                   → 8-bo'lim
├── mobile/                → 9-bo'lim
└── shared/                → Question/Answer/TestSession kabi umumiy TS tiplar
```

**shared/ nima uchun kerak:** "Savol qanday ko'rinishda bo'lishi kerak" degan tavsif BITTA joyda yoziladi (`shared/types.ts`), backend, web, mobil — uchalasi ham shundan import qiladi. Shu tufayli, masalan, backend `durationSec` qaytarsa-yu, frontend `duration` kutsa — kabi nomuvofiqlik kompilyatsiya bosqichidayoq aniqlanadi.

---

<a id="4"></a>
## 4. Ma'lumotlar bazasi

```prisma
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
enum Role { USER ADMIN }
enum VideoType { CORRECT WRONG }

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
  streamUid    String    @unique
  playbackUrl  String
  thumbnailUrl String?
  durationSec  Int
  status       String    @default("processing")
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

**Konkret misol bilan:** Aziz ro'yxatdan o'tsa — `User`ga bitta qator qo'shiladi. "Yo'l belgilari" testini boshlasa — `TestSession`ga bitta qator. Har savolga javob bersa — `TestSessionAnswer`ga bittadan qator ("Aziz 3-savolga B variantini tanladi — to'g'ri edi"). Test tugagach `TestSession.totalScore` to'ldiriladi — shu orqali `/history` sahifasi ishlaydi.

---

<a id="5"></a>
## 5. API — to'liq va tuzatilgan ro'yxat

```
# AUTH — public
POST   /api/auth/register        {name, email|phone, password}
POST   /api/auth/login           {email|phone, password} → {accessToken, refreshToken, user}
POST   /api/auth/refresh         {refreshToken} → {accessToken, refreshToken}
POST   /api/auth/logout    🔒

GET    /api/users/me       🔒

# CATEGORIES
GET    /api/categories                    — public
POST/PATCH/DELETE /api/categories(/:id)   👑

# QUESTIONS
GET    /api/categories/:id/questions      — public (⚠️ isCorrect/video YO'Q — 6-bo'lim)
GET    /api/admin/questions/:id           👑 — ⭐ TUZATISH: to'liq javob, isCorrect+video bilan
                                              (admin tahrirlash sahifasi uchun zarur)
POST/PATCH/DELETE /api/questions(/:id)    👑
POST /api/questions/:id/answers, PATCH /api/answers/:id   👑

# TESTS  🔒 (barchasi)
POST   /api/tests/start              {categoryId} → {sessionId, question}
POST   /api/tests/:sessionId/answer  {questionId, answerId}
       → {isCorrect, video: {playbackUrl, durationSec, type}, nextQuestion?}
POST   /api/tests/:sessionId/finish  → {score, total, percentage}
GET    /api/tests/history, GET /api/tests/:sessionId

# VIDEOS
POST   /api/admin/videos/upload-url  👑 → {uploadUrl, videoId}
POST   /api/videos/webhook              (Cloudflare imzosi bilan, JWT YO'Q)

# ADMIN
GET    /api/admin/stats              👑 → {totalUsers, totalQuestions, totalSessions, avgScore}
```
🔒 login kerak &nbsp;&nbsp; 👑 faqat ADMIN

*Bu ro'yxat avvalgi fayllarga nisbatan bitta joyda tuzatilgan: `GET /api/admin/questions/:id` qo'shildi — sababi 7/8-bo'limda tushuntirilgan.*

---

<a id="6"></a>
## 6. 5+1 qoida — buzilmasligi kerak

1. **To'g'ri javobni oldindan yashirish** — public `/categories/:id/questions` javobida har bir variant faqat `{id, text}`. `isCorrect`/video FAQAT `POST /tests/:sessionId/answer`dan keyin, tanlangan bitta javob uchun qaytadi.
2. **Video qayta ishlatiladi** — `videoId` `Answer`da, `Question`da emas.
3. **Webhook imzo bilan** — `/videos/webhook` JWT emas, Cloudflare `Webhook-Signature` (HMAC) orqali tekshiriladi.
4. **Parol/token xavfsizligi** — argon2id, refresh token bazada hash + har `refresh`da rotation.
5. **Rate-limit** — login/register'ga `@nestjs/throttler`.
6. **Bitta manba** — web/mobil hech qanday video/kontent faylini o'zida saqlamaydi, har doim API'dan so'raydi.

---

<a id="7"></a>
## 7. Backend — modul-modul

| Modul | Vazifasi |
|---|---|
| **Auth** | Ro'yxatdan o'tish, kirish, token yangilash/bekor qilish |
| **Users** | `GET /users/me` — joriy foydalanuvchini aniqlash (frontend shu bilan admin/user farqlaydi) |
| **Categories** | Bo'limlar CRUD |
| **Questions** | Savol banki CRUD — ⚠️ public va admin javoblari FARQLI (5-bo'limga qarang) |
| **Tests** ⭐ | Test boshlash → javob qabul qilish → yakunlash — loyihaning yuragi |
| **Videos** | Cloudflare bilan bog'lanish: yuklash havolasi so'rash + tayyor bo'lgach webhook qabul qilish |
| **Admin** | Umumiy statistikalar |

---

<a id="8"></a>
## 8. Web — sahifa-sahifa (qisqacha; to'liq tafsilot alohida faylda)

| Sahifa | Nima qiladi |
|---|---|
| `/login`, `/register` | Kirish/ro'yxatdan o'tish formalari |
| `/categories` | Bo'lim tanlash → `POST /tests/start` |
| `/test/[sessionId]` ⭐ | Savol → javob → video → keyingi savol/natija |
| `/result/[sessionId]` | Yakuniy ball, breakdown |
| `/history` | O'tgan urinishlar |
| `/admin/*` | Kategoriya/savol/video CRUD, statistika (faqat ADMIN) |

`/test/[sessionId]` oqimi: variant tanlanadi → tugmalar bloklanadi → API chaqiriladi → javob kelsa `VideoPlayer` ko'rsatiladi (to'g'ri: loop+✅; xato: bir marta, kamida 10s, `onEnded`'da keyingisiga o'tadi) → keyingi videoni fonda oldindan yuklab qo'yish (preload).

---

<a id="9"></a>
## 9. Mobile — ekran-ekran (qisqacha)

Login/register/categories/history/profile — **web bilan bir xil mantiq**, faqat: token `localStorage` o'rniga `expo-secure-store`da, video `expo-video`'da (**`expo-av` emas** — bu SDK 55'dan olib tashlangan). `test/[sessionId]` va `result/[sessionId]` — web bilan bir xil oqim.

**Eslatma:** agar UI kodini ham web bilan ulashish istasangiz — `Expo Router + react-native-web` orqali BITTA `app/` papkadan ham web, ham mobil chiqarish mumkin (SEO ozroq yutqazadi, tezlik o'rnida vaqt yutiladi). Hozirgi reja — ikkalasini alohida yozish, chunki admin panel SEO/tezlik jihatidan sof Next.js'da yaxshiroq ishlaydi.

---

<a id="10"></a>
## 10. Video qanday ishlaydi

**Yuklash:** admin fayl tanlaydi → backend Cloudflare'dan bir martalik yuklash manzili so'raydi → fayl **to'g'ridan-to'g'ri** Cloudflare'ga yuklanadi (backend orqali EMAS) → Cloudflare avtomatik barcha formatga (HLS, turli sifat) o'giradi → tayyor bo'lgach backend'ga webhook keladi → baza yangilanadi.

**Ko'rsatish:** foydalanuvchi javob beradi → backend bazadan videoning manzilini topadi → shu manzilni qaytaradi → ilova videoni **to'g'ridan-to'g'ri Cloudflare CDN'idan** ko'rsatadi. Backend bu jarayonda faylni hech qachon "qo'lidan o'tkazmaydi" — faqat manzil beradi. Shu tufayli minglab foydalanuvchi bir vaqtda video ko'rsa ham server bosim sezmaydi.

---

<a id="11"></a>
## 11. 0 dan ishga tushirish

```bash
mkdir mashina-test && cd mashina-test && git init && npm init -y

npx @nestjs/cli new backend --package-manager npm --strict --skip-git
cd backend
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/config @nestjs/throttler argon2 class-validator class-transformer @prisma/client
npm install -D prisma @types/passport-jwt
npx prisma init --datasource-provider postgresql
npx prisma migrate dev --name init
npx prisma generate
cd ..

npx create-next-app@latest web --typescript --tailwind --app
cd web && npm install && cd ..

npx create-expo-app@latest mobile --template blank-typescript
cd mobile && npx expo install expo-router expo-video expo-secure-store && cd ..

mkdir shared && cd shared && npm init -y && cd ..

# root package.json: "workspaces": ["backend","web","mobile","shared"]
npm install -D turbo
npx turbo dev
```

---

<a id="12"></a>
## 12. Ishlab chiqish tartibi

| Hafta | Backend | Web | Mobile |
|---|---|---|---|
| 1 | Skelet, Prisma, Auth | — | — |
| 2 | Categories/Questions | Login/register, categories | — |
| 3 | Tests moduli | Test oqimi + VideoPlayer | Skelet, login/register |
| 4 | Videos/Cloudflare | Admin panel | Test oqimi + VideoPlayer |
| 5 | Stats, testlar, polish | Polish, deploy | Profil/tarix, polish, deploy |

Backend har doim 1 hafta oldinda — frontendlar unga bog'liq.

---

<a id="13"></a>
## 13. YAGONA to'liq AI-prompt

```
LOYIHA: "Haydovchilik test simulyatori" — to'liq full-stack (Backend+Web+Mobile)

Quyidagi ilovani noldan, monorepo sifatida qur: backend API, web ilova, mobil
ilova. Tartib: avval BACKEND, keyin WEB, keyin MOBILE.

KONTEKST: Foydalanuvchi ro'yxatdan o'tadi, kategoriya tanlaydi, savollarga
javob beradi. Har bir JAVOBGA video bog'langan: to'g'ri → "haydash" videosi
(loop, ✅); xato → kamida 10s "avariya" videosi (bir marta, ❌). Video
Cloudflare Stream'da; backend faqat metadata bilan ishlaydi.

STACK: NestJS 11 + Prisma 7 + PostgreSQL (backend) | Next.js 16 + Tailwind
(web) | Expo + expo-video (mobil, expo-av EMAS) | JWT+argon2id | Turborepo.

MODELLAR: 4-bo'limdagi to'liq Prisma schema.
API: 5-bo'limdagi to'liq ro'yxat (admin/questions/:id ham kiradi).
QOIDALAR: 6-bo'limdagi 6 ta qoidaga qat'iy rioya qilinsin.

QISM 1 — BACKEND: 7-bo'limdagi modullarni, xavfsizlik qoidalariga rioya
qilib, to'liq TypeScript kod bilan yarating (auth, users, categories,
questions, tests, videos, admin — har biri controller+service+DTO bilan).

QISM 2 — WEB: 8-bo'limdagi sahifalarni to'liq yarating — ayniqsa
/test/[sessionId] (VideoPlayer: loop/once mantiq, preload, onEnded) va
/admin/* (CRUD + video yuklash).

QISM 3 — MOBILE: 9-bo'limdagi ekranlarni yarating — web bilan bir xil
mantiq, expo-video va expo-secure-store bilan.

Placeholder yoki "// TODO" qoldirmasdan, har bir faylni to'liq va ishga
tayyor holda yozing.
```

---

<a id="14"></a>
## 14. Ochiq savollar

1. Auth — email+parolmi, yoki telefon+SMS OTP ham kerakmi?
2. 50-100 videoni kim/qanday tayyorlaydi? (loyihaning eng ko'p vaqt oladigan qismi)
3. Til — hozircha faqat o'zbekchami, yoki boshidanoq ru/en ham kerakmi?
4. Admin sonmi — bitta yoki bir nechta?
5. Web va mobil UI kodini alohida yozamizmi, yoki Expo Router universal yondashuvini sinaymizmi (9-bo'lim)?
