# AVTO (YHQ) v2 — Dizayn Tokenlari va 3D UI Spetsifikatsiyasi

Ushbu hujjat platformaning Kunduzgi (Light) va Kechki (Dark) rejimlari uchun ranglar palitrasi hamda 3D UI effektlarining texnik parametrlarini belgilaydi.

## 1. Rang Tokenlari (CSS Custom Properties)

| Token Name | Kechki Rejim (Dark - Default) | Kunduzgi Rejim (Light) | Tavsif |
| :--- | :--- | :--- | :--- |
| `--bg-main` | `#0b0f19` | `#f8fafc` | Asosiy fon rangi |
| `--bg-surface` | `#151c2c` | `#ffffff` | Kartochkalar va panellar foni |
| `--text-primary` | `#ffffff` | `#0f172a` | Asosiy matn va sarlavhalar |
| `--text-secondary` | `#94a3b8` | `#475569` | Ikkinchi darajali matnlar |
| `--primary-accent` | `#3b82f6` | `#2563eb` | Ko'k accent (tugmalar, linklar) |
| `--success` | `#10b981` | `#059669` | To'g'ri javob, muvaffaqiyat |
| `--error` | `#ef4444` | `#dc2626` | Xato, xavf, to'qnashuv |
| `--warning` | `#f59e0b` | `#d97706` | Ogohlantirish, amber |
| `--glass-bg` | `rgba(30, 41, 59, 0.6)` | `rgba(255, 255, 255, 0.7)` | Glassmorphism foni |
| `--glass-border` | `rgba(255, 255, 255, 0.1)` | `rgba(15, 23, 42, 0.1)` | Glassmorphism chegarasi |

## 2. 3D UI Effektlar Spetsifikatsiyasi

### A. Feature Cards (Tilt Effect)
- **Perspective:** `1000px`
- **Max Rotation:** `8deg` (rotateX, rotateY)
- **Scale on Hover:** `1.02`
- **Transition:** `300ms ease-out`
- **Shadow:** `0 25px 50px -12px rgba(0, 0, 0, 0.5)`

### B. Stat Cards (Depth-In)
- **Initial State:** `scale(0.95)`, `opacity: 0`
- **Enter Animation:** `scale(1)`, `opacity: 1`
- **Duration:** `500ms`
- **Easing:** `Cubic-bezier(0.34, 1.56, 0.64, 1)`

### C. Scenario Player (Floating Panel)
- **Hover Transform:** `translateY(-4px)`
- **Border Glow:** `0 0 20px rgba(59, 130, 246, 0.3)`
- **Inner Content (Canvas):** 2D (Engine limitatsiyasi tufayli)

## 3. Interaktiv Holatlar (States)

- **Buttons:**
  - `Default`: Gradient background, rounded-full.
  - `Hover`: `scale(1.05)`, glow shadow.
  - `Active`: `scale(0.95)`, instant transition.
- **Inputs:**
  - `Focus`: Bottom border width `2px`, color `--primary-accent`.
  - `Floating Label`: `translateY(-20px)`, `scale(0.85)`.

---
*Ushbu spetsifikatsiya "edutainment" tajribasini ta'minlash uchun xizmat qiladi.*