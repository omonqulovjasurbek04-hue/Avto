# MASHINA TEST — Build Prompt
### Video-asosidagi haydovchilik testi (Node.js + Next.js + Expo)

> Ushbu hujjat avvalgi muhokamadagi rejani **3 joyda tuzatadi** (sabablari bilan) va qolganini to'liq, ishga tushirishga tayyor holatga keltiradi.

---

## 0. Mahsulot

Foydalanuvchi ro'yxatdan o'tadi, kategoriya bo'yicha test topshiradi. Har savolga javob berilgach:
- **To'g'ri javob** → "to'g'ri yurish" videosi + ✅
- **Xato javob** → to'qnashuv/qoidabuzarlik videosi (kamida 10 sek) + ❌ + qisqa qoida izohi

Boshlang'ich hajm: 50–100 savol, Web + Mobil, noldan qurish.

---

## 1. Tech stack — yakuniy, va nega o'zgardi

| Qatlam | Tanlov | Izoh |
|---|---|---|
| Backend | **NestJS** (Node.js + TS) | Oldin "Express yoki NestJS" ochiq qolgan edi. NestJS'ni tanlayman: modul/controller/service/DTO tuzilishi, Guard'lar, class-validator — bularning barchasi Laravel'dagi controller/middleware/FormRequest tajribangizga eng yaqin fikrlash uslubi. Bare Express bu loyiha uchun ortiqcha "erkinlik", ya'ni ko'proq o'zboshimcha qaror qabul qilishga majbur qiladi. |
| ORM | Prisma | O'zgarishsiz — TS bilan eng yaxshi integratsiya. |
| **DB** | **PostgreSQL** (MySQL emas) | Oldingi tavsiya (MySQL) Laravel ekotizimidagi qulaylikka asoslangan edi. Laravel endi yo'q — bu argument ham yo'qoladi. Prisma'da Postgres "birinchi darajali" platforma, bepul hosting variantlari (Neon, Supabase, Railway) ko'p va sifatli. Shu sabab tuzataman: **Postgres**. |
| Auth | JWT (access + refresh), NestJS'ning `@nestjs/passport` + `passport-jwt` | Refresh token DB'da saqlanadi — shu orqali "logout everywhere" / token bekor qilish imkoniyati bo'ladi. |
| Video saqlash | Cloudflare R2 (S3-compatible) | Egress narxi yo'q — bu ko'p video, kam foydalanuvchi bosqichida muhim. |
| **Mobil video** | **expo-video** (`expo-av` EMAS) | `expo-av` Expo SDK 52'da deprecated, SDK 55'da butunlay olib tashlangan. `expo-video`'da: (a) `VideoPlayer` (mantiq) + `VideoView` (UI) ajratilgan, (b) built-in **preload** API, (c) **persistent on-device cache** (standart 1GB, sozlanadi). Bu aynan bizga kerak bo'lgan narsa — pastda tushuntiraman. |
| Web video | HTML5 `<video>` | Qo'shimcha kutubxona shart emas. |
| Frontend | Next.js 14+ (App Router) + Tailwind | O'zgarishsiz. |
| Monorepo | npm workspaces | Turborepo/Nx **hozircha shart emas** — 3 ta paket uchun ortiqcha murakkablik. Build vaqti muammo bo'lsa, keyin qo'shiladi. |
| Queue (Redis/BullMQ) | **Keyinroq** | MVP'da fon vazifasi yo'q (video oldindan encode qilingan holda yuklanadi). Kerak bo'lganda — masalan server-side transcoding yoki eslatma email — qo'shiladi. Hozir qo'shish "ehtiyot narsa yig'ish" bo'lardi. |

---

## 2. Asosiy g'oya: video HAR SAVOLGA emas, HAR NATIJA TURIGA bog'lanadi

Bu loyihaning butun tezligi va narxi shu bitta qarorga bog'liq.

**Noto'g'ri model:** 50–100 savol = 50–100 (yoki 100–200, har ikkala javob uchun) noyob video. Har birini suratga olish/render qilish, saqlash, yuklash kerak.

**To'g'ri model:** `Video` — alohida jadval. `AnswerOption.videoId` shunga ishora qiladi. Bir xil natija turidagi (masalan "chorrahada to'qnashuv") ko'plab savollar **bitta** video'ni ishlatadi.

Boshlang'ich video hajmi shunday bo'lishi mumkin:

