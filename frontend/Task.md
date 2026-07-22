# 🚗 AVTO (YHQ) — Frontend To'liq Strukturasi va Rivojlanish Rejasi

> Ushbu hujjat frontend qatlamlarining (Web + Mobile + Flutter + Editor) arxitekturasi, komponent tuzilishi, ma'lumot oqimi va bosqichma-bosqich rivojlanish rejasini belgilaydi.

---

## 1. Arxitektura Umumiy Ko'rinishi

```
┌──────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Web App     │  │  Mobile App  │  │  Flutter App │   │
│  │  (React+Vite)│  │  (Expo/RN)   │  │  (Dart)      │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │            │
│  ┌──────┴─────────────────┴─────────────────┴───────┐   │
│  │              Shared Engine (JS)                    │   │
│  │         @yhq/engine — dart2js compiled             │   │
│  └──────────────────────────────────────────────────┘   │
│         │                 │                              │
│  ┌──────┴─────────────────┴──────────────────────────┐  │
│  │           REST API (Backend Express)                │  │
│  │         /api/scenarios, /api/lessons, ...           │  │
│  └────────────────────────────────────────────────────┘  │
│         │                                                │
│  ┌──────┴────────────────────────────────────────────┐  │
│  │   Database (Postgres/JSON) + Content (/content)    │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Kataloglar Arxitekturasi

```
frontend/
├── web/                          ← React + Vite SPA
│   ├── public/
│   │   ├── engine.js             ← Dart engine JS compiled
│   │   └── content/              ← Cached scenario JSONs
│   ├── src/
│   │   ├── components/
│   │   │   ├── ScenarioPlayer.jsx    ← Canvas 2D player
│   │   │   ├── EngineProvider.jsx    ← Engine initializer
│   │   │   ├── PlaybackBar.jsx      ← Transport controls
│   │   │   ├── OptionsList.jsx      ← Answer option buttons
│   │   │   ├── OutcomeBanner.jsx    ← Result feedback overlay
│   │   │   ├── RuleExplanation.jsx  ← YHQ rule card
│   │   │   ├── LangSwitcher.jsx     ← Language toggle
│   │   │   └── LoadingSpinner.jsx   ← Shared loading state
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LessonsPage.jsx
│   │   │   ├── PracticePage.jsx
│   │   │   ├── ExamPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── hooks/
│   │   │   ├── useEngine.js       ← Engine lifecycle
│   │   │   ├── useScenarios.js    ← Scenario fetching
│   │   │   ├── useProgress.js     ← User progress
│   │   │   └── useTimer.js        ← Exam countdown
│   │   ├── services/
│   │   │   ├── api.js             ← Fetch wrapper
│   │   │   └── i18n.js            ← Translation helper
│   │   ├── context/
│   │   │   └── AppContext.jsx      ← Global state (lang)
│   │   ├── App.jsx                ← Root + routing
│   │   ├── main.jsx               ← Entry point
│   │   └── index.css              ← Design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── mobile/                       ← Expo React Native
│   ├── src/
│   │   ├── screens/
│   │   │   ├── HomeScreen.js
│   │   │   ├── PracticeScreen.js
│   │   │   ├── ExamScreen.js
│   │   │   └── StatsScreen.js
│   │   ├── components/
│   │   │   └── MobileScenarioPlayer.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── navigation/
│   │       └── TabNavigator.js
│   ├── assets/
│   ├── App.js
│   ├── app.json
│   └── package.json
│
├── app/                          ← Flutter App (Phase 7+)
│   ├── lib/
│   │   ├── main.dart
│   │   ├── scene_painter.dart
│   │   ├── app.dart
│   │   ├── database/
│   │   │   ├── database.dart
│   │   │   ├── tables/
│   │   │   │   ├── user_progress_table.dart
│   │   │   │   ├── answer_table.dart
│   │   │   │   └── exam_table.dart
│   │   │   └── daos/
│   │   │       ├── progress_dao.dart
│   │   │       └── exam_dao.dart
│   │   ├── providers/
│   │   │   ├── database_provider.dart
│   │   │   ├── scenario_provider.dart
│   │   │   └── progress_provider.dart
│   │   ├── services/
│   │   │   ├── sync_service.dart
│   │   │   ├── auth_service.dart
│   │   │   └── engine_service.dart
│   │   ├── screens/
│   │   │   ├── home/
│   │   │   ├── practice/
│   │   │   ├── exam/
│   │   │   └── analytics/
│   │   └── widgets/
│   │       ├── scenario_player.dart
│   │       └── playback_bar.dart
│   ├── assets/
│   ├── pubspec.yaml
│   └── ...
│
├── editor/                       ← React Content Editor (Phase 6)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── generated/
│   └── package.json
│
└── Task.md                       ← SHU FAYL
```

---

## 3. Komponentlar Ierarxiyasi (Web App)

```
<App>
  ├── <Header>
  │   ├── <Brand />
  │   ├── <NavTabs />
  │   └── <LangSwitcher />
  │
  └── <main>
      ├── <HomePage>
      │   ├── <HeroBanner />
      │   ├── <StatsGrid />
      │   ├── <FeatureCards />
      │   └── <TopicPills />
      │
      ├── <LessonsPage>
      │   ├── <Sidebar>
      │   │   └── <LessonItem />×N
      │   └── <LessonDetail>
      │       ├── <LessonHeader />
      │       ├── <SectionCard />×N
      │       └── <LessonCTA />
      │
      ├── <PracticePage>
      │   ├── <TopicFilter />
      │   ├── <ScenarioPills />
      │   └── <ScenarioPlayer>
      │       ├── <CanvasStage />
      │       ├── <PlaybackBar />
      │       ├── <OptionsList />
      │       │   └── <OptionButton />×N
      │       ├── <OutcomeBanner />
      │       └── <RuleExplanation />
      │
      ├── <ExamPage>
      │   ├── <ExamHeader />
      │   │   ├── <QuestionCounter />
      │   │   ├── <Timer />
      │   │   └── <SubmitButton />
      │   ├── <QuestionPalette />
      │   ├── <ScenarioPlayer />
      │   └── <ExamResult />
      │
      ├── <AnalyticsPage>
      │   ├── <StatCards />
      │   └── <AnswersTable />
      │
      └── <AdminPage>
          ├── <ScenarioManager>
          │   ├── <ScenarioTable />
          │   └── <ScenarioModal />
          ├── <LessonManager>
          │   ├── <LessonTable />
          │   └── <LessonModal />
          ├── <ValidatorPanel />
          └── <SystemStats />
