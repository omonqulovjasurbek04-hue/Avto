# 🚗 AVTO (YHQ) — To'liq Loyiha Hujjati

> O'zbekiston Yo'l Harakati Qoidalari (YHQ) bo'yicha interaktiv ta'lim platformasi.
> Foydalanuvchi savolga javob berganida natija **2D animatsiya** sifatida ko'rsatiladi.

---

## 📋 Mundarija

1. [Loyiha Maqsadi](#1-loyiha-maqsadi)
2. [Texnologiyalar](#2-texnologiyalar)
3. [Monorepo Strukturasi](#3-monorepo-strukturasi)
4. [Schema — Ma'lumotlar Manbai](#4-schema--malumotlar-manbai)
5. [Engine Dart — Simulyatsiya Dvigateli](#5-engine-dart--simulyatsiya-dvigateli)
6. [Shared Engine-JS — Brauzer Ko'prigi](#6-shared-engine-js--brauzer-koprigi)
7. [Backend Server — REST API](#7-backend-server--rest-api)
8. [Frontend Web — React SPA](#8-frontend-web--react-spa)
9. [Frontend Mobile — Expo App](#9-frontend-mobile--expo-app)
10. [Frontend App — Flutter (Skeleton)](#10-frontend-app--flutter-skeleton)
11. [Content — Ssenariy Fayllari](#11-content--ssenariy-fayllari)
12. [Tools — Ishchi Skriptlar](#12-tools--ishchi-skriptlar)
13. [Ma'lumot Oqimi (Data Flow)](#13-malumot-oqimi)
14. [API Endpoint Hujjati](#14-api-endpoint-hujjati)
15. [Ishga Tushirish Buyruqlari](#15-ishga-tushirish-buyruqlari)
16. [Test va Tekshirish](#16-test-va-tekshirish)
17. [Loyiha Fazalari](#17-loyiha-fazalari)

---

## 1. Loyiha Maqsadi

Bu platforma haydovchilik guvohnomasiga tayyorgarlik ko'rayotgan foydalanuvchilarga
**interaktiv 2D animatsiyalar** orqali yo'l harakati qoidalarini o'rgatadi.

**Asosiy farqi boshqa ilovalardan:**

- Har bir savol uchun **video yoki animatsiya qo'lda yaratilmaydi**
- Ssenariy JSON fayl sifatida yoziladi, **engine avtomatik** yo'l, mashinalar,
  traektoriyalar va to'qnashuvlarni hisoblaydi
- Xato javob berilsa — mashina **haqiqatan to'qnashadi** yoki **qoida buzilishi**
  ko'rsatiladi
- To'g'ri javob — mashinalar muammosiz o'tadi

---

## 2. Texnologiyalar

| Qatlam         | Texnologiya              | Versiya           |
| -------------- | ------------------------ | ----------------- |
| **Monorepo**   | npm workspaces           | Node ≥ 20         |
| **Engine**     | Pure Dart (Flutter-siz)  | Dart ≥ 3.5        |
| **Engine → JS**| dart2js                  | —                 |
| **Backend**    | Express.js               | 4.x               |
| **Web**        | React + Vite             | React 18 + Vite 5 |
| **Mobile**     | Expo + React Native      | Expo 51, RN 0.74  |
| **Flutter**    | Flutter (skeleton)       | SDK ≥ 3.0         |
| **Schema**     | JSON Schema 2020-12      | —                 |
| **Test**       | Node built-in test       | —                 |
| **DB**         | JSON file (fallback)     | —                 |

---

## 3. Monorepo Strukturasi

```
Avto/                                ← Loyiha ildizi (monorepo root)
│
├── package.json                     ← Workspaces konfiguratsiyasi
├── package-lock.json                ← Dependency lock
├── CLAUDE.md                        ← Loyiha printsiplari va qoidalar
├── README.md                        ← Umumiy ma'lumot
├── Task.md                          ← ← SHU FAYL
├── .gitignore                       ← Git-dan chiqarilgan fayllar
│
│ ══════════════════════════════════════════════════════════════
│ 1. SCHEMA — Barcha tiplar uchun yagona manba
│ ══════════════════════════════════════════════════════════════
│
├── schema/
│   ├── scenario.schema.json         ← Ssenariy sxemasi (229 qator)
│   │                                   Scene, actors, question, resolution
│   ├── question.schema.json         ← Savol banki sxemasi (70 qator)
│   │                                   Matnli savollar (animatsiyasiz ~60%)
│   ├── yhq_registry.json            ← Belgi va qoida kodlari registri
│   │                                   Har biri verified: true/false
│   ├── README.md                    ← Schema konventsiyalar hujjati
│   └── generated/
│       └── scenario.g.ts            ← [AUTO] TS tiplar (codegen yaratadi)
│
│ ══════════════════════════════════════════════════════════════
│ 2. ENGINE — Deterministik 2D simulyatsiya
│ ══════════════════════════════════════════════════════════════
│
├── engine_dart/
│   ├── pubspec.yaml                 ← Dart paket (Flutter-siz!)
│   ├── lib/
│   │   ├── engine.dart              ← Kutubxona eksporti
│   │   └── src/
│   │       ├── generated/
│   │       │   └── scenario.g.dart  ← [AUTO] Dart tiplar (codegen yaratadi)
│   │       │
│   │       ├── geom.dart            ← Geometriya: Vec2, OBB, polyline (7 KB)
│   │       ├── layout.dart          ← Yo'l layouti: yo'laklar, markaz (6.3 KB)
│   │       │
│   │       ├── motion/              ← HARAKAT TIZIMI
│   │       │   ├── trajectory.dart  ←   Bézier traektoriyalar (6.5 KB)
│   │       │   │                        to'g'ri / chap / o'ng / U-turn
│   │       │   ├── curve.dart       ←   Arc-length parametrizatsiya (5 KB)
│   │       │   │                        bir tekis tezlik uchun
│   │       │   ├── choreography.dart←   resolution.order ketma-ketlik (6.8 KB)
│   │       │   ├── simulation.dart  ←   60 FPS tick simulyatsiya (3.4 KB)
│   │       │   │                        OBB collision check har kadrda
│   │       │   ├── motion_profile.dart← Tezlik profillari (4.7 KB)
│   │       │   │                        tezlanish, sekinlashish, to'xtash
│   │       │   ├── playback.dart    ←   3 rejim: preview/user/correct (2.7 KB)
│   │       │   └── outcome.dart     ←   6 ta natija klassifikator (7.3 KB)
│   │       │                            collision, priority_violation, ...
│   │       │
│   │       └── render/              ← CHIZISH TIZIMI
│   │           ├── scene_builder.dart← Display list yaratish (14.5 KB)
│   │           │                       ENG KATTA FAYL — barcha qatlamlar
│   │           ├── draw_op.dart     ←  3 primitiv: fillPolygon, strokePath,
│   │           │                       fillCircle (4.2 KB)
│   │           ├── palette.dart     ←  Ranglar palettasi (5.6 KB)
│   │           ├── sign_art.dart    ←  Yo'l belgilari rasmlari (4.4 KB)
│   │           ├── scene_json.dart  ←  JSON serialization (2.5 KB)
│   │           ├── scene_player.dart←  Playback controller (2.6 KB)
│   │           ├── viewport.dart    ←  1000×1000 → real pixel (2 KB)
│   │           └── content_warning.dart ← Ogohlantirish tizimi (2 KB)
│   │
│   ├── web/
│   │   └── engine_web.dart          ← dart2js entry point
│   │                                   __engineRegister() hook orqali eksport
│   ├── bin/
│   │   ├── export_scene.dart        ← Display list → JSON eksport
│   │   ├── render.dart              ← Ssenariy → PNG render
│   │   └── render_frames.dart       ← Kadrlar ketma-ketligi → PNG
│   │
│   └── test/                        ← 13 ta test fayl
│       ├── geom_test.dart           ←   Vec2 arifmetika, OBB collision
│       ├── layout_test.dart         ←   Yo'l layout, yo'lak pozitsiyalari
│       ├── trajectory_test.dart     ←   Bézier traektoriya (9.2 KB)
│       ├── choreography_test.dart   ←   Actor ketma-ketligi
│       ├── simulation_test.dart     ←   Tick-tick simulyatsiya
│       ├── motion_profile_test.dart ←   Tezlik profili
│       ├── playback_test.dart       ←   Preview/user/correct
│       ├── outcome_test.dart        ←   6 ta natija
│       ├── palette_test.dart        ←   Rang to'g'riligi
│       ├── purity_test.dart         ←   Flutter import YO'Q tekshiruvi
│       ├── roundtrip_test.dart      ←   JSON encode→decode fixpoint
│       ├── snapshot_test.dart       ←   Golden pixel solishtirish
│       ├── motion_golden_test.dart  ←   Harakat golden snapshot
│       └── goldens/                 ←   Golden test rasmlari
│
│ ══════════════════════════════════════════════════════════════
│ 3. SHARED ENGINE-JS — Dart → JS ko'prik
│ ══════════════════════════════════════════════════════════════
│
├── shared/engine-js/
│   ├── package.json                 ← NPM paketi: @yhq/engine
│   ├── engine.js                    ← dart2js compiled bundle (132 KB)
│   ├── index.mjs                    ← Entry: loadEngineNode + drawDisplayList
│   ├── load.node.mjs                ← Node.js vm moduli orqali yuklash
│   ├── renderer.mjs                 ← Canvas 2D renderer (57 qator)
│   │                                   Faqat 3 operatsiya:
│   │                                   fillPolygon, strokePath, fillCircle
│   └── types.d.ts                   ← TypeScript type definitsiyalar
│
│ ══════════════════════════════════════════════════════════════
│ 4. BACKEND — Express REST API Server
│ ══════════════════════════════════════════════════════════════
│
├── backend/server/
│   ├── package.json                 ← NPM paketi: @yhq/server
│   ├── src/
│   │   ├── index.mjs               ← Server entry (port 4000, 0.0.0.0)
│   │   │                              CORS, static, error handler
│   │   ├── routes.mjs              ← API marshrutlari (290+ qator)
│   │   │                              scenarios, lessons, progress,
│   │   │                              exams, admin — barchasi shu yerda
│   │   ├── engine.mjs              ← @yhq/engine wrapper (38 qator)
│   │   │                              sceneInfo(), frame(), EngineError
│   │   ├── content.mjs             ← Ssenariy JSON fayllarni CRUD (71 qator)
│   │   │                              path traversal himoyasi bor
│   │   ├── lessons.mjs             ← Darsliklar CRUD (165 qator)
│   │   │                              Birinchi ishga tushirishda 4 ta
│   │   │                              boshlang'ich darslik yaratiladi
│   │   └── db.mjs                  ← DB abstraktsiyasi (117 qator)
│   │                                  JSON / MongoDB / PostgreSQL
│   │                                  Hozirda faqat JSON ishlaydi
│   │                                  Atomic write + serialized mutations
│   ├── test/
│   │   └── api.test.mjs            ← 4 ta unit test
│   ├── data/
│   │   ├── .gitkeep
│   │   ├── progress.json           ← [RUNTIME] Foydalanuvchi progress
│   │   └── lessons/                ← [RUNTIME] Darslik JSON fayllari
│   └── public/
│       ├── index.html              ← Standalone landing
│       ├── player.html             ← Standalone ssenariy player
│       ├── landing.html            ← Marketing landing
│       ├── videos.html             ← Video preview
│       ├── engine.js               ← [SYNC] Engine nusxasi
│       ├── content/                ← [SYNC] Ssenariy nusxalari
│       ├── icon.svg                ← Favicon
│       ├── manifest.webmanifest    ← PWA manifest
│       └── sw.js                   ← Service worker (offline qo'llab-q.)
│
│ ══════════════════════════════════════════════════════════════
│ 5. FRONTEND WEB — React + Vite SPA
│ ══════════════════════════════════════════════════════════════
│
├── frontend/web/
│   ├── package.json                ← NPM paketi: @yhq/web
│   ├── vite.config.js              ← Vite (proxy → localhost:4000)
│   ├── index.html                  ← HTML entry
│   │                                  __engineRegister hook + engine.js
│   │                                  Google Fonts: Plus Jakarta Sans, Outfit
│   ├── public/
│   │   ├── engine.js               ← [SYNC] Engine nusxasi
│   │   └── content/                ← [SYNC] Ssenariy nusxalari
│   └── src/
│       ├── main.jsx                ← React entry point
│       ├── App.jsx                 ← Asosiy komponent
│       │                              6 tab: home, lessons, practice,
│       │                              exam, analytics, admin
│       │                              Til almashtirgich: UZ / RU / EN
│       │                              Glassmorphism sticky header
│       │
│       ├── index.css               ← CSS dizayn tizimi (942 qator)
│       │                              Dark mode (#0b0f19 → #151c2c)
│       │                              Glassmorphism, gradients, glow
│       │                              Responsive: 1024px, 900px breakpoint
│       │
│       ├── components/
│       │   └── ScenarioPlayer.jsx  ← ⭐ ENG MUHIM KOMPONENT
│       │                              Canvas 2D animatsiya pleyeri
│       │                              HiDPI DPR scaling
│       │                              requestAnimationFrame 60 FPS
│       │                              2 rejim: user / correct
│       │                              Playback: ▶/⏸, scrubber, 0.25x-1x
│       │                              Natija: ✅ / 💥 / ⚠️ bannerlari
│       │
│       └── pages/
│           ├── HomePage.jsx        ← Bosh sahifa
│           │                          Hero banner + gradient
│           │                          4 ta statistika kartochka
│           │                          5 ta feature kartochka
│           │                          Tezkor mavzu pills
│           │
│           ├── PracticePage.jsx    ← Mashq rejimi
│           │                          API-dan ssenariy ro'yxat
│           │                          Topic bo'yicha filtr
│           │                          Ssenariy pills bar
│           │                          ScenarioPlayer + prev/next
│           │                          POST /api/progress/.../answer
│           │
│           ├── ExamPage.jsx        ← Imtihon rejimi
│           │                          GET /api/exams/generate (20 savol)
│           │                          20 daqiqalik countdown taymer
│           │                          Savol palette (yashil/ko'k)
│           │                          18/20 = o'tish bali (90%)
│           │
│           ├── LessonsPage.jsx     ← Nazariy darsliklar
│           │                          Sidebar + detail pane layout
│           │                          Darslik bo'limlari (sections)
│           │                          Yo'l belgilari badges
│           │                          Mashq sahifasiga CTA
│           │
│           ├── AnalyticsPage.jsx   ← Statistika
│           │                          Summary kartochkalar
│           │                          Oxirgi 10 ta urinish jadvali
│           │
│           └── AdminPage.jsx       ← Admin panel (596 qator)
│                                      4 tab: Ssenariylar, Darsliklar,
│                                      Engine Validator, Tizim Statistikasi
│                                      CRUD modal formlar
│                                      Schema-ga mos option ID: o1, o2, D
│
│ ══════════════════════════════════════════════════════════════
│ 6. FRONTEND MOBILE — Expo React Native
│ ══════════════════════════════════════════════════════════════
│
├── frontend/mobile/
│   ├── package.json                ← NPM paketi: @yhq/mobile
│   ├── app.json                    ← Expo config (dark mode, com.yhq.avto)
│   ├── App.js                      ← Bottom tab navigation (4 tab)
│   ├── src/
│   │   ├── screens/
│   │   │   ├── HomeScreen.js       ← Hero + navigatsiya kartochkalari
│   │   │   ├── PracticeScreen.js   ← Ssenariy tanlash + MobilePlayer
│   │   │   │                          API: http://10.0.2.2:4000 (emulator)
│   │   │   ├── ExamScreen.js       ← Imtihon rejimi
│   │   │   └── StatsScreen.js      ← Statistika
│   │   └── components/
│   │       └── MobileScenarioPlayer.js ← WebView ichida engine (12.8 KB)
│   │                                      HTML inline yaratadi
│   │                                      postMessage aloqa
│   └── assets/
│       ├── content/                ← [SYNC] Ssenariy nusxalari
│       ├── engine.js               ← [SYNC] Engine nusxasi
│       ├── icon.png                ← Ilova ikonkasi
│       ├── splash.png              ← Splash ekran
│       ├── adaptive-icon.png       ← Android adaptive icon
│       └── favicon.png             ← Web favicon
│
│ ══════════════════════════════════════════════════════════════
│ 7. FLUTTER APP (Skeleton)
│ ══════════════════════════════════════════════════════════════
│
├── frontend/app/
│   ├── pubspec.yaml                ← engine_dart-ga path dependency
│   ├── lib/
│   │   ├── main.dart               ← Flutter MaterialApp
│   │   └── scene_painter.dart      ← CustomPainter (display list chizadi)
│   └── assets/content/             ← [SYNC] Ssenariy nusxalari
│
│ ══════════════════════════════════════════════════════════════
│ 8. CONTENT EDITOR (Phase 6 — bo'sh)
│ ══════════════════════════════════════════════════════════════
│
├── frontend/editor/
│   ├── src/generated/
│   │   └── scenario.g.ts           ← [AUTO] TS tiplar
│   └── public/
│       ├── viewer.html              ← Ssenariy preview sahifasi
│       ├── engine.js                ← [SYNC] Engine nusxasi
│       └── content/                 ← [SYNC] Ssenariy nusxalari
│
│ ══════════════════════════════════════════════════════════════
│ 9. CONTENT — Ssenariy fayllari
│ ══════════════════════════════════════════════════════════════
│
├── content/                         ← 20 ta ssenariy JSON
│   ├── sc-0001.json                 ← 4-way crossroads, priority, 2 actor
│   ├── sc-0002.json                 ← Tram priority, equal intersection
│   ├── sc-0003.json — sc-0020.json  ← Turli chorrahalar va qoidalar
│   └── (barchasi topic: priority_and_intersections)
│
│ ══════════════════════════════════════════════════════════════
│ 10. TOOLS — Qurilish va sinxronizatsiya
│ ══════════════════════════════════════════════════════════════
│
├── tools/
│   ├── codegen.js                   ← Schema → Dart + TS tiplar (289 qator)
│   ├── validate.js                  ← Schema + semantic tekshiruv (3.4 KB)
│   ├── sync_content.js              ← content/ → 5 ta papkaga nusxalash
│   ├── sync_engine.js               ← engine.js → 4 ta papkaga nusxalash
│   ├── verify_js.js                 ← Dart VM vs dart2js solishtirish
│   ├── build_viewer.js              ← Browser viewer qurilishi
│   ├── generate_scenarios.js        ← Ssenariy generatsiyasi
│   ├── make_videos.js               ← Video eksport
│   └── lib/
│       └── semantic.js              ← Semantic tekshirish qoidalari
│
│ ══════════════════════════════════════════════════════════════
│ 11. BOSHQA
│ ══════════════════════════════════════════════════════════════
│
├── docs/                            ← Dizayn hujjatlari
└── .github/                         ← GitHub CI/CD
```

---

## 4. Schema — Ma'lumotlar Manbai

### 4.1 scenario.schema.json — Ssenariy Tuzilishi

```
Scenario
├── id: "sc-XXXX"                    ← Yagona identifikator
├── schema_version: 1                ← Doim 1 (o'zgarsa migration yoziladi)
├── question_id: "q-XXXX"           ← Savol bankidagi ID
├── topic: (13 dan 1)               ← Mavzu
│
├── scene                            ← CHORAHA / YO'L TAVSIFI
│   ├── type: (12 dan 1)            ← crossroads_4way, t_junction, ...
│   ├── roads[]:                     ← Yo'llar ro'yxati
│   │   ├── dir: "N"|"S"|"E"|"W"    ← Kompas yo'nalishi
│   │   ├── lanes_in: number        ← Kirish yo'laklari soni
│   │   ├── lanes_out: number       ← Chiqish yo'laklari soni
│   │   └── priority: "main"|"secondary"|"equal"
│   ├── signs[]:                     ← Yo'l belgilari
│   │   ├── at: "N"|"S"|"E"|"W"     ← Qaysi yo'lda
│   │   └── code: "2.1"|"2.4"|...   ← Belgi kodi
│   ├── markings[]:                  ← Yo'l chiziqlari
│   │   ├── type: "crosswalk"|...
│   │   └── at: "N"|"S"|"E"|"W"
│   ├── lights[]:                    ← Svetoforlar
│   │   ├── at: "all"|"N"|...
│   │   └── state: "green"|"red"|"off"|...
│   ├── tram_track?: { along: "NS"|"EW" }
│   └── conditions:
│       ├── time: "day"|"night"|"dusk"
│       └── weather: "clear"|"rain"|"fog"|"snow"
│
├── actors[]                         ← MASHINALAR
│   ├── id: "ego"|"a1"|"a2"|...     ← Yagona nomi
│   ├── kind: "car"|"truck"|"tram"|"bus"|"motorcycle"|"pedestrian"
│   ├── role?: "player"             ← Faqat "ego" uchun
│   ├── from: "N"|"S"|"E"|"W"      ← Qaerdan keladi
│   ├── to: "N"|"S"|"E"|"W"        ← Qaerga ketadi
│   ├── lane_in?: number            ← Qaysi yo'lakdan kiradi
│   ├── lane_out?: number           ← Qaysi yo'lakdan chiqadi
│   └── color?: string              ← Mashina rangi
│
├── question                         ← SAVOL
│   ├── text:                        ← Savol matni (3 tilda)
│   │   ├── uz: "..."
│   │   ├── ru: "..."
│   │   └── en: "..."
│   ├── options[]:                   ← Javob variantlari (2-5 ta)
│   │   ├── id: "o1"|"o2"|"D"       ← Option identifikator
│   │   ├── refers_to?: "a1"|"ego"  ← Qaysi actorga tegishli
│   │   └── label: { uz, ru, en }   ← Variant matni
│   └── correct: "o1"               ← To'g'ri javob IDsi
│
└── resolution                       ← YECHIM
    ├── order: ["a1", "ego"]         ← To'g'ri o'tish ketma-ketligi
    ├── rule:                        ← Qoida
    │   ├── code: "13.9"             ← YHQ qoida raqami
    │   └── text: { uz, ru, en }     ← Qoida matni
    └── wrong_outcomes:              ← Xato javoblar natijalari
        └── { "o2": { "type": "collision", "with": "a1" } }
```

### 4.2 Mavzular (Topics) — 13 ta

| # | Topic ID | O'zbekcha |
|---|----------|-----------|
| 1 | `priority_and_intersections` | Chorrahalar va imtiyoz |
| 2 | `signs` | Yo'l belgilari |
| 3 | `markings` | Yo'l chiziqlari |
| 4 | `traffic_lights_and_signals` | Svetofor va signallar |
| 5 | `speed_and_distance` | Tezlik va masofa |
| 6 | `overtaking_and_passing` | Quvib o'tish |
| 7 | `stopping_and_parking` | To'xtash va turish |
| 8 | `pedestrians_and_crossings` | Piyodalar va o'tish joyi |
| 9 | `railway_crossings` | Temir yo'l kesishmalari |
| 10 | `special_vehicles` | Maxsus transport vositalari |
| 11 | `vehicle_condition` | Transport vositasi holati |
| 12 | `documents_and_liability` | Hujjatlar va javobgarlik |
| 13 | `first_aid` | Birinchi yordam |

### 4.3 Scene Turlari — 12 ta

| # | Scene Type | Tavsif |
|---|-----------|--------|
| 1 | `crossroads_4way` | 4 yo'lli chorraha |
| 2 | `t_junction` | T-shakl chorraha |
| 3 | `t_junction_left` | T-chap chorraha |
| 4 | `t_junction_right` | T-o'ng chorraha |
| 5 | `roundabout` | Aylanma harakat |
| 6 | `y_junction` | Y-shakl chorraha |
| 7 | `straight_road` | To'g'ri yo'l |
| 8 | `multi_lane_road` | Ko'p yo'lakli yo'l |
| 9 | `one_way_street` | Bir tomonlama yo'l |
| 10 | `highway_entry` | Magistral kirish |
| 11 | `highway_exit` | Magistral chiqish |
| 12 | `parking_area` | Turish joyi |

### 4.4 Natija Turlari (Wrong Outcomes) — 6 ta

| # | Outcome Type | Tavsif | Animatsiyada |
|---|-------------|--------|--------------|
| 1 | `collision` | To'qnashuv | Mashinalar uriladi 💥 |
| 2 | `priority_violation` | Imtiyoz buzilishi | Boshqa mashina to'xtaydi ⚠️ |
| 3 | `sign_violation` | Belgi buzilishi | Belgi yonib-o'chadi |
| 4 | `marking_violation` | Chiziq buzilishi | Chiziq qizaradi |
| 5 | `unnecessary_wait` | Keraksiz kutish | Mashina kutib turadi ⏳ |
| 6 | `unsafe_but_legal` | Qonuniy lekin xavfli | Ogohlantirish |

---

## 5. Engine Dart — Simulyatsiya Dvigateli

### 5.1 Nima qiladi?

```
JSON ssenariy → engine_dart → Display List + Outcomes + Duration
```

1. **JSON o'qiydi** → yo'l shakli, yo'laklar, belgilar, mashinalar
2. **Layout hisoblaydi** → chorraha markazi, koordinatalar
3. **Traektoriya quradi** → Bézier egri chiziqlari
4. **Simulyatsiya** → 60 FPS tick, OBB collision tekshirish
5. **Display List chiqaradi** → chizish buyruqlari ro'yxati

### 5.2 Render Layers (orqadan oldinga)

```
1. ground           ← Yer rangi
2. road_surface      ← Yo'l yuzasi
3. markings          ← Yo'l chiziqlari
4. tram_track        ← Tramvay relslar
5. vehicles          ← Mashinalar
6. signs             ← Yo'l belgilari
7. lights            ← Svetoforlar
8. overlays          ← Ustki qatlam
9. hud               ← HUD (Head-Up Display)
```

### 5.3 Muhim Xususiyatlar

| Xususiyat | Qiymati |
|-----------|---------|
| Flutter importi | ❌ YO'Q — pure Dart |
| Randomness | ❌ YO'Q — deterministik |
| Wall-clock time | ❌ YO'Q — hisoblangan vaqt |
| FPS | 60 FPS fixed timestep |
| Canvas hajmi | 1000×1000 logical pixels |
| Testlar soni | 13 ta test fayl |

---

## 6. Shared Engine-JS — Brauzer Ko'prigi

### 6.1 Engine API

```typescript
interface EngineApi {
  version: string;

  // Statik scene (t = 0)
  buildScene(scenarioJson: string): string;

  // To'g'ri javob kadri (vaqt bo'yicha)
  buildFrame(scenarioJson: string, time: number): string;

  // Ssenariy metadata: duration + har bir option uchun outcome
  sceneInfo(scenarioJson: string): string;

  // Tanlangan javob kadri (vaqt bo'yicha)
  optionFrame(scenarioJson: string, optionId: string, time: number): string;
}
```

### 6.2 Renderer — Faqat 3 ta primitiv

```javascript
// renderer.mjs
fillPolygon(ctx, points, color)                     // Ko'pburchak to'ldirish
strokePath(ctx, points, color, width, dashPattern)  // Chiziq tortish
fillCircle(ctx, cx, cy, radius, color)              // Doira to'ldirish
```

### 6.3 dart2js Xususiyati

Engine `window.__engineRegister(...)` hook orqali eksport qiladi.
dart2js `-O1+` optimizatsiyasi global yozishlarni olib tashlaydi,
shuning uchun `window.myEngine = ...` ishlamaydi — function call kerak.

---

## 7. Backend Server — REST API

### 7.1 Server Sozlamalari

| Parametr | Qiymati |
|----------|---------|
| Port | 4000 (0.0.0.0) |
| CORS | `CORS_ORIGINS` env, default: ochiq |
| Static | `public/` papkasidan |
| Engine | `@yhq/engine` npm workspace |
| DB | `data/progress.json` (atomic JSON) |

### 7.2 DB — 3 ta Rejim

| Rejim | Env | Holat |
|-------|-----|-------|
| JSON fayl | default | ✅ Ishlaydi |
| MongoDB | `MONGO_URI` | ⬜ Ulanish bor, CRUD yozilmagan |
| PostgreSQL | `DATABASE_URL` | ⬜ Ulanish bor, CRUD yozilmagan |

### 7.3 DB Xavfsizlik

- **writeChain** — serialized mutations (lost update yo'q)
- **rename()** — atomic write (yarmo-yozilgan fayl yo'q)
- **MAX_ANSWERS = 500** — cheksiz o'sishdan himoya
- **Path traversal** — `if (!/^[\w-]+$/.test(id))` tekshiruv

---

## 8. Frontend Web — React SPA

### 8.1 Dizayn Tizimi

| Xususiyat | Qiymati |
|-----------|---------|
| Rang sxemasi | Dark mode |
| Fon | `#0b0f19` → `#151c2c` → `#1e293b` |
| Accent ranglar | Blue `#3b82f6`, Cyan `#06b6d4`, Green `#10b981`, Red `#ef4444`, Amber `#f59e0b`, Purple `#8b5cf6` |
| Font | Plus Jakarta Sans, Outfit, system-ui |
| Effektlar | Glassmorphism, backdrop-filter, gradient text, glow shadows |
| Animatsiyalar | fadeIn, hover transforms, smooth transitions |
| Responsive | 1024px, 900px breakpointlar |

### 8.2 ScenarioPlayer Ishlash Tartibi

```
1. Ssenariy JSON keladi (props orqali)
2. window.__yhqEngine.sceneInfo() → duration va outcomes olinadi
3. requestAnimationFrame tsikli boshlanadi
4. Har kadrda:
   a. Vaqtni hisoblash (playbackSpeed * delta)
   b. Canvas DPR scaling (HiDPI qurilmalar uchun)
   c. Engine dan frame olish:
      - user rejim → optionFrame(json, optionId, time)
      - correct rejim → buildFrame(json, time)
   d. Display list → renderer.mjs → Canvas 2D ga chizish
5. Foydalanuvchi option tanlaydi → engine outcome hisoblaydi
6. Natija banner ko'rsatiladi (✅ / 💥 / ⚠️)
```

---

## 9. Frontend Mobile — Expo App

### 9.1 MobileScenarioPlayer Ishlash Tartibi

```
1. WebView ichida HTML sahifa yaratiladi (inline)
2. Engine bundle (engine.js) va renderer.mjs inline yuklanadi
3. Ssenariy JSON React Native dan postMessage orqali yuboriladi
4. WebView ichida Canvas 2D animatsiya boshlanadi
5. Natijalar postMessage orqali React Native ga qaytariladi
```

### 9.2 API Server Manzili

| Platforma | Manzil |
|-----------|--------|
| Android Emulator | `http://10.0.2.2:4000` |
| iOS Simulator | `http://localhost:4000` |
| Haqiqiy qurilma | `http://<kompyuter-IP>:4000` |

---

## 10. Frontend App — Flutter (Skeleton)

Flutter SDK o'rnatilmagan — bu papka hozirda skeleton holatida.

| Fayl | Vazifasi |
|------|----------|
| `pubspec.yaml` | engine_dart-ga `path: ../../engine_dart` dependency |
| `main.dart` | MaterialApp + ssenariy tanlash UI |
| `scene_painter.dart` | CustomPainter — engine display list-ni Flutter Canvas ga chizadi |

---

## 11. Content — Ssenariy Fayllari

20 ta ssenariy: `sc-0001.json` dan `sc-0020.json` gacha

**Barcha ssenariylar xususiyatlari:**
- Mavzu: `priority_and_intersections`
- Turlar: `crossroads_4way` va `t_junction`
- Har birida: `ego` (player) + 1-2 ta `a1`/`a2` (traffic)
- Har birida: 2-3 ta javob varianti (o1, o2, D)
- Har birida: YHQ qoida izohi (uz/ru/en)
- Qoidalar: 13.9 (asosiy yo'l), 13.11 (tramvay imtiyozi), 13.12 (chapga burilish)

---

## 12. Tools — Ishchi Skriptlar

### 12.1 codegen.js — Tip Generatsiya (289 qator)

```bash
node tools/codegen.js
```

| Manba | Natija |
|-------|--------|
| `schema/scenario.schema.json` | → `engine_dart/.../scenario.g.dart` |
| `schema/question.schema.json` | → `frontend/editor/.../scenario.g.ts` |
| | → `schema/generated/scenario.g.ts` |

Statistika: **14 enum, 17 class, 1 alias**

### 12.2 validate.js — Tekshiruv

```bash
node tools/validate.js content
```

2 darajali tekshiruv:
1. **Schema validation** — JSON Schema moslik
2. **Semantic validation** — yo'l sonlari, actor havolalari, option IDlar

Hozirgi natija: **20 fayl, 0 xato, 112 ogohlantirish**

Ogohlantirish sabablari:
- Belgi kodlari rasmiy YHQ matni bilan tasdiqlanmagan (`verified: false`)
- Ayrim option-larda ru/en tarjimalar yo'q
- `wrong_outcomes` da "D" optsiyasi uchun hint yo'q

### 12.3 sync_content.js — Kontent Tarqatish

```bash
node tools/sync_content.js
```

`content/` → 5 ta joyga nusxalaydi:
1. `frontend/app/assets/content/`
2. `frontend/editor/public/content/`
3. `backend/server/public/content/`
4. `frontend/web/public/content/`
5. `frontend/mobile/assets/content/`

### 12.4 sync_engine.js — Engine Tarqatish

```bash
node tools/sync_engine.js
```

`shared/engine-js/engine.js` → 4 ta joyga:
1. `backend/server/public/engine.js`
2. `frontend/web/public/engine.js`
3. `frontend/mobile/assets/engine.js`

### 12.5 verify_js.js — Dart vs JS Tekshiruv

```bash
node tools/verify_js.js
```

Dart VM va dart2js natijalarini op-by-op solishtiradi.
Farq bo'lsa — build fail qiladi.

---

## 13. Ma'lumot Oqimi

### Kontent yaratish oqimi:

```
Schema (scenario.schema.json)
    ↓ codegen.js
Dart tiplar (scenario.g.dart) + TS tiplar (scenario.g.ts)
    ↓
Kontent muallifi ssenariy yozadi (content/sc-XXXX.json)
    ↓ validate.js
Schema + Semantic tekshiruv
    ↓ sync_content.js + sync_engine.js
Barcha platformalarga tarqatiladi
```

### Runtime oqimi:

```
Foydalanuvchi → Web/Mobile ilova
    ↓
GET /api/scenarios → ssenariy JSON oladi
    ↓
ScenarioPlayer yuklaydi
    ↓
window.__yhqEngine.sceneInfo(json) → duration + outcomes
    ↓
Animatsiya boshlanadi (requestAnimationFrame)
    ↓
Har kadrda: optionFrame(json, option, time) → Display List
    ↓
renderer.mjs → Canvas 2D ga chizadi
    ↓
Foydalanuvchi javob tanlaydi
    ↓
Engine outcome hisoblaydi → Natija ko'rsatiladi
    ↓
POST /api/progress/:userId/answer → DB ga yoziladi
```

---

## 14. API Endpoint Hujjati

### Sog'liqni Tekshirish

```http
GET /api/health
→ { "status": "ok", "engine": "0.1.0", "scenarios": 20 }
```

### Ssenariylar

```http
GET /api/scenarios
GET /api/scenarios?topic=signs
GET /api/scenarios?type=crossroads_4way
→ [{ "id": "sc-0001", "topic": "...", "type": "..." }, ...]

GET /api/scenarios/sc-0001
→ { "id": "sc-0001", "scene": {...}, "actors": [...], "question": {...} }

GET /api/scenarios/sc-0001/info
→ { "duration": 5.0, "options": { "o1": { "clean": true }, "o2": { "clean": false, "type": "collision" } } }

GET /api/scenarios/sc-0001/frame?t=2.5&option=o2
→ { "canvas": 1000, "ops": [{ "op": "fillPolygon", ... }, ...] }
```

### Darsliklar

```http
GET /api/lessons
→ [{ "id": "lesson-xxx", "title": "...", "description": "..." }, ...]

GET /api/lessons/lesson-xxx
→ { "id": "...", "title": "...", "sections": [...] }
```

### Progress

```http
GET /api/progress/user-web
→ { "total": 50, "correct": 42, "wrong": 8, "answers": [...] }

POST /api/progress/user-web/answer
Body: { "scenarioId": "sc-0001", "optionId": "o1" }
→ { "ok": true, "correct": true, "outcome": { "clean": true } }
```

### Imtihon

```http
GET /api/exams/generate
→ { "scenarios": [...20 ta random ssenariy...] }

POST /api/exams/user-web/submit
Body: { "answers": [{ "scenarioId": "sc-0001", "optionId": "o1" }, ...] }
→ { "score": 18, "total": 20, "passed": true, "results": [...] }
```

### Admin

```http
POST /api/admin/scenarios
Body: { "id": "sc-0021", "scene": {...}, ... }
→ { "ok": true, "scenario": {...} }

DELETE /api/admin/scenarios/sc-0021
→ { "ok": true }

POST /api/admin/lessons
Body: { "title": "...", "description": "...", ... }
→ { "ok": true, "lesson": {...} }

DELETE /api/admin/lessons/lesson-xxx
→ { "ok": true }

GET /api/admin/validate
→ { "files": 20, "errors": 0, "warnings": 112, "details": [...] }

GET /api/admin/stats
→ { "scenarios": 20, "lessons": 4, "users": 5, "answers": 150 }
```

---

## 15. Ishga Tushirish Buyruqlari

### Talablar

| Dastur | Versiya | Kerak? |
|--------|---------|--------|
| Node.js | ≥ 20 | ✅ Shart |
| npm | ≥ 9 | ✅ Shart |
| Dart SDK | ≥ 3.5 | ⬜ Faqat engine test uchun |
| Flutter SDK | ≥ 3.0 | ⬜ Faqat frontend/app uchun |

### Qadam-baqadam

```bash
# ──────────────────────────────────────────────
# 1. O'rnatish
# ──────────────────────────────────────────────
npm install

# ──────────────────────────────────────────────
# 2. Kod generatsiya va sinxronizatsiya
# ──────────────────────────────────────────────
node tools/codegen.js           # Schema → Dart + TS tiplar
node tools/validate.js content  # Ssenariylarni tekshirish
node tools/sync_content.js      # Kontentni tarqatish
node tools/sync_engine.js       # Engine-ni tarqatish

# ──────────────────────────────────────────────
# 3. Backend serverni ishga tushirish
# ──────────────────────────────────────────────
cd backend/server
node src/index.mjs
# Server: http://localhost:4000
# Health: http://localhost:4000/api/health

# ──────────────────────────────────────────────
# 4. Web frontendni ishga tushirish (yangi terminal)
# ──────────────────────────────────────────────
cd frontend/web
npx vite --port 3000
# Ilova: http://localhost:3000

# ──────────────────────────────────────────────
# 5. Mobile ilovani ishga tushirish (yangi terminal)
# ──────────────────────────────────────────────
cd frontend/mobile
npx expo start
# Expo Go ilovasi bilan QR skanerlab sinash

# ──────────────────────────────────────────────
# 6. Dart engine testlari (ixtiyoriy — Dart SDK kerak)
# ──────────────────────────────────────────────
cd engine_dart
dart pub get
dart test
```

---

## 16. Test va Tekshirish

### Backend Unit Tests — 4 ta

```bash
npm test --workspace @yhq/server
```

| # | Test | Tekshiradi |
|---|------|------------|
| 1 | Engine sc-0001 classify | o1 = clean, o2 = collision |
| 2 | EngineError on bad option | Noto'g'ri option → EngineError (422) |
| 3 | Frame at t=0 | Display list qaytaradi (ops[] bo'sh emas) |
| 4 | Concurrent saveAnswer | 20 parallel yozish → hammasi saqlanadi |

### Dart Engine Tests — 13 ta

```bash
cd engine_dart && dart pub get && dart test
```

| # | Test | Tekshiradi |
|---|------|------------|
| 1 | geom_test | Vec2 arifmetika, OBB collision |
| 2 | layout_test | Yo'l layout, yo'lak pozitsiyalari |
| 3 | trajectory_test | Bézier traektoriya (9.2 KB) |
| 4 | choreography_test | Actor ketma-ketligi |
| 5 | simulation_test | 60 FPS tik-tik simulyatsiya |
| 6 | motion_profile_test | Tezlik profillari |
| 7 | playback_test | Preview/user/correct rejimlar |
| 8 | outcome_test | 6 ta natija klassifikator |
| 9 | palette_test | Rang to'g'riligi |
| 10 | purity_test | Flutter import YO'QLIGINI tekshirish |
| 11 | roundtrip_test | JSON encode→decode fixpoint |
| 12 | snapshot_test | Golden pixel solishtirish |
| 13 | motion_golden_test | Harakat golden snapshot |

### Content Validation

```bash
node tools/validate.js content
# Natija: 20 file(s), 0 error(s), 112 warning(s)
```

---

## 17. Loyiha Fazalari

| Faza | Holat | Tavsif |
|------|-------|--------|
| **Phase 0** — Asos | ✅ Tugallangan | Schema, codegen, validator, CI |
| **Phase 1** — Statik renderer | ✅ Tugallangan | Layout, yo'l/belgi chizish, t=0 kadr |
| **Phase 2** — Harakat | 🔶 Jarayonda | Trajectory, choreography, playback |
| **Phase 3** — Collision | ⬜ Kutilmoqda | OBB collision, 6 ta natija |
| **Phase 4** — Playback rejimlar | ⬜ | user_answer, correct_answer, compare |
| **Phase 5** — Scene turlari | ⬜ | t_junction, roundabout, va boshqalar |
| **Phase 6** — Content editor | ⬜ | React form-based editor |
| **Phase 7** — App shell | ⬜ | Auth, offline sync, progress |
| **Phase 8** — Learning features | ⬜ | FSRS spaced repetition, exam simulator |
| **Phase 9** — Lokalizatsiya | ⬜ | uz, ru, en, uz-Cyrl |
| **Phase 10** — Monetizatsiya | ⬜ | Payme + Click, paywall |

---

*Ushbu hujjat loyihaning to'liq arxitekturasi, har bir modul va faylning vazifasi,
barcha API endpointlari, ishga tushirish va test qilish qo'llanmasini o'z ichiga oladi.*

*Oxirgi yangilanish: 2026-07-22*
