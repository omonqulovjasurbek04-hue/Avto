---
name: AVTO High-Tech Education
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
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
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
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2.5rem
  xl: 4rem
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is built for a high-tech "Edutainment" experience, blending the precision of a modern SaaS platform with the immersive energy of a gaming interface. It targets a modern audience of learners who value efficiency, clarity, and a sense of "future-forward" progression.

The style is defined as **High-Tech Minimalism with Glassmorphism**. It utilizes depth, motion, and subtle 3D effects to make digital learning feel tactile and premium. The interface should evoke a sense of digital intelligence—using "glow" states and "translateZ" depth to signify interaction and hierarchy.

## Colors
This design system utilizes a dual-mode palette with a "Dark First" philosophy. 

**Dark Mode (Default):** Uses deep navy and slate tones to create a high-contrast environment where vibrant Primary Blue, Cyan, and Premium Purple accents "glow." Surface levels are defined by hex steps that increase in lightness as they rise in elevation.

**Light Mode:** Shifts to a crisp, airy aesthetic. The primary blue is darkened slightly for better accessibility against white backgrounds, and the neutral palette moves to soft, cool grays.

**Functional Accents:**
- **Cyan:** Used for secondary actions and progress indicators.
- **Premium Purple:** Reserved for "Level Up," gamification, or achievement-based UI moments.

## Typography
The typography strategy pairings high-energy geometric sans-serifs for a modern, approachable feel.

- **Headings (Outfit):** Set with tight tracking and bold weights to command attention. This font embodies the "High-tech" aspect of the brand.
- **Body & UI (Plus Jakarta Sans):** Chosen for its exceptional legibility and soft, friendly terminal curves. It balances the technical feel of Outfit with an approachable, educational warmth.

**Scaling:** On mobile, display and large headline sizes should be reduced by roughly 15-20% to maintain optical balance.

## Layout & Spacing
The layout follows a **Fluid Grid** system based on an 8px base unit. 

- **Desktop:** 12-column grid with 24px gutters and 40px margins.
- **Tablet:** 8-column grid with 24px gutters and 24px margins.
- **Mobile:** 4-column grid with 16px gutters and 16px margins.

Spacing should prioritize vertical whitespace to allow the 3D "tilt" effects and shadows enough room to breathe without overlapping adjacent content. Content sections are typically separated by `xl` spacing units to reinforce the minimalist philosophy.

## Elevation & Depth
Elevation is the core differentiator of this design system. It is achieved through three primary techniques:

1.  **Glassmorphism:** Surface containers use semi-transparent backgrounds with a `backdrop-filter: blur(12px)`. In Dark Mode, these are tinted with a white or blue overlay at 5-10% opacity.
2.  **3D Tilt & Z-Depth:** Primary interactive cards utilize a `rotateX/Y` tilt of 6-8 degrees on hover, driven by mouse position. Internal elements (like icons or call-to-action buttons) should use `translateZ(20px)` to appear as if floating above the card surface.
3.  **Glow Shadows:** Instead of traditional black shadows, use tinted "glow" shadows. In Dark Mode, shadows use the primary color (Blue/Cyan) at low opacity (20%) with a large blur radius (30px-40px).

## Shapes
The design system uses a **Rounded** shape language to maintain a friendly, approachable edutainment feel. 

- **Standard Elements:** Buttons, inputs, and small widgets use a `0.5rem` radius.
- **Containers:** Main cards and feature sections use `1rem` (rounded-lg) to `1.5rem` (rounded-xl) to emphasize the soft, modern aesthetic.
- **Interactive States:** Avoid sharp corners entirely to ensure the 3D tilt effects feel smooth and organic.

## Components
Consistent behavior and styling across these components reinforce the high-tech narrative:

- **Buttons:** 
  - *Standard:* Solid background with a subtle inner glow. Hover triggers `scale(1.02)` and an intensified outer glow. Active state triggers `scale(0.98)`.
  - *Ghost:* Transparent with a thin border. Hover fills the background with a 10% primary tint.
- **Cards:** The hallmark component. Must include mouse-tracking 3D tilt. Content inside should be layered using CSS `transform-style: preserve-3d`.
- **Nav Links:** Links do not use standard underlines. On hover/active, a sliding underline animation (expanding from center or sliding from the previous link) should be used.
- **Inputs:** Utilize **Floating Labels** that shrink and move to the top-left on focus. Focus is indicated by a 2px bottom-line expansion in the Primary color and a subtle glow.
- **Chips/Badges:** Use high-contrast backgrounds with white text. For premium status, use a gradient background (Blue to Purple).
- **Progress Bars:** High-glow Cyan fill with a subtle "scanning" light animation moving across the bar to indicate active learning.