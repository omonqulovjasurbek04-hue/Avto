# AVTO (YHQ) — Practice Sahifasi Dizayn Spetsifikatsiyasi

Ushbu hujjat "Practice" (Mashq) sahifasidagi asosiy komponentlarning texnik ko'rsatkichlarini belgilaydi.

## 1. Scenario Player (Canvas Frame)
Bu simulyatsiya ko'rsatiladigan asosiy maydon.
- **O'lcham:** Responsive, `aspect-ratio: 16 / 9`.
- **Border Radius:** `24px` (Katta burchaklar zamonaviy HUD hissini beradi).
- **Border:** `1px solid rgba(59, 130, 246, 0.2)` (Neon-blue chegara).
- **Shadow:** `0 20px 50px -12px rgba(0, 0, 0, 0.5)` (Chuqur soya, qatlamni ajratish uchun).
- **Overlay HUD:** Pastki qismda `backdrop-blur: 12px` bo'lgan qora shaffof panel (`height: 60px`), unda tezlik o'lchagich va vites ko'rsatkichi joylashgan.

## 2. Javob Variantlari (Option Buttons)
- **Grid Layout:** 2 ustunli to'r (Desktop), 1 ustun (Mobile).
- **Padding:** `16px 24px`.
- **Min-Height:** `72px`.
- **Background:** `rgba(255, 255, 255, 0.03)` (Glassmorphism).
- **Hover State:**
  - `Scale: 1.02`
  - `Background: rgba(59, 130, 246, 0.1)`
  - `Border-color: #3b82f6`
  - `Box-shadow: 0 0 20px rgba(59, 130, 246, 0.2)`
- **Correct State:** `Background: rgba(16, 185, 129, 0.2)`, `Border: #10b981`.
- **Wrong State:** `Background: rgba(239, 68, 68, 0.2)`, `Border: #ef4444`.

## 3. Natija Banneri (Feedback Toast)
- **Position:** Pastki o'rta qismdan `fixed` holatda chiqadi.
- **Animation:** `Slide-in from bottom` (Duration: 400ms, Easing: Cubic-bezier(0.34, 1.56, 0.64, 1)).
- **Style:** `backdrop-blur: 20px`, oq matn, chap tomonda katta ikonka (✅ yoki 💥).

## 4. Mavzu Filtrlari (Category Pills)
- **Shape:** `Rounded-full`.
- **Active State:** Gradient background (`#3b82f6` -> `#06b6d4`), oq matn.
- **Inactive State:** `border: 1px solid rgba(255, 255, 255, 0.1)`, kulrang matn.

## 5. Micro-Animations (Easing & Timing)
- **General Transitions:** `200ms ease-in-out`.
- **Stagger Load:** Elementlar `50ms` farq bilan paydo bo'ladi.
- **Button Click:** `Scale: 0.95` (Instant feedback).

---
*Ushbu spetsifikatsiya platformaning "Edutainment" (o'yin+ta'lim) ruhini saqlab qolish uchun xizmat qiladi.*