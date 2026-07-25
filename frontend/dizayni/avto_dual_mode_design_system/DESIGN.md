---
name: AVTO Dual-Mode Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d8d9e3'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fd'
  surface-container: '#ecedf7'
  surface-container-high: '#e6e7f2'
  surface-container-highest: '#e1e2ec'
  on-surface: '#191b23'
  on-surface-variant: '#424754'
  inverse-surface: '#2e3038'
  inverse-on-surface: '#eff0fa'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#6750a4'
  on-secondary: '#ffffff'
  secondary-container: '#bba2fd'
  on-secondary-container: '#4b3486'
  tertiary: '#924700'
  on-tertiary: '#ffffff'
  tertiary-container: '#b75b00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cfbcff'
  on-secondary-fixed: '#22005d'
  on-secondary-fixed-variant: '#4f378a'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#f9f9ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ec'
typography:
  h1:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h1-mobile:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  h3:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  hud-data:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style
The design system bridges the gap between a high-tech automotive interface and an immersive educational platform. It centers on an "Edutainment HUD" aesthetic—highly functional, data-rich, yet visually stimulating to maintain user engagement during long learning sessions.

The system utilizes a **Dual-Mode Glassmorphism** approach:
- **Night City (Dark):** An immersive, high-contrast environment utilizing deep obsidian backgrounds and neon accents to reduce eye strain and emphasize futuristic simulation.
- **Day Drive (Light):** A crisp, airy, and professional environment that maintains the HUD structure but swaps glows for soft depth and clarity.

The target audience consists of modern learners and technical enthusiasts who value precision, futuristic aesthetics, and a sense of "operating" a platform rather than just consuming content.

## Colors
This design system operates on a rigorous dual-palette logic.

**Night City (Dark Mode)** is the primary "Power User" mode. It uses `#0b0f19` as the foundation. Interaction points are highlighted with a neon `#3b82f6` that features a diffused outer glow. Surfaces use semi-transparent dark fills to create a "layered glass" effect.

**Day Drive (Light Mode)** shifts to a "Focus" environment. The background is a clean, warm-tinted `#fdf7ff`. It replaces aggressive glows with soft shadows and utilizes `#6750A4` as a secondary accent to provide a more academic, professional feel while keeping `#3b82f6` for primary actions.

## Typography
The typography strategy separates **Impact** from **Utility**.

- **Outfit** is used for all headlines and display text. Its geometric, wide characters evoke a sense of modern engineering and forward momentum. Use tighter letter-spacing for larger headers to maintain a "locked-in" HUD look.
- **Plus Jakarta Sans** handles all body copy, inputs, and data labels. Its high x-height and friendly curves ensure readability during long technical reading sessions.
- **Labels:** Use the `label-caps` style for section headers and technical metadata to reinforce the dashboard aesthetic.

## Layout & Spacing
The layout follows a **Hybrid HUD Grid**. It uses a 12-column system for desktop but prioritizes "Widgetized" containers.

- **The Scenario Player:** Takes center stage with a fixed aspect ratio (16:9 or 21:9), surrounded by floating glass utility panels.
- **Margins:** Desktop uses a generous 40px margin, while mobile drops to 16px to maximize screen real estate for the simulation.
- **Rhythm:** An 8px base grid governs all padding and margins. Use `md (24px)` for internal card padding and `lg (40px)` for vertical section spacing.

## Elevation & Depth
Depth is the primary differentiator between the two modes:

**Night City (Dark):** 
- Uses **Backdrop Blur (12px - 20px)** and 1px borders (rgba 255, 255, 255, 0.1). 
- Elevation is shown via **Inner Glows** and increasing the brightness of the surface fill. 
- Shadowing is minimal; instead, use "Outer Glows" (blur: 15px, spread: -2) for active/primary elements.

**Day Drive (Light):**
- Uses **Soft Ambient Shadows**. Avoid heavy black shadows; use tinted shadows (e.g., `#6750A4` at 5% opacity).
- Surfaces use a subtle 1px border (`#e2e8f0`).
- Backdrop blur is reduced (4px - 8px) to maintain clarity against the light background.

## Shapes
The design system uses a consistent **Large-Round** language to soften the "technical" nature of the HUD, making it feel more like a premium consumer product.

- **Cards & Scenario Player:** Use an 18-20px radius. This "Round Eight" approach ensures that even dense data-grids feel approachable.
- **Buttons:** Slightly sharper at 12px to denote interactivity and precision.
- **Interactive States:** On hover, shapes should not change radius, but borders should "pulse" or thicken slightly to indicate focus.

## Components
Consistent implementation of these core components is vital for the edutainment experience:

- **Buttons:** 
  - *Primary:* Solid `#3b82f6` with white text. In Dark Mode, add a subtle blue drop-shadow glow. 
  - *Secondary:* Ghost style with 1px border. In Light Mode, use `#6750A4` for the border and text.
- **HUD Chips:** Used for status (e.g., "In Progress," "Completed"). Small, caps-lock text with a semi-transparent background fill of the status color.
- **Scenario Cards:** 18px radius. Must include a "Glass Header" that stays frosted-fixed at the top of the card during scroll.
- **Input Fields:** Minimalist. Underline style or very light 4-sided borders. Active state triggers a 2px bottom border in Primary Blue.
- **Progress Bars:** Thin (4px - 6px), with a glowing "lead" point in Dark Mode. In Light Mode, use a solid dual-tone (Secondary color for background, Primary for fill).