# AVTO (YHQ) v2 — Rang Tokenlari va CSS Spetsifikatsiyasi

Ushbu hujjat loyihaning "Dual Mode" (Light/Dark) va 3D UI effektlari uchun texnik ko'rsatkichlarni belgilaydi.

## 1. Rang Palitrasi (Global Tokens)

| Token Ismi | Kechki (Dark - Default) | Kunduzgi (Light) | Tavsif |
| :--- | :--- | :--- | :--- |
| `--bg-main` | `#0b0f19` | `#f8fafc` | Asosiy fon qatlami |
| `--bg-surface` | `#151c2c` | `#eef2f7` | Ikkinchi darajali fon (kartochkalar) |
| `--bg-surface-high` | `#1e293b` | `#e2e8f0` | Yuqori darajali fon (hover holatlari) |
| `--text-primary` | `#ffffff` | `#0f172a` | Asosiy matn |
| `--text-secondary` | `#94a3b8` | `#475569` | Ikkinchi darajali matn |
| `--accent-blue` | `#3b82f6` | `#2563eb` | Asosiy harakatlar (Primary CTA) |
| `--accent-cyan` | `#06b6d4` | `#0891b2` | Ikkinchi darajali accent |
| `--status-success` | `#10b981` | `#059669` | To'g'ri javob / Muvaffaqiyat |
| `--status-error` | `#ef4444` | `#dc2626` | Xato / To'qnashuv |
| `--status-warning` | `#f59e0b` | `#d97706` | Ogohlantirish |
| `--glass-bg` | `rgba(21, 28, 44, 0.6)` | `rgba(255, 255, 255, 0.7)` | Glassmorphism foni |
| `--glass-border` | `rgba(255, 255, 255, 0.1)` | `rgba(15, 23, 42, 0.08)` | Shaffof chegara |

## 2. 3D UI Effektlar (CSS Spetsifikatsiyasi)

### 3D Tilt (Feature Cards)
- **Perspective:** `perspective(1000px)`
- **Hover Rotate:** `rotateX(6deg) rotateY(6deg)`
- **Hover Scale:** `scale(1.02)`
- **Transition:** `transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)`
- **Depth (Icons/Text):** `translateZ(20px)` (ichki elementlar uchun)

### Depth-In (Stat Cards)
- **Initial:** `scale(0.95)`, `opacity(0)`
- **Final:** `scale(1)`, `opacity(1)`
- **Animation:** `staggered fade-up with spring easing`

### 3D Flip (Result Banners)
- **Axis:** `rotateX`
- **Range:** `15deg` -> `0deg`
- **Duration:** `400ms`
- **Easing:** `cubic-bezier(0.34, 1.56, 0.64, 1)` (Spring/Bounce)

## 3. Elementlar Holati (States)

- **Button Hover:** `box-shadow: 0 0 20px var(--accent-glow)`
- **Input Focus:** `border-bottom: 2px solid var(--accent-blue)`, `label transform: translateY(-24px) scale(0.85)`
- **Nav Link:** `after: scaleX(0 -> 1)`, `transform-origin: left`

---
*Ushbu tokenlar tizimi AVTO platformasining professional va "edutainment" ruhini barcha qurilmalarda saqlashga xizmat qiladi.*