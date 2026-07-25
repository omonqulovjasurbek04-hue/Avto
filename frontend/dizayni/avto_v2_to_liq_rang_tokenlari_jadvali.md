# AVTO (YHQ) v2 — Rang Tokenlari va CSS Spetsifikatsiyasi (Full Table)

Ushbu jadval Kunduzgi (Light) va Kechki (Dark) rejimlar uchun barcha vizual o'zgaruvchilarni, shuningdek interaktiv holatlar (states) va 3D UI effektlari uchun texnik qiymatlarni belgilaydi.

## 1. Global Rang Tokenlari (CSS Variables)

| O'zgaruvchi (Variable) | Kechki Rejim (Dark - Default) | Kunduzgi Rejim (Light) | Tavsif |
| :--- | :--- | :--- | :--- |
| `--bg-main` | `#0b0f19` | `#f8fafc` | Asosiy fon qatlami |
| `--bg-surface` | `#151c2c` | `#eef2f7` | Ikkinchi darajali fon (kartochkalar) |
| `--bg-surface-high` | `#1e293b` | `#e2e8f0` | Yuqori darajali fon (hover holatlari) |
| `--text-primary` | `#ffffff` | `#0f172a` | Asosiy matn rangi |
| `--text-secondary` | `#94a3b8` | `#475569` | Ikkinchi darajali matn |
| `--accent-primary` | `#3b82f6` | `#2563eb` | Asosiy ko'k (CTA tugmalar) |
| `--accent-glow` | `rgba(59, 130, 246, 0.5)` | `rgba(37, 99, 235, 0.3)` | Neon nurlanish effekti |
| `--status-success` | `#10b981` | `#059669` | To'g'ri javob / Muvaffaqiyat |
| `--status-error` | `#ef4444` | `#dc2626` | Xato / To'qnashuv |
| `--status-warning` | `#f59e0b` | `#d97706` | Ogohlantirish |
| `--glass-bg` | `rgba(21, 28, 44, 0.6)` | `rgba(255, 255, 255, 0.7)` | Glassmorphism foni |
| `--glass-border` | `rgba(255, 255, 255, 0.1)` | `rgba(15, 23, 42, 0.08)` | Shaffof chegara |

## 2. 3D UI va Interaktivlik Spetsifikatsiyasi

### A. Feature Cards (3D Tilt)
- **Perspective:** `1000px`
- **Max Rotation:** `rotateX(8deg) rotateY(8deg)`
- **Internal Depth:** `translateZ(20px)` (ikonkalar uchun)
- **Transition:** `transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)`

### B. Stat Cards (Depth-In)
- **Animation:** `scale(0.95) -> scale(1)`
- **Opacity:** `0 -> 1`
- **Easing:** `cubic-bezier(0.34, 1.56, 0.64, 1)` (Spring effect)

### C. Buttons (States)
- **Hover:** `scale(1.02)`, `box-shadow: 0 0 20px var(--accent-glow)`
- **Active:** `scale(0.98)`, `transition: 100ms`
- **Disabled:** `opacity: 0.4`, `cursor: not-allowed`

### D. Mode Switch (Transition)
- **Duration:** `300ms`
- **Properties:** `all`
- **Icon Rotation:** `rotate(180deg)` (Switching between Sun/Moon)

---
*Ushbu tokenlar tizimi AVTO platformasining "High-Tech Education" ruhini barcha qurilmalarda saqlashga xizmat qiladi.*
