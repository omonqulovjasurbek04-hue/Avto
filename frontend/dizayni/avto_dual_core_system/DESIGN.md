---
name: AVTO Dual-Core System
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded8e0'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f2fa'
  surface-container: '#f2ecf4'
  surface-container-high: '#ece6ee'
  surface-container-highest: '#e6e0e9'
  on-surface: '#1d1b20'
  on-surface-variant: '#494551'
  inverse-surface: '#322f35'
  inverse-on-surface: '#f5eff7'
  outline: '#7a7582'
  outline-variant: '#cbc4d2'
  surface-tint: '#6750a4'
  primary: '#4f378a'
  on-primary: '#ffffff'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#cfbcff'
  secondary: '#63597c'
  on-secondary: '#ffffff'
  secondary-container: '#e1d4fd'
  on-secondary-container: '#645a7d'
  tertiary: '#765b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#fdf7ff'
  on-background: '#1d1b20'
  surface-variant: '#e6e0e9'
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
  label-caps:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The brand personality is "Techno-Optimism." It bridges the gap between high-performance technical utility and engaging edutainment. The system must feel as precise as a dashboard but as immersive as a simulator.

The design style is **Hybrid Corporate-Futurism**. 
- **Day Mode (Operational):** Utilizes a "High-Contrast Modern" aesthetic. It emphasizes clarity, productivity, and professional trust using clean surfaces and structured whitespace.
- **Night Mode (Entertainment):** Transitions into "Cyber-Glassmorphism." It uses deep-space blacks, vibrant neon accents, and backdrop blurs to create an immersive, low-light environment suitable for focused, late-night learning or entertainment.

The emotional response should be one of "Adaptive Intelligence"—a UI that transforms its soul based on the user's environment without losing its structural integrity.

## Colors

This design system utilizes a semantic color mapping to ensure seamless toggling.

- **Primary (#2563EB / #3B82F6):** The "Engine Blue." Used for main actions, progress indicators, and active states. In Night Mode, the blue shifts to a slightly higher luminosity to maintain accessibility against dark backgrounds.
- **Secondary (#0D9488 / #14B8A6):** The "Data Teal." Used for success states, secondary highlights, and specialized HUD elements.
- **Surface Hierarchy:** 
    - `Surface` is the base canvas.
    - `Surface-variant` is for cards, navigation sidebars, and nested containers.
- **Contrast Strategy:** Day mode relies on value contrast (light vs. dark text), while Night mode utilizes "Glow contrast" where neon accents guide the eye through a low-luminance field.

## Typography

The typography strategy pairs the geometric precision of **Outfit** for headings and UI controls with the humanist warmth and legibility of **Plus Jakarta Sans** for long-form content.

- **Headlines:** Use Outfit with tight letter-spacing to create a "technical-bold" look.
- **Body:** Use Plus Jakarta Sans for high readability in both light and dark modes. Ensure line height is generous (1.5x+) to prevent text "vibration" in Night Mode.
- **Labels:** Small caps with tracked-out spacing (Label-caps) should be used for HUD elements, table headers, and metadata to reinforce the edutainment/dashboard aesthetic.

## Layout & Spacing

This design system employs a **4px baseline grid** to ensure mathematical harmony in technical components.

- **Grid Model:** 12-column fluid grid for desktop, 6-column for tablet, and 2-column for mobile.
- **Margins:** 24px fixed margins on mobile to ensure content does not hit screen edges; 40px+ on desktop to allow the "HUD" elements to breathe.
- **Reflow Rules:** In Night Mode, spacing between cards should be increased slightly or defined by borders rather than shadows to prevent visual "bleeding" of glowing elements.

## Elevation & Depth

Visual hierarchy is expressed differently depending on the active mode:

- **Day Mode (Tonal Layering):** Uses soft, neutral shadows (e.g., `0 4px 6px -1px rgba(15, 23, 42, 0.1)`) to lift cards from the surface. Surface-variant provides subtle background differentiation.
- **Night Mode (Luminescent Depth):** Shadows are replaced by **Backdrop Blurs (12px - 20px)** and **Inner Glows**. Cards should have a 1px border at 10-15% opacity to define their edges against the deep background.
- **Z-Axis:** 
    - Level 0: Background Surface.
    - Level 1: Content Cards / Modules.
    - Level 2: HUD Overlays / Navigation Bars.
    - Level 3: Modals / Tooltips (highest blur and contrast).

## Shapes

The shape language is **"Refined-Geometric."** 

- Base components (buttons, input fields) use `0.5rem` (8px) corners.
- Large containers and HUD modules use `rounded-lg` (16px) or `rounded-xl` (24px) to soften the technical edge.
- **Interactive States:** Use "squircle" inspirations for Night Mode icons to make them feel more organic and touch-friendly within the futuristic aesthetic.

## Components

### Buttons
- **Primary:** Solid fill. Day: Blue with white text. Night: Blue with a subtle outer glow on hover.
- **Secondary:** Outlined. Day: Blue border. Night: Teal border with 10% fill opacity.
- **HUD Toggle:** A specialized component that uses a monospaced "Label-caps" font to switch between system views.

### Cards
- **Day Mode:** White background, 1px grey border, soft shadow.
- **Night Mode:** Semi-transparent Navy (#161B2E at 80%), backdrop-blur (16px), 1px border (#1E293B).

### HUD Elements (Heads-Up Display)
- Technical readouts should use `label-caps`. 
- Incorporate "corner-bracket" styling for high-priority data modules in Night Mode to emphasize the simulator vibe.

### Input Fields
- Day: White background with a distinct 1px border that turns Blue on focus.
- Night: Dark background with a "Glow Focus" state where the border and a subtle box-shadow use the Primary Blue or Secondary Teal.

### Progress Indicators
- Use segmented bars rather than smooth fills to reinforce the technical/automotive "AVTO" theme.