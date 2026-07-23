# 🚗 AVTO (YHQ) — Frontend To'liq Strukturasi va Rivojlanish Rejasi

> Web (React+Vite) + Mobile (Expo) + Flutter App + Content Editor (React)

---
# Frontend (Web) — Tuzatilgan To'liq Struktura va Prompt

Ha, to'g'irladik — asosiy o'zgarish: **`public/content/` va `public/engine.js` endi frontendda saqlanmaydi**, hammasi backend API'dan to'g'ridan-to'g'ri olinadi. Quyida shu tuzatishga mos **to'liq frontend strukturasi**.

## 1. Frontend/web to'liq struktura (tuzatilgan)

```
frontend/web/
├── package.json                    ← @yhq/web
├── vite.config.js                  ← proxy: /api → localhost:4000
├── .env                            ← VITE_API_URL, VITE_ENGINE_URL
├── index.html                      ← __engineRegister hook shu yerda
│                                      Google Fonts: Plus Jakarta Sans, Outfit
│
├── src/
│   ├── main.jsx                    ← React entry
│   ├── App.jsx                     ← 6 tab: home, lessons, practice,
│   │                                   exam, analytics, admin
│   │                                   + Til almashtirgich (UZ/RU/EN)
│   ├── index.css                   ← Dark mode dizayn tizimi
│   │
│   ├── api/                        ← ✅ YANGI: markazlashgan API qatlami
│   │   ├── client.js               ← fetch wrapper, Bearer token, base URL
│   │   ├── auth.api.js             ← login, register, me
│   │   ├── scenarios.api.js        ← getScenarios, getScenarioInfo, getFrame
│   │   ├── lessons.api.js          ← getLessons, getLesson
│   │   ├── progress.api.js         ← getProgress, submitAnswer
│   │   ├── exams.api.js            ← generateExam, submitExam
│   │   └── engine.api.js           ← ✅ YANGI: engine.js'ni backend'dan
│   │                                   dinamik yuklash (script tag orqali)
│   │
│   ├── context/                    ← ✅ YANGI: Auth holatini boshqarish
│   │   └── AuthContext.jsx         ← token, user, login(), logout()
│   │
│   ├── hooks/
│   │   ├── useEngine.js            ← ✅ YANGI: engine yuklanganini kutish
│   │   ├── useAuth.js
│   │   └── useScenarioPlayer.js    ← animatsiya tick logikasi
│   │
│   ├── components/
│   │   ├── ScenarioPlayer.jsx      ← ⭐ Canvas 2D animatsiya pleyeri
│   │   │                             (o'zgarishsiz — engine mantig'i saqlanadi)
│   │   ├── ProtectedRoute.jsx      ← ✅ YANGI: token yo'q bo'lsa /login'ga
│   │   ├── LanguageSwitcher.jsx
│   │   ├── ResultBanner.jsx        ← ✅ / 💥 / ⚠️
│   │   └── Navbar.jsx
│   │
│   └── pages/
│       ├── auth/
│       │   ├── LoginPage.jsx       ← ✅ YANGI
│       │   └── RegisterPage.jsx    ← ✅ YANGI
│       ├── HomePage.jsx
│       ├── PracticePage.jsx
│       ├── ExamPage.jsx
│       ├── LessonsPage.jsx
│       ├── AnalyticsPage.jsx
│       └── AdminPage.jsx
│
└── public/
    ├── icon.svg
    └── manifest.webmanifest
    (content/ va engine.js OLIB TASHLANDI — endi backend'dan keladi)
```

## 2. Engine'ni backend'dan yuklash (asosiy o'zgarish)

`index.html` ichida statik `<script src="/engine.js">` o'rniga, dinamik yuklash:

```javascript
// src/hooks/useEngine.js
import { useEffect, useState } from 'react';

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL; // masalan http://localhost:4000/engine.js

export function useEngine() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.__yhqEngine) { setReady(true); return; }
    const script = document.createElement('script');
    script.src = ENGINE_URL;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, []);

  return ready;
}
```

Bu orqali `sync_engine.js` skripti butunlay kerak bo'lmay qoladi — engine bitta joyda (`backend/server/public/engine.js`) yashaydi, frontend uni URL orqali chaqiradi.

## 3. Auth oqimi (frontend tomonida)

