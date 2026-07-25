---
name: AVTO High-Tech Education v2
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
  secondary: '#00687a'
  on-secondary: '#ffffff'
  secondary-container: '#57dffe'
  on-secondary-container: '#006172'
  tertiary: '#6b38d4'
  on-tertiary: '#ffffff'
  tertiary-container: '#8455ef'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
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
  background: '#f9f9ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ec'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-md:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Outfit
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
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
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
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
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is engineered for a high-tech educational platform that bridges the gap between academic learning and futuristic technology. The brand personality is innovative, immersive, and high-performance, targeting tech-savvy learners who value both aesthetics and functional depth.

The visual style is **Hyper-Modern 3D Glassmorphism**. It combines the clarity of a professional SaaS tool with the immersive qualities of a high-end gaming interface. Key characteristics include:
- **3D Depth:** Elements exist in a Z-space, utilizing perspective tilts and layered elevations.
- **Glassmorphism:** Surfaces use backdrop blurs to maintain context while creating a sense of premium materiality.
- **Atmospheric Glow:** Interactive elements emit soft, colored light (neon-inspired) to signal state changes.
- **Dynamic Transitions:** A mandatory 300ms cubic-bezier transition for all state changes and theme switching to ensure a fluid, organic feel.

## Colors
The palette is built on a "Night City" foundation, optimized for long-form educational consumption in both light and dark environments.

- **Primary & Secondary:** A high-energy duo of Blue and Cyan used for primary actions and progress indicators.
- **Premium Purple:** Reserved for advanced features, certifications, and gamified achievements.
- **Semantic Colors:** Success, Error, and Warning follow industry standards but are enhanced with glow properties in dark mode.
- **Gradients:** Use linear gradients (135°) transitioning from Primary Blue to Secondary Cyan for major calls-to-action and "Premium" headings.

## Typography
The system uses a dual-font strategy to balance technical edge with readability.

- **Headings (Outfit):** A geometric sans-serif that feels engineered and precise. Large display styles should occasionally use the "gradient text" treatment (Primary to Secondary) to emphasize high-tech themes.
- **Body (Plus Jakarta Sans):** Chosen for its high x-height and open apertures, ensuring that dense educational content remains legible during long study sessions.
- **Scale:** On mobile devices, headline sizes scale down by approximately 20% to prevent excessive line-breaking, while body text remains consistent to preserve accessibility.

## Layout & Spacing
The layout follows a **Fluid-Fixed Hybrid** model.
- **Desktop:** 12-column grid with a max-width of 1440px. Content is centered with 48px side margins.
- **Tablet:** 8-column grid with 24px margins.
- **Mobile:** 4-column grid with 16px margins.

Spacing is based on a 4px base unit to allow for the precision required in technical UIs. Larger gaps (32px+) are encouraged between distinct content modules to support the "Minimalist" breathing room required for complex data.

## Elevation & Depth
This design system rejects flat design in favor of **Z-axis layering**.

1.  **Surfaces:** Use `backdrop-filter: blur(12px)` with a semi-transparent fill (80% opacity in Light, 60% in Dark).
2.  **3D Tilt:** Hero cards and interactive modules must implement a 3D perspective tilt effect on hover, with a maximum rotation of 8 degrees.
3.  **Shadows/Glows:** 
    - **Default:** Soft, diffused neutral shadows.
    - **Interactive:** Instead of traditional shadows, use "Glows" (outer glows) using the component's accent color (e.g., a Blue button emits a soft blue light).
4.  **Outlines:** Use 1px internal borders with a "glass-shine" effect (top-left white/low-opacity, bottom-right dark/low-opacity) to simulate physical thickness.

## Shapes
The shape language is "Sophisticated Rounded." 
- **Standard UI (Buttons, Inputs):** 0.5rem (8px) radius provides a modern, friendly feel without becoming overly "bubbly."
- **Large Containers (Cards, Modals):** 1rem (16px) to 1.5rem (24px) for prominent 3D elements.
- **Interactive Indicators:** Small circular elements for status pips and notification badges.

## Components

### Buttons
- **Primary:** Gradient background (Blue to Cyan). White text. High-contrast.
- **States:**
    - **Hover:** Scale 1.02, increase glow spread, brightness +10%.
    - **Active:** Scale 0.98, reduce glow.
    - **Disabled:** Opacity 0.4, grayscale filter 50%.
- **Secondary:** Transparent background with a 2px Primary Blue border.

### 3D Cards
- **Structure:** Glassmorphic background with 1px border.
- **Interaction:** On hover, apply a `perspective(1000px) rotateX(deg) rotateY(deg)` tilt (max 8 degrees). The content inside should have a slight translateZ shift to appear floating.

### Inputs
- **Style:** Inset shadow for a "carved" look. 
- **Focus:** 2px solid Primary Blue border with a soft outer glow of the same color.

### Chips/Badges
- Small, uppercase label font. Soft semi-transparent background of the semantic color (e.g., Error Red at 10% opacity) with a solid 1px border.

### Theme Switcher
- A toggle utilizing a 300ms cubic-bezier(0.4, 0, 0.2, 1) transition. Ensure all backdrop-blurs and gradients re-calculate smoothly.