| Kategoriya | Video soni |
|---|---|
| ✅ Muvaffaqiyatli (turli yo'l manzarasi) | 4–6 ta |
| ❌ Chorraha/imtiyoz to'qnashuvi | 4–5 ta |
| ❌ Piyoda bilan hodisa | 2–3 ta |
| ❌ Tezlik/masofa | 2 ta |
| ❌ To'xtash/turish qoidabuzarligi | 2 ta |
| ❌ Belgi/chiziq buzilishi | 2–3 ta |
| **Jami** | **~16–21 ta** |

Ya'ni 50–100 ta **savol** uchun 50–100 ta emas, **~20 ta unikal video** kifoya qiladi. (Agar AVTO loyihasidagi 13 ta mavzu taksonomiyasini eslasangiz — xuddi shu bo'linish shu yerda ham to'g'ri keladi, uni qayta ishlatsa bo'ladi.)

**Bunda tezlik bonusi ham bor:** video pool kichik bo'lgani uchun, foydalanuvchi birinchi 15–20 ta savolni yechib bo'lguncha, deyarli barcha mumkin bo'lgan videolar allaqachon qurilma keshida turadi. `expo-video`'ning persistent cache'i (va brauzerdagi HTTP cache) buni avtomatik qiladi — keyingi videolar tarmoqdan emas, disk'dan yuklanadi, ya'ni deyarli bir zumda ko'rinadi.

**Preload qoidasi:** savol yuklanganda, shu savolning barcha variantlariga bog'langan videolarni fonda oldindan yuklashni boshlang (`expo-video`'da `preload`, web'da `<link rel="prefetch">` yoki fon `fetch`). Foydalanuvchi javobni tanlaganda video allaqachon tayyor bo'ladi — "yuklanmoqda" holati deyarli ko'rinmaydi.

**"Kamida 10 sekund" — bu content talabi, kod talabi emas:** playback kodi videoni sun'iy sekinlashtirib yoki pauza qo'shib "10 soniyaga cho'zmasin". Bu — video suratga olinganda/tanlanganda rioya qilinadigan qoida, `durationSec` maydoni orqali faqat nazorat/ko'rsatish uchun saqlanadi.

---

## 3. Monorepo struktura

```
mashina-test/
├── package.json                  ← npm workspaces
├── backend/
│   ├── src/
│   │   ├── auth/                 ← register, login, refresh, JWT strategy, guards
│   │   ├── categories/
│   │   ├── questions/
│   │   ├── videos/                ← R2 presigned upload, video CRUD
│   │   ├── sessions/               ← test topshirish logikasi (asosiy modul)
│   │   ├── admin/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── main.ts
│   └── test/
├── web/                           ← Next.js
│   ├── app/
│   │   ├── (auth)/login, register
│   │   ├── categories/
│   │   ├── test/[sessionId]/
│   │   └── result/[sessionId]/
│   ├── components/
│   │   ├── ResultVideo.tsx        ← ⭐ asosiy komponent
│   │   ├── AnswerButton.tsx
│   │   └── ProgressBar.tsx
│   └── lib/api.ts
├── mobile/                        ← Expo
│   ├── app/                       ← Expo Router, xuddi web bilan bir xil oqim
│   ├── components/
│   │   └── ResultVideo.tsx        ← expo-video bilan
│   └── lib/api.ts
└── shared/
    └── types/                     ← Prisma'dan generatsiya qilingan yoki qo'lda yozilgan
                                       umumiy TS interfeyslar (ixtiyoriy, Phase 5+)
```

> Diqqat — AVTO loyihasidan farqi: u yerda mobil video **WebView** ichida ishlagan (chunki Dart engine JS'ga port qilingan edi). Bu yerda bunga hojat yo'q: `expo-video` — to'g'ridan-to'g'ri native komponent. WebView qatlami yo'q → kamroq murakkablik, tezroq, barqarorroq.

---

## 4. Prisma schema (to'liq)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum VideoOutcome {
  SUCCESS
  VIOLATION
}

enum Role {
  USER
  ADMIN
}

model User {
  id            String         @id @default(uuid())
  name          String
  email         String         @unique
  passwordHash  String
  role          Role           @default(USER)
  createdAt     DateTime       @default(now())
  sessions      TestSession[]
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Category {
  id        String     @id @default(uuid())
  name      String
  slug      String     @unique
  order     Int        @default(0)
  questions Question[]
}

model Video {
  id          String         @id @default(uuid())
  outcome     VideoOutcome
  label       String         // masalan: "chorrahada to'qnashuv"
  url         String
  durationSec Int
  answers     AnswerOption[]
  createdAt   DateTime       @default(now())
}

model Question {
  id         String          @id @default(uuid())
  categoryId String
  category   Category        @relation(fields: [categoryId], references: [id])
  text       String
  imageUrl   String?
  order      Int             @default(0)
  answers    AnswerOption[]
  attempts   AttemptAnswer[]
}

model AnswerOption {
  id         String          @id @default(uuid())
  questionId String
  question   Question        @relation(fields: [questionId], references: [id], onDelete: Cascade)
  text       String
  isCorrect  Boolean         @default(false)
  videoId    String?
  video      Video?          @relation(fields: [videoId], references: [id])
  attempts   AttemptAnswer[]
}

model TestSession {
  id           String          @id @default(uuid())
  userId       String
  user         User            @relation(fields: [userId], references: [id])
  categoryId   String?
  startedAt    DateTime        @default(now())
  finishedAt   DateTime?
  totalCount   Int             @default(0)
  correctCount Int             @default(0)
  answers      AttemptAnswer[]
}

model AttemptAnswer {
  id             String       @id @default(uuid())
  sessionId      String
  session        TestSession  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  questionId     String
  question       Question     @relation(fields: [questionId], references: [id])
  answerOptionId String
  answerOption   AnswerOption @relation(fields: [answerOptionId], references: [id])
  isCorrect      Boolean
  answeredAt     DateTime     @default(now())
}
```

`AnswerOption.videoId` — shu bitta maydon 2-bo'limdagi butun optimallashtirishni ta'minlaydi: ko'plab javoblar bitta `Video` qatoriga ishora qiladi, hech qanday qo'shimcha logika kerak emas.

---

## 5. API endpointlar

```http
POST   /api/auth/register        { name, email, password }
POST   /api/auth/login           { email, password } → { accessToken, refreshToken, user }
POST   /api/auth/refresh         { refreshToken } → { accessToken }
POST   /api/auth/logout          (Bearer)
GET    /api/auth/me              (Bearer)

GET    /api/categories
GET    /api/categories/:slug/questions      # variant matni bor, video hali yo'q

POST   /api/sessions/start        (Bearer) { categoryId? } → { sessionId, firstQuestion }
POST   /api/sessions/:id/answer   (Bearer) { questionId, answerOptionId }
       → { isCorrect, video: { url, outcome, durationSec }, ruleNote? }
POST   /api/sessions/:id/finish   (Bearer) → { total, correct, passed }
GET    /api/sessions/history      (Bearer)

# Admin
POST   /api/admin/videos/upload-url   → R2 uchun presigned URL (video to'g'ridan-to'g'ri
                                          brauzerdan R2'ga yuklanadi, backend orqali oqmaydi)
POST   /api/admin/videos              { outcome, label, url, durationSec }
POST   /api/admin/categories
POST   /api/admin/questions           { categoryId, text, answers: [{text, isCorrect, videoId}] }
```

---

## 6. Asosiy backend logika

```typescript
// sessions/sessions.service.ts
async submitAnswer(sessionId: string, questionId: string, answerOptionId: string) {
  const answer = await this.prisma.answerOption.findUniqueOrThrow({
    where: { id: answerOptionId },
    include: { video: true },
  });

  await this.prisma.attemptAnswer.create({
    data: { sessionId, questionId, answerOptionId, isCorrect: answer.isCorrect },
  });

  await this.prisma.testSession.update({
    where: { id: sessionId },
    data: {
      totalCount: { increment: 1 },
      correctCount: answer.isCorrect ? { increment: 1 } : undefined,
    },
  });

  return {
    isCorrect: answer.isCorrect,
    video: answer.video && {
      url: answer.video.url,
      outcome: answer.video.outcome,
      durationSec: answer.video.durationSec,
    },
  };
}
```

Video tanlash uchun alohida "qaysi videoni ko'rsatish" logikasi yo'q — u `answer.video` FK orqali avtomatik keladi. Bu 2-bo'limdagi arxitekturaning to'g'ridan-to'g'ri natijasi.

---

## 7. Web — `ResultVideo` komponenti

```tsx
function ResultVideo({ outcome, url, onDone }: {
  outcome: 'SUCCESS' | 'VIOLATION'; url: string; onDone: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.addEventListener('ended', onDone);
    return () => v.removeEventListener('ended', onDone);
  }, [onDone]);

  return (
    <div className="relative rounded-xl overflow-hidden">
      <video ref={ref} src={url} autoPlay playsInline className="w-full" />
      <span className="absolute top-3 right-3 text-3xl">
        {outcome === 'SUCCESS' ? '✅' : '❌'}
      </span>
    </div>
  );
}
```

Savol ekraniga kirilganda, joriy savolning barcha `videoUrl`'lari uchun fonda `fetch(url, {cache: 'force-cache'})` chaqirib qo'yiladi — shu preload.

---

## 8. Mobil — `expo-video` bilan

```tsx
import { useVideoPlayer, VideoView } from 'expo-video';

function ResultVideo({ url, outcome, onDone }: Props) {
  const player = useVideoPlayer(url, p => { p.play(); });

  useEffect(() => {
    const sub = player.addListener('playToEnd', onDone);
    return () => sub.remove();
  }, [player, onDone]);

  return (
    <View>
      <VideoView player={player} style={{ width: '100%', aspectRatio: 16/9 }} />
      <Text style={styles.badge}>{outcome === 'SUCCESS' ? '✅' : '❌'}</Text>
    </View>
  );
}
```

Savol ro'yxati yuklanganda `player.preload` yoki alohida `useVideoPlayer` instance orqali keyingi ehtimoliy videolarni oldindan bufferlash mumkin — kutubxona buni built-in qo'llab-quvvatlaydi.

---

## 9. Auth oqimi

1. `POST /register` → parol `argon2`/`bcrypt` bilan hash qilinadi
2. `POST /login` → access token (15 daq) + refresh token (30 kun, DB'da saqlanadi)
3. Har himoyalangan so'rov → `AuthGuard` access token'ni tekshiradi
4. Access token muddati tugasa → `POST /refresh` → yangi access token
5. `POST /logout` → refresh token DB'dan o'chiriladi

---

## 10. Bosqichlar

| Faza | Ish | DoD |
|---|---|---|
| **0 — Skeleton** | Monorepo, Prisma schema+migration, NestJS + auth (register/login/refresh), kategoriya seed | `npm run dev` ishlaydi, curl orqali register→login→/me o'tadi |
| **1 — Kontent** | R2 presigned upload, video/kategoriya/savol/javob admin endpointlari | 1 kategoriya, 5 savol, video bilan bog'langan javoblar DB'da bor |
| **2 — Test oqimi** | `/sessions/start`, `/answer`, `/finish` | curl orqali to'liq bitta test sessiyasini o'tkazish mumkin |
| **3 — Web** | Next.js sahifalar, `ResultVideo`, preload | Brauzerda: ro'yxatdan o'tish → test → video natija → yakun |
| **4 — Mobil** | Expo, `expo-video`, xuddi shu oqim | Qurilma/emulyatorda to'liq oqim ishlaydi |
| **5 — Admin UI + statistika** | Kontent qo'shish uchun oddiy panel, tarix sahifasi | Dasturchi bo'lmagan odam UI orqali savol+video qo'sha oladi |
| **6 — Polish** | Video yuklanmasa fallback, offline holat, production deploy | — |

---

## 11. Guardrails

- ❌ Har bir savol uchun noyob video yaratishdan oldin — mavjud "outcome" videolardan foydalanish mumkinmi, tekshiring
- ❌ Video fayllarni Node serveriga proxy qilib yuklash — R2'ga presigned URL orqali to'g'ridan-to'g'ri
- ❌ "10 soniya" talabini playback kodida sun'iy sekinlashtirish orqali bajarish
- ❌ Video URL'larni frontend kodida hardcode qilish
- ❌ Parolni hash'siz saqlash
- ❌ MVP bosqichida Redis/BullMQ/Turborepo qo'shish — hozircha kerak emas

---

## 12. To'liq AI-agent prompt

```
LOYIHA: Mashina Test — video-asosidagi haydovchilik testi (O'zbekiston)

STACK: NestJS (Node.js+TS) + Prisma + PostgreSQL, Next.js+Tailwind (web),
Expo + expo-video (mobil), Cloudflare R2 (video), npm workspaces monorepo.

ASOSIY ARXITEKTURA QOIDASI: video savolga emas, NATIJA TURIGA (Video jadvali)
bog'lanadi; AnswerOption.videoId shu Video'ga ishora qiladi. Bir xil natija
turidagi ko'plab javoblar bitta videoni qayta ishlatadi (~20 ta video,
50-100 ta savol uchun kifoya).

BOSHLANG'ICH VAZIFA (Phase 0):
1. npm workspaces monorepo yarating: backend/, web/, mobile/
2. backend/ ichida NestJS loyihasi, quyidagi Prisma schema bilan:
   [yuqoridagi to'liq schema shu yerga qo'yiladi]
3. auth modulini yozing: register, login (JWT access+refresh), refresh,
   logout, /me — barchasi test bilan
4. Kategoriya seed skripti: 5-6 ta boshlang'ich kategoriya

CHEKLOVLAR:
- Video URL'lar hech qachon frontend kodida hardcode qilinmasin
- "Kamida 10 sekund" — content talabi, playback kodida sun'iy bajarilmasin
- Redis/BullMQ/Turborepo — hozircha qo'shilmasin

Iltimos, Phase 0'ni to'liq kod bilan yarating: package.json (workspaces),
backend/prisma/schema.prisma, backend/src/auth/ (to'liq moduli), va
kategoriya seed skripti.
```