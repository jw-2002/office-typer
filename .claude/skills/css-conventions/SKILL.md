---
name: css-conventions
description: CSS conventions for the 2D UI of this project (HUD, shop, monitor screen contents, menus). Use before writing or editing any CSS or styling for DOM components.
---

# CSS conventions

3D visuals are three.js. CSS only styles the DOM: the HUD over the canvas, menus, the shop,
and the content shown on the in-world monitor via `<Html>`.

## Structure

- **CSS Modules** per component (`Hud.module.css` beside `Hud.tsx`). No global class names
  except in `index.css`.
- `src/index.css` holds the reset, base styles and **design tokens** as custom properties on
  `:root`. Components use tokens, never hard-coded colours or spacing.
  ```css
  :root {
    --color-bg: #111827;
    --color-surface: #1f2937;
    --color-text: #e5e7eb;
    --color-accent: #f59e0b;
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 1rem;
    --space-4: 1.5rem;
    --radius: 0.5rem;
    --font-ui: system-ui, sans-serif;
    --font-mono: ui-monospace, monospace;
  }
  ```
- Inline `style` only for values that are truly dynamic (for example a progress bar width).
  Prefer a CSS custom property set inline: `style={{ '--progress': pct }}`.
- No duplicated declarations. Shared looks (panel, button) become a shared module or a token.

## Layout

- The canvas fills the viewport. HUD is a sibling positioned over it. Set
  `pointer-events: none` on the HUD container and `pointer-events: auto` only on interactive
  children, so the 3D scene stays clickable underneath.
- Use `100dvh`, not `100vh`. Use flexbox and grid. Avoid fixed pixel sizes for text.
- Units: `rem` for type and spacing, `%`/`fr`/`clamp()` for fluid sizes, `px` only for borders.
- Mobile-first with `min-width` media queries. Typing needs a physical keyboard, so the game
  should show a clear message on touch-only devices.

## The monitor screen

- Content inside `<Html transform>` is scaled by the 3D transform. Size it with a fixed
  design resolution (for example 640x400) via CSS, and let `distanceFactor`/`scale` fit it to
  the monitor. Do not rely on viewport units there.
- Match the screen's look to the computer tier (a theme class per tier that only swaps tokens).

## Accessibility

- Visible `:focus-visible` outlines. Real `<button>` elements for actions.
- Respect `prefers-reduced-motion` for UI animation.
- Sufficient contrast. Do not convey state by colour alone (for example mistyped characters
  also get an underline or icon).
- Typing UI: mark the current character, typed-correct, and mistyped text distinctly.

## Before finishing

No hard-coded colours or magic spacing outside tokens, no unused classes, and the 3D scene
still receives pointer events through the HUD.

## File header

Start every CSS file with a one-line `/* ... */` comment saying what it styles.
