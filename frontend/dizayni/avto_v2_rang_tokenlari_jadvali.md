# AVTO (YHQ) v2 — Rang Tokenlari (Dual-Mode CSS Variables)

Ushbu jadval Kunduzgi (Light) va Kechki (Dark) rejimlar uchun asosiy rang o'zgaruvchilarini belgilaydi. 

```css
:root {
  /* --- KUNDUZGI REJIM (Light Mode) --- */
  --bg-primary: #f8fafc;
  --bg-secondary: #eef2f7;
  --bg-surface: #ffffff;
  --bg-glass: rgba(255, 255, 255, 0.7);
  
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-on-accent: #ffffff;
  
  --accent-primary: #2563eb; /* To'qroq ko'k */
  --accent-secondary: #0891b2; /* To'qroq moviy */
  --accent-success: #059669; /* To'qroq yashil */
  --accent-error: #dc2626; /* To'qroq qizil */
  --accent-warning: #d97706; /* To'qroq amber */
  
  --border-subtle: rgba(15, 23, 42, 0.1);
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --glow-accent: 0 0 15px rgba(37, 99, 235, 0.2);
}

.dark {
  /* --- KECHKI REJIM (Dark Mode) --- */
  --bg-primary: #0b0f19;
  --bg-secondary: #151c2c;
  --bg-surface: #1e293b;
  --bg-glass: rgba(11, 15, 25, 0.6);
  
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-on-accent: #ffffff;
  
  --accent-primary: #3b82f6; /* Yorqin neon ko'k */
  --accent-secondary: #06b6d4; /* Yorqin moviy */
  --accent-success: #10b981; /* Yorqin yashil */
  --accent-error: #ef4444; /* Yorqin qizil */
  --accent-warning: #f59e0b; /* Yorqin amber */
  
  --border-subtle: rgba(248, 250, 252, 0.1);
  --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.5);
  --shadow-md: 0 8px 32px rgba(0, 0, 0, 0.6);
  --glow-accent: 0 0 20px rgba(59, 130, 246, 0.4);
}
```

### Qo'llash bo'yicha ko'rsatmalar:
1. **Transitions:** Barcha rang o'zgarishlari uchun `transition: all 0.3s ease-in-out;` dan foydalaning.
2. **Glassmorphism:** `backdrop-blur: 12px; border: 1px solid var(--border-subtle);` kombinatsiyasini ishlating.
3. **3D UI:** Tilt effektlarida `var(--shadow-md)` va `var(--glow-accent)` dan foydalanib chuqurlikni oshiring.
