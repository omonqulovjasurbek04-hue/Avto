# AVTO (YHQ) — Interaktiv Yo'l Harakati Qoidalari Platformasi

**AVTO (YHQ)** — O'zbekiston Yo'l Harakati Qoidalari (YHQ) va haydovchilik imtihonlariga tayyorlanish uchun mo'ljallangan full-stack interaktiv platforma. Web va Mobil ilovalarda interaktiv animatsiyalar, mavzulaashtirilgan mashqlar, imtihon simulyatsiyasi hamda batafsil tahlillar taqdim etiladi.

---

## 🏗️ Loyiha Strukturasi (Monorepo)

Loyiha `npm workspaces` asosida monorepo strukturasida tashkil etilgan:

```
Avto/
├── backend/            # Express REST API (Node.js ESM, PostgreSQL + Prisma, JWT, Zod)
│   ├── src/            # Backend manba kodlari (routes, services, middleware, config)
│   ├── prisma/         # Prisma DB schema & seed skriptlari
│   └── .env.example    # Backend muhit o'zgaruvchilari namunasi
├── frontend/           # Next.js 14 Web ilovasi (App Router, Tailwind CSS, Lucide React)
│   ├── src/app/        # Sahifalar va marshrutlar (Home, Practice, Exam, Analytics, Admin)
│   └── src/components/ # Interaktiv komponentlar (VideoPlayer, PracticeCard, vs.)
├── mobile/             # Expo + React Native mobil ilovasi
│   ├── App.js          # Asosiy mobil navigatsiya va ekran joylashuvi
│   └── src/            # Mobil ekranlar (HomeScreen, PracticeScreen, ExamScreen, ResultScreen)
├── docs/               # Loyiha hujjatlari va yo'riqnomalar
├── run.bat             # Windows uchun qulay bitta bosishli boshqaruv paneli
├── package.json        # Root workspace sozlamalari va umumiy skriptlar
└── .gitignore          # Maxfiy va vaqtinchalik fayllarni istisno qilish
```

---

## ⚡ Texnologiyalar Steki

| Qatlam | Texnologiyalar |
|---|---|
| **Backend** | Node.js (ESM), Express.js, PostgreSQL, Prisma ORM, JWT Auth, Zod Validation, Rate Limiting |
| **Web Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons |
| **Mobil Ilova** | React Native, Expo, Status Bar, Vector Icons |
| **Ma'lumotlar Bazasi** | PostgreSQL (Prisma ORM orqali), dev.db tayyorgarligi |

---

## 🚀 Ishga Tushirish Yo'riqnomasi

### Windows Foydalanuvchilari Uchun (Tavsiya etiladi)

Loyiha ildizidagi `run.bat` faylini ikki marta bosing. Ochilgan menyu orqali:
1. **[1] Backend-ni birinchi marta sozlash** (`npm install`, `.env`, `prisma generate`, `prisma db push`, `db:seed`)
2. **[2] Backend-ni ishga tushirish** (Port: `4000`)
3. **[3] Frontend-ni ishga tushirish** (Port: `3000`)
4. **[4] Mobile (Expo)-ni ishga tushirish**
5. **[5] Barcha qismlarni bir vaqtda alohida oynalarda ishga tushirish**

---

### Qo'lda Sozlash va Ishga Tushirish

#### 1. Node Paketlarini O'rnatish
```bash
npm install
```

#### 2. Backend Sozlash
```bash
cd backend
cp .env.example .env
# .env faylida DATABASE_URL va JWT_SECRET larini sozlang

# Prisma Client generatsiya qilish va bazani yangilash
npm run db:generate
npm run db:push
npm run db:seed

# Backend-ni dev rejimida ishga tushirish (Port: 4000)
npm run dev
```

#### 3. Frontend Web Ilovasini Ishga Tushirish
```bash
# Ildiz papkadan:
npm run dev:web

# Yoki frontend papkasidan:
cd frontend
npm run dev
```
Brauzerda [http://localhost:3000](http://localhost:3000) manzilini oching.

#### 4. Frontend Ilovasini Build Qilish va Tekshirish
```bash
npm run build --workspace @yhq/web
```

#### 5. Mobil (Expo) Ilovasini Ishga Tushirish
```bash
cd mobile
npm start
```

---

## 🔑 Muhit O'zgaruvchilari (Environment Variables)

Backend uchun `backend/.env` faylida quyidagi kalitlar sozlanadi:

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=your-secure-random-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://postgres:password@localhost:5432/avto_db?schema=public
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 📄 Litsenziya va Mualliflik

© 2026 AVTO (YHQ) Platform. Barcha huquqlar himoyalangan.