```javascript
// src/context/AuthContext.jsx (qisqartirilgan)
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  async function login(email, password) {
    const { token } = await authApi.login(email, password);
    localStorage.setItem('token', token);
    setToken(token);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

`ProtectedRoute.jsx` — token yo'q bo'lsa `/login`'ga yo'naltiradi, `practice`, `exam`, `analytics` sahifalari shu bilan o'raladi.

## 4. To'liq Prompt — Frontend (Web) uchun

```
LOYIHA: AVTO (YHQ) — Frontend Web qismi (React + Vite)

MAVJUD HOLAT:
- React 18 + Vite 5, dark mode dizayn tizimi (index.css, 942 qator)
- ScenarioPlayer.jsx — Canvas 2D animatsiya pleyeri, engine bilan ishlaydi
- 6 sahifa: Home, Practice, Exam, Lessons, Analytics, Admin
- Hozircha: content/ va engine.js public/ papkasida statik nusxa sifatida saqlanadi
- Hozircha: auth tizimi yo'q

QILINISHI KERAK BO'LGAN O'ZGARISHLAR:

1. src/api/ papkasini yaratish — barcha backend so'rovlarini
   markazlashtirish (client.js — fetch wrapper, Bearer token avtomatik
   qo'shiladi; auth.api.js, scenarios.api.js, progress.api.js, exams.api.js)

2. src/context/AuthContext.jsx yaratish — login/register/logout,
   token localStorage'da saqlanadi, barcha himoyalangan sahifalar
   shu context orqali token holatini tekshiradi

3. src/hooks/useEngine.js yaratish — engine.js'ni public/ papkasidan
   emas, backend'dan (VITE_ENGINE_URL) dinamik <script> orqali yuklash

4. pages/auth/LoginPage.jsx va RegisterPage.jsx yaratish —
   AuthContext bilan bog'langan forma, xato holatlarini ko'rsatish

5. components/ProtectedRoute.jsx yaratish — token yo'q bo'lsa
   /login sahifasiga redirect qiladi

6. public/content/ va public/engine.js papkalarini O'CHIRISH —
   ScenarioPlayer endi scenariylarni faqat 
   GET {VITE_API_URL}/api/scenarios/:id orqali oladi

MUHIM: ScenarioPlayer.jsx dagi mavjud animatsiya mantig'i
(requestAnimationFrame, DPR scaling, optionFrame/buildFrame chaqiruvlari)
O'ZGARTIRILMAYDI — faqat ma'lumot manbai (content/engine) o'zgaradi.

DIZAYN TIZIMI (saqlanadi):
- Dark mode: #0b0f19 → #151c2c → #1e293b
- Accent: Blue #3b82f6, Cyan #06b6d4, Green #10b981, Red #ef4444
- Font: Plus Jakarta Sans, Outfit
- Glassmorphism, backdrop-filter, gradient text

Iltimos, avval src/api/client.js va src/context/AuthContext.jsx ni
to'liq kod bilan yarating, keyin LoginPage.jsx va RegisterPage.jsx ni
mavjud dizayn tizimiga mos qilib yozing.
```

Shu promptdan boshlab **`api/client.js` va `AuthContext.jsx`** kodini hoziroq to'liq yozib beraymi?


# AVTO (YHQ) — Frontend (Web) uchun To'liq va Tushunarli Prompt

Quyida frontend qismini boshlash uchun **to'liq, o'zida barcha kontekstni saqlagan** promptni tayyorladim — buni to'g'ridan-to'g'ri Claude Code yoki boshqa AI-agentga, yoki jamoadagi dasturchiga berishingiz mumkin.

```
════════════════════════════════════════════════════════════════
LOYIHA: AVTO (YHQ) — O'zbekiston YHQ Interaktiv Ta'lim Platformasi
QISM: Frontend Web (React + Vite)
════════════════════════════════════════════════════════════════

── 1. LOYIHA HAQIDA QISQACHA ──────────────────────────────────────

Bu — haydovchilik guvohnomasiga tayyorgarlik ko'rayotgan foydalanuvchilar
uchun platforma. Har bir savol video EMAS, balki backend'dagi Dart
engine tomonidan REAL VAQTDA hisoblanadigan 2D animatsiya orqali
javob beriladi (mashina to'g'ri o'tadi ✅ yoki to'qnashadi 💥).

Frontend vazifasi: foydalanuvchiga chiroyli interfeys berish, backend
API bilan gaplashish, va Canvas orqali engine natijasini chizish.
Frontend hech qanday simulyatsiya HISOBLAMAYDI — faqat backend'dan
kelgan "display list" (chizish buyruqlari) ni Canvas'ga chizadi.

── 2. TEXNOLOGIYALAR ─────────────────────────────────────────────

- React 18 + Vite 5
- Til: JavaScript (JSX), TypeScript'ga o'tish ixtiyoriy
- Styling: oddiy CSS (Tailwind EMAS — mavjud loyihada index.css
  qo'lda yozilgan dizayn tizimi bor, shu davom ettiriladi)
- State: React Context (Redux/Zustand kerak emas, loyiha hajmi kichik)
- HTTP: fetch API (axios kerak emas)

── 3. BACKEND BILAN SHARTNOMA (API CONTRACT) ─────────────────────

Base URL: import.meta.env.VITE_API_URL (masalan http://localhost:4000)

AUTH:
  POST /api/auth/register   { email, password }        → { token, user }
  POST /api/auth/login      { email, password }        → { token, user }
  GET  /api/auth/me         (Bearer token)              → { id, email }

SSENARIYLAR (auth shart emas — ochiq kontent):
  GET  /api/scenarios                    → [{ id, topic, type }, ...]
  GET  /api/scenarios?topic=signs        → filtrlangan ro'yxat
  GET  /api/scenarios/:id                → to'liq ssenariy JSON
  GET  /api/scenarios/:id/info           → { duration, options: { o1: {clean:true}, ... } }
  GET  /api/scenarios/:id/frame?t=2.5&option=o2  → { canvas: 1000, ops: [...] }

DARSLIKLAR:
  GET  /api/lessons                      → [{ id, title, description }, ...]
  GET  /api/lessons/:id                  → { id, title, sections: [...] }

PROGRESS (Bearer token SHART):
  GET  /api/progress                     → { total, correct, wrong, answers: [...] }
  POST /api/progress/answer  { scenarioId, optionId } → { ok, correct, outcome }

IMTIHON (Bearer token SHART):
  GET  /api/exams/generate               → { scenarios: [...20 ta...] }
  POST /api/exams/submit  { answers: [{scenarioId, optionId}, ...] }
                                          → { score, total, passed, results }

ENGINE:
  GET  /engine.js                        → dart2js kompilyatsiya qilingan
                                            JS fayl, <script> orqali yuklanadi,
                                            window.__yhqEngine ni ro'yxatdan
                                            o'tkazadi (sceneInfo, buildFrame,
                                            optionFrame funksiyalari bilan)

MUHIM: 401 xato kelsa (token eskirgan/yo'q) — foydalanuvchi avtomatik
/login sahifasiga yo'naltiriladi va localStorage tozalanadi.

── 4. TO'LIQ FAYL STRUKTURASI ─────────────────────────────────────

frontend/web/
├── .env                          → VITE_API_URL=http://localhost:4000
│                                    VITE_ENGINE_URL=http://localhost:4000/engine.js
├── index.html                    → Google Fonts (Plus Jakarta Sans, Outfit)
├── vite.config.js                → proxy: /api → VITE_API_URL
│
└── src/
    ├── main.jsx                  → ReactDOM root, AuthProvider bilan o'raladi
    ├── App.jsx                   → Router, 6 sahifa + navbar
    ├── index.css                 → mavjud dizayn tizimi (o'zgarishsiz qoladi)
    │
    ├── api/
    │   ├── client.js             → fetch wrapper: base URL, Bearer token
    │   │                            avtomatik qo'shadi, 401'da logout+redirect
    │   ├── auth.api.js           → register(), login(), me()
    │   ├── scenarios.api.js      → getScenarios(), getScenarioInfo(id),
    │   │                            getFrame(id, t, option)
    │   ├── lessons.api.js        → getLessons(), getLesson(id)
    │   ├── progress.api.js       → getProgress(), submitAnswer(scenarioId, optionId)
    │   └── exams.api.js          → generateExam(), submitExam(answers)
    │
    ├── context/
    │   └── AuthContext.jsx       → { token, user, login, register, logout }
    │                                token localStorage'da saqlanadi,
    │                                sahifa yuklanganda /auth/me chaqirib
    │                                user ma'lumotini tekshiradi
    │
    ├── hooks/
    │   ├── useAuth.js            → useContext(AuthContext) qulay wrapper
    │   ├── useEngine.js          → engine.js'ni dinamik yuklaydi,
    │   │                            window.__yhqEngine tayyor bo'lganda
    │   │                            ready=true qaytaradi
    │   └── useScenarioPlayer.js  → requestAnimationFrame tsikli,
    │                                playback speed, DPR scaling logikasi
    │
    ├── components/
    │   ├── Navbar.jsx            → logo, tab linklar, til almashtirgich,
    │   │                            login holatiga qarab Login/Logout tugma
    │   ├── LanguageSwitcher.jsx  → UZ / RU / EN
    │   ├── ProtectedRoute.jsx    → token yo'q bo'lsa <Navigate to="/login" />
    │   ├── ScenarioPlayer.jsx    → ⭐ Canvas 2D pleyer (MAVJUD, saqlanadi):
    │   │                            - useEngine() orqali engine tayyorligini kutadi
    │   │                            - useScenarioPlayer() bilan animatsiya tick
    │   │                            - user tanlagan option → optionFrame() chaqiradi
    │   │                            - ▶/⏸, scrubber, 0.25x-1x tezlik tugmalari
    │   ├── ResultBanner.jsx      → ✅ to'g'ri / 💥 to'qnashuv / ⚠️ ogohlantirish
    │   └── LoadingSpinner.jsx
    │
    └── pages/
        ├── auth/
        │   ├── LoginPage.jsx     → email+parol forma, xato xabari,
        │   │                        muvaffaqiyatda /practice'ga redirect
        │   └── RegisterPage.jsx  → email+parol+tasdiqlash, validatsiya
        ├── HomePage.jsx          → hero, statistika kartochkalari,
        │                            feature kartochkalari (MAVJUD dizaynga mos)
        ├── PracticePage.jsx      → mavzu filtri → ScenarioPlayer →
        │                            javob tanlash → progress.answer() yuboradi
        ├── ExamPage.jsx          → 20 ta savol, 20 daqiqa taymer,
        │                            savol palette, submit → natija
        ├── LessonsPage.jsx       → sidebar + tafsilot paneli
        ├── AnalyticsPage.jsx     → progress statistikasi, oxirgi urinishlar
        └── AdminPage.jsx         → (faqat admin uchun — keyingi bosqichda)

── 5. DIZAYN TIZIMI (QAT'IY SAQLANADI, O'ZGARTIRILMAYDI) ─────────

Fon:        #0b0f19 → #151c2c → #1e293b (dark, gradient)
Accent:     Blue #3b82f6, Cyan #06b6d4, Green #10b981,
            Red #ef4444, Amber #f59e0b, Purple #8b5cf6
Font:       "Plus Jakarta Sans", "Outfit", system-ui
Effektlar:  Glassmorphism (backdrop-filter: blur), gradient text,
            glow shadows (box-shadow bilan rangli soya)
Responsive: 1024px va 900px breakpointlar
Til:        Har bir matn { uz, ru, en } strukturasida keladi
            (backend'dan), foydalanuvchi tanlagan tilga qarab
            ko'rsatiladi

── 6. BAJARISH TARTIBI (QAT'IY KETMA-KETLIK) ─────────────────────

BOSQICH 1 — Fundament (auth va API qatlami):
  1.1  api/client.js — fetch wrapper, Bearer token, 401 handler
  1.2  api/auth.api.js
  1.3  context/AuthContext.jsx
  1.4  hooks/useAuth.js

BOSQICH 2 — Auth UI:
  2.1  pages/auth/LoginPage.jsx
  2.2  pages/auth/RegisterPage.jsx
  2.3  components/ProtectedRoute.jsx
  2.4  App.jsx ga routing qo'shish

BOSQICH 3 — Engine integratsiyasi (video/content dublikatsiyasiz):
  3.1  hooks/useEngine.js — backend'dan dinamik yuklash
  3.2  api/scenarios.api.js
  3.3  hooks/useScenarioPlayer.js
  3.4  components/ScenarioPlayer.jsx ni yangi api/ qatlamiga ulash

BOSQICH 4 — Asosiy sahifalar:
  4.1  PracticePage.jsx (ScenarioPlayer + progress.answer())
  4.2  ExamPage.jsx (taymer + submit logikasi)
  4.3  LessonsPage.jsx
  4.4  AnalyticsPage.jsx

BOSQICH 5 — Yakuniy:
  5.1  HomePage.jsx (statistika, feature kartochkalar)
  5.2  Navbar.jsx + LanguageSwitcher.jsx
  5.3  AdminPage.jsx (agar admin funksiyasi shu bosqichda kerak bo'lsa)

── 7. MUHIM CHEKLOVLAR VA QOIDALAR ────────────────────────────────

❌ public/content/ va public/engine.js YARATILMAYDI — bularning
   o'rniga backend API va /engine.js URL ishlatiladi
❌ localStorage'dan tashqari browser storage ishlatilmaydi
   (token faqat localStorage'da, boshqa hech narsa keshlanmaydi)
❌ ScenarioPlayer'ning animatsiya mantig'i (Canvas chizish, DPR
   scaling, requestAnimationFrame) o'zgartirilmaydi — faqat
   ma'lumot manbai (props/hooks) yangilanadi
✅ Har bir sahifa mobil (< 900px) va desktop uchun responsive
   bo'lishi kerak
✅ Xato holatlari (network xato, 401, validatsiya xatosi)
   foydalanuvchiga tushunarli xabar bilan ko'rsatilishi kerak

── 8. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA) ────────────────

☐ Foydalanuvchi ro'yxatdan o'tib, tizimga kirishi mumkin
☐ Token yo'q bo'lsa /practice, /exam, /analytics'ga kirish mumkin emas
☐ Practice sahifasida ssenariy tanlanganda animatsiya to'g'ri ishlaydi
☐ To'g'ri javobda ✅, xato javobda 💥/⚠️ banner ko'rsatiladi
☐ Har bir javob backend'ga yuboriladi va Analytics'da ko'rinadi
☐ Exam 20 daqiqa taymer bilan ishlaydi, 18/20 = o'tish balli
☐ Til almashtirilganda barcha matnlar (savol, javob, qoida) yangilanadi
☐ engine.js va content endi frontend papkasida FIZIK MAVJUD EMAS

════════════════════════════════════════════════════════════════
BOSHLASH BUYRUG'I: Yuqoridagi "Bajarish tartibi"dagi 1.1 dan
boshlab, har bir faylni to'liq kod bilan, ketma-ket yarating.
Har bosqichdan keyin to'xtab, keyingi bosqichga o'tishdan oldin
tasdiqlashimni kuting.
════════════════════════════════════════════════════════════════
```

Shu promptga muvofiq **1.1 — `api/client.js`** dan boshlab to'liq kod yozib beraymi?
## 1. Arxitektura

```
frontend/
├── web/              ← React + Vite SPA (6 sahifa: Home, Lessons, Practice, Exam, Analytics, Admin)
│   ├── src/
│   │   ├── components/    ← ScenarioPlayer, PlaybackBar, OptionsList, OutcomeBanner, RuleExplanation
│   │   ├── pages/         ← 6 ta sahifa komponenti
│   │   ├── hooks/         ← useEngine, useScenarios, useProgress, useTimer
│   │   ├── services/      ← api.js (fetch wrapper), i18n.js (til boshqaruvi)
│   │   └── context/       ← AppContext (lang state)
│   └── public/
│       └── engine.js      ← Pure JS engine (shared/engine-js dan sync)
│
├── app/              ← Flutter (Drift SQLite, Riverpod)
│   └── lib/
│       ├── database/      ← Tables (UserProgress, Answer, ExamAttempt) + DAOs
│       ├── providers/     ← Riverpod providers
│       └── services/      ← sync_service, auth_service, engine_service
│
├── mobile/           ← Expo React Native (WebView engine)
├── editor/           ← React content editor (Phase 6)
└── Task.md
```

## 2. Engine JS (@yhq/engine — Pure JS, dart2js emas!)

```
shared/engine-js/
├── src/
│   ├── core.js            ← Vec2, OBB, constants (LANE_WIDTH=60, VEHICLE_LENGTH=90, TICK_DT=1/60)
│   ├── layout.js          ← Road layout derivation (yo'llar, yo'laklar, stop pozitsiyalari)
│   ├── trajectory.js      ← Bézier curve generation + arc-length parameterization
│   ├── simulation.js      ← 60fps tick simulation + OBB collision detection
│   ├── outcome.js         ← 6 outcome classifiers (collision, priority_violation, sign_violation, marking_violation, unnecessary_wait, unsafe_but_legal)
│   ├── scene_builder.js   ← Display list generation (fillPolygon, strokePath, fillCircle)
│   ├── renderer.js        ← Canvas 2D rendering
│   ├── api.js             ← Public API (sceneInfo, buildFrame, optionFrame, buildScene)
│   └── build.mjs          ← Bundle builder → engine.js
│
├── engine.js              ← Built bundle (14.5 KB, standalone, pure JS)
├── index.mjs              ← Node.js entry
├── load.node.mjs          ← Node.js engine loader
├── renderer.mjs           ← Canvas 2D renderer (ES module)
└── types.d.ts             ← TypeScript type definitions
```

### Public API (window.__yhqEngine)

| Function | Input | Output |
|---|---|---|
| `sceneInfo(json)` | Scenario JSON string | `{ options, duration, warnings }` |
| `buildFrame(json, t)` | Scenario JSON + time (s) | `{ ops: [...] }` (correct answer) |
| `optionFrame(json, optId, t)` | Scenario JSON + option ID + time | `{ ops: [...] }` (user answer) |
| `buildScene(json)` | Scenario JSON | `{ ops: [...] }` (t=0 preview) |
| `version` | - | `"0.1.0"` |

### Canvas Renderer (window.__yhqDraw)

```javascript
// 3 primitiv:
// - fillPolygon { type, points: Vec2[], colour: ARGB }
// - strokePath  { type, points: Vec2[], colour: ARGB, width, dash? }
// - fillCircle  { type, centre: Vec2, radius, colour: ARGB }

window.__yhqDraw(ctx, frame, { size: 900 });
```

### Engine Build

```bash
node shared/engine-js/build.mjs  # → shared/engine-js/engine.js
```

### Enginening algoritmi:

```
Scenario JSON
  → deriveLayout() → yo'llar, yo'laklar geometriyasi
  → buildTrajectory() → Bézier egri chiziqlar (to'g'ri, o'ng, chap, U-turn)
  → simulateOrder() → 60 FPS tick, actor release sequencing
  → OBB collision detection (SAT algorithm)
  → classifyOption() → 6 outcome type
  → buildScene() → display list: fillPolygon / strokePath / fillCircle
  → drawDisplayList(ctx, frame) → Canvas 2D
```

## 3. Database

### Flutter — Drift SQLite (frontend/app/lib/database/)

| Table | Fields |
|---|---|
| `UserProgress` | id, correctAnswers, wrongAnswers, lastSyncAt |
| `Answer` | id, scenarioId, optionId, isCorrect, outcomeType, answeredAt, userId |
| `ExamAttempt` | id, score, total, passed, durationSeconds, createdAt, userId |

### Backend — PostgreSQL/Prisma (backend/prisma/schema.prisma)

| Table | Fields |
|---|---|
| `User` | id (uuid), phone?, email?, password, name?, createdAt |
| `Answer` | id (uuid), userId, scenarioId, optionId, isCorrect, outcomeType, answeredAt |
| `ExamAttempt` | id (uuid), userId, score, total, passed, durationSeconds, details (Json?) |
| `Scenario` | id, topic?, sceneType? |
| `Lesson` | id, title, topic?, ruleCode? |

### Auth (JWT)
- `POST /api/auth/register` → `{ token, user }`
- `POST /api/auth/login` → `{ token, user }`
- `GET /api/auth/me` (Bearer) → user ma'lumoti
- Auth middleware: `authMiddleware`, `optionalAuth`

## 4. Ishlab Chiqish Buyruqlari

```bash
# Engine build
cd shared/engine-js && node build.mjs

# Web app
cd frontend/web && npm run dev

# Backend
cd backend && npm run dev

# Engine test
cd engine_dart && dart pub get && dart test

# Schema codegen
node tools/codegen.js

# Content validate
node tools/validate.js content

# Database
cd backend && npx prisma generate && npx prisma db push
```