```

---

## 4. Ma'lumot Oqimi (Data Flow)

```
┌──────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  React   │    │   Engine    │    │  Backend    │    │   Content   │
│  UI      │───▶│  (JS/WASM)  │───▶│  API        │───▶│  + DB       │
│          │◀───│             │◀───│  Express    │◀───│             │
└──────────┘    └─────────────┘    └─────────────┘    └─────────────┘

1. UI -> fetch('/api/scenarios') -> Backend -> content/*.json
2. User selects option -> engine.optionFrame() -> Canvas 2D
3. Answer saved -> POST /api/progress/:userId/answer -> DB
4. Statistics fetched -> GET /api/progress/:userId -> UI display
```

---

## 5. Bosqichma-bosqich Rivojlanish Rejasi

### 🟢 1-bosqich: Web App stabilizatsiyasi (Tugallangan)
- [x] React+Vite project setup (vite.config.js, package.json)
- [x] App.jsx routing (6 tab: home, lessons, practice, exam, analytics, admin)
- [x] index.css dark theme design system (942 lines)
- [x] ScenarioPlayer.jsx — Canvas 2D core (248 lines)
- [x] HomePage.jsx — hero, stats, features, topics
- [x] LessonsPage.jsx — sidebar + detail pane
- [x] PracticePage.jsx — topic filter, scenario pills, player
- [x] ExamPage.jsx — 20 questions, 20min timer, palette
- [x] AnalyticsPage.jsx — stats cards, answers table
- [x] AdminPage.jsx — CRUD tables, modals, validator

### 🟡 2-bosqich: Komponentlarni refaktor (Navbatdagi)
- [ ] EngineProvider.jsx — engine loading state management
- [ ] PlaybackBar.jsx — transport controls (▶ ⏸ scrub speed)
- [ ] OptionsList.jsx + OptionButton.jsx — answer options
- [ ] OutcomeBanner.jsx — result feedback (correct/wrong/collision)
- [ ] RuleExplanation.jsx — YHQ rule card component
- [ ] useEngine.js hook — engine lifecycle, frame requests
- [ ] useScenarios.js hook — fetch with caching
- [ ] useProgress.js hook — user progress tracking
- [ ] api.js service — centralized fetch wrapper + error handling

### 🔵 3-bosqich: Engine JS kompilyatsiyasi
- [ ] Dart SDK orqali engine_dart -> JS compile
- [ ] engine.js ni frontend/web/public/ ga nusxalash
- [ ] Engine loading indicator
- [ ] Error boundary for engine failures

### 🟣 4-bosqich: Drift SQLite (Flutter App)
- [ ] pubspec.yaml ga drift/riverpod qo'shish
- [ ] database/tables/ — UserProgress, Answer, ExamAttempt
- [ ] database/daos/ — CRUD operatsiyalar
- [ ] providers/ — Riverpod integration
- [ ] Offline sync strategiyasi

### 🟠 5-bosqich: Mobile App (Expo)
- [ ] Expo project setup
- [ ] MobileScenarioPlayer — WebView engine
- [ ] Bottom tab navigation
- [ ] API service

### 🔴 6-bosqich: Content Editor (Phase 6)
- [ ] Form-based scenario editor
- [ ] Live preview pane
- [ ] Validation warnings
- [ ] Save to Supabase

### 🟤 7-bosqich: App Shell & Learning (Phase 7-8)
- [ ] Phone OTP auth
- [ ] Topic browsing
- [ ] Offline sync (Drift ↔ Supabase)
- [ ] FSRS spaced repetition
- [ ] Mistake journal
- [ ] Weak-point map

---

## 6. Dizayn Tizimi (CSS Variables)

| Variable | Qiymati | Ishlatilishi |
|---|---|---|
| `--bg-dark` | `#0b0f19` | Body background |
| `--bg-card` | `#151c2c` | Card & container bg |
| `--bg-card-hover` | `#1e293b` | Hover state |
| `--border-color` | `#26334d` | Borders |
| `--text-main` | `#f8fafc` | Primary text |
| `--text-muted` | `#94a3b8` | Secondary text |
| `--accent-blue` | `#3b82f6` | Primary action |
| `--accent-green` | `#10b981` | Success |
| `--accent-red` | `#ef4444` | Error/collision |
| `--accent-amber` | `#f59e0b` | Warning |

---

## 7. Engine JS API

```javascript
// index.html da engine registration:
window.__engineRegister = (buildScene, buildFrame, sceneInfo, optionFrame, version) => {
  window.__yhqEngine = { buildScene, buildFrame, sceneInfo, optionFrame, version };
};

// API:
window.__yhqEngine.sceneInfo(scenarioJson)     // { duration, options: {...} }
window.__yhqEngine.buildFrame(scenarioJson, t)  // { ops: [...] }  correct answer
window.__yhqEngine.optionFrame(json, optId, t)  // { ops: [...] }  user answer
window.__yhqEngine.buildScene(scenarioJson)     // { ops: [...] }  t=0 preview
```

---

## 8. Drift SQLite Schema (Flutter)

```dart
// --- database/tables/user_progress_table.dart ---
class UserProgress extends Table {
  TextColumn get id => text()();
  IntColumn get correctAnswers => integer().withDefault(const Constant(0))();
  IntColumn get wrongAnswers => integer().withDefault(const Constant(0))();
  TextColumn get lastSyncAt => text().nullable()();
  Set<Column> get primaryKey => {id};
}

// --- database/tables/answer_table.dart ---
class Answer extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get scenarioId => text()();
  TextColumn get optionId => text()();
  BoolColumn get isCorrect => boolean()();
  TextColumn get outcomeType => text().nullable()();
  IntColumn get answeredAt => integer()();
  TextColumn get userId => text()();
}

// --- database/tables/exam_table.dart ---
class ExamAttempt extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get score => integer()();
  IntColumn get total => integer()();
  BoolColumn get passed => boolean()();
  IntColumn get durationSeconds => integer()();
  IntColumn get createdAt => integer()();
  TextColumn get userId => text()();
}
```

---

## 9. API Endpointlar

| Endpoint | Method | Izoh |
|---|---|---|
| `/api/health` | GET | Server holati |
| `/api/scenarios` | GET | Ssenariy ro'yxati |
| `/api/scenarios/:id` | GET | To'liq ssenariy JSON |
| `/api/scenarios/:id/info` | GET | Engine outcome metadata |
| `/api/scenarios/:id/frame` | GET | Yagona kadr |
| `/api/lessons` | GET | Darsliklar ro'yxati |
| `/api/lessons/:id` | GET | Darslik detallari |
| `/api/progress/:userId` | GET | Foydalanuvchi statistikasi |
| `/api/progress/:userId/answer` | POST | Javobni saqlash |
| `/api/exams/generate` | GET | 20 savolli imtihon |
| `/api/exams/:userId/submit` | POST | Imtihon topshirish |
| `/api/admin/scenarios` | POST | Ssenariy CRUD |
| `/api/admin/validate` | GET | Engine validator |
| `/api/admin/stats` | GET | Tizim statistikasi |

---

## 10. Test Strategiyasi

| Qatlam | Test turi | Asbob |
|---|---|---|
| Engine | Unit + Golden snapshot | Dart test |
| Backend API | Integration | Node --test |
| React components | Unit | Vitest + RTL |
| Flutter widgets | Widget test | Flutter test |
| E2E | Browser test | Playwright |

---

## 11. Ishlab Chiqish Buyruqlari

```bash
# Web app (frontend/web/)
npm run dev              # → localhost:3000

# Backend (backend/)
npm run dev              # → localhost:4000

# Dart engine test
cd engine_dart && dart pub get && dart test

# Dart engine → JS compile
.toolchain/dart-sdk/bin/dart.exe compile js -O2 -o frontend/web/public/engine.js web/engine_web.dart

# Schema → Dart + TS codegen
node tools/codegen.js

# Content validator
node tools/validate.js content
```
