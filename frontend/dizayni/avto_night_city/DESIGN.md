---
name: AVTO Night City
colors:
  surface: '#081425'
  surface-dim: '#081425'
  surface-bright: '#2f3a4c'
  surface-container-lowest: '#040e1f'
  surface-container-low: '#111c2d'
  surface-container: '#152031'
  surface-container-high: '#1f2a3c'
  surface-container-highest: '#2a3548'
  on-surface: '#d8e3fb'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#d8e3fb'
  inverse-on-surface: '#263143'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#d0bcff'
  on-tertiary: '#3c0091'
  tertiary-container: '#a078ff'
  on-tertiary-container: '#340080'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#081425'
  on-background: '#d8e3fb'
  surface-variant: '#2a3548'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  mono-timer:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system for this platform is built on a "Night City" aesthetic, blending tech-minimalism with a high-performance automotive feel. The target audience is modern learners who value efficiency and a futuristic, digital-first experience.

The visual direction utilizes a "Deep Tech" variant of Glassmorphism. UI elements should appear as projected interfaces or HUD (Heads-Up Display) layers floating over a deep, multi-layered dark background. The emotional response should be one of focus, precision, and technological sophistication. High-contrast neon accents provide functional signposting while maintaining an immersive, dark-mode-first environment.

## Colors
The palette is rooted in a deep-space obsidian base to minimize eye strain during long study sessions.

- **Background Layers:** Use `#0b0f19` for the primary canvas. Use `#151c2c` for elevated containers and `#1e293b` for strokes or subtle section dividers.
- **Accents:** The Primary Blue (`#3b82f6`) and Secondary Cyan (`#06b6d4`) should be used in gradients (45-degree angle) for high-impact areas like progress bars and primary actions.
- **Premium:** Use the Violet (`#8b5cf6`) sparingly for advanced courses or "Pro" features to create a distinct tier of value.
- **Functional Colors:** Success, Error, and Warning colors must maintain high saturation to "pop" against the dark background, ensuring immediate legibility of exam results and alerts.

## Typography
The typography strategy contrasts the geometric, aggressive structure of **Outfit** for headings with the warmth and high legibility of **Plus Jakarta Sans** for body content.

- **Headings:** Should always be bold to anchor the page. Use negative letter spacing on larger displays to enhance the "tech" feel.
- **Body:** Maintain generous line height (1.5x+) to ensure readability against the dark background.
- **Data/Timers:** For exam timers and HUD elements, use **Outfit** with increased letter spacing to mimic digital instrument clusters.

## Layout & Spacing
This design system uses a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **The HUD Philosophy:** Align elements to a strict 4px baseline grid. Use generous margins (`40px`+) on desktop to allow the background gradients to breathe, creating a sense of depth.
- **Groupings:** Use "stack" variables to maintain vertical rhythm. `stack-lg` should separate major sections, while `stack-sm` is reserved for related label/input pairs.
- **Component Padding:** Elements like cards and modals should use `24px` internal padding to ensure content doesn't feel cramped against the glassmorphic edges.

## Elevation & Depth
Depth is not communicated through traditional drop shadows, but through **Tonal Luminance** and **Backdrop Blurs**.

- **Surface Level 0:** The deepest background (`#0b0f19`).
- **Surface Level 1 (Cards/Panels):** Use a semi-transparent fill (`rgba(21, 28, 44, 0.6)`) with a `backdrop-filter: blur(12px)`. Add a 1px border using `rgba(255, 255, 255, 0.1)` to define the edge.
- **Surface Level 2 (Modals/Popovers):** Higher transparency (`rgba(30, 41, 59, 0.8)`) with a more aggressive blur (`24px`).
- **Glow Effects:** Interactive elements (buttons, active progress steps) should emit a soft outer glow (`box-shadow: 0 0 15px rgba(59, 130, 246, 0.4)`) only when focused or hovered, simulating a light source being activated.

## Shapes
The shape language is "Squircle-Tech." 

- **Primary Radius:** Use `0.5rem` (8px) for standard buttons and input fields.
- **Container Radius:** Use `1rem` (16px) for cards and main dashboard panels.
- **HUD Elements:** Specific decorative borders for "Animation Areas" or "Camera Feeds" should use clipped corners or 1px accent lines that don't fully enclose the box, creating a technical, non-standard frame.

## Components
- **Tech Buttons:** Primary buttons use a linear gradient from Primary to Secondary. On hover, the button scales slightly (1.02x) and triggers the colored glow shadow. Text should be high-contrast white.
- **HUD Input Fields:** Background should be a darker shade than the card it sits on. Use a 1px bottom-only border or a very subtle ghost outline that glows Cyan when focused.
- **Progress Indicators:** Use thick, segmented bars for a "loading" or "status" feel. Active segments should use the Primary-to-Secondary gradient.
- **Exam Timers:** Encapsulate in a "pill" or "circle" with a persistent low-opacity glow. As the time nears expiration, the glow should transition from Cyan to Error Red.
- **Chips/Badges:** Small, high-radius (pill) shapes with a low-opacity tint of the accent color (e.g., 10% Cyan background with 100% Cyan text).
- **HUD Animation Borders:** Use `::before` and `::after` pseudo-elements to create L-shaped corner brackets around video or simulation areas, colored in Secondary Cyan.