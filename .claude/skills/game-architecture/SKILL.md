---
name: game-architecture
description: Architecture rules for the typing idle game's rules, economy, state and persistence. Use before writing game logic, the Zustand store, upgrades/jobs data, WPM, payouts, offline progress or save/load code.
---

# Game architecture

## Layering

1. `src/game/`: pure TypeScript. Typing engine, WPM, payout, promotion, upgrade/job/assignment
   data, save schema and migrations. No React, no three.js, no `window`, no `Date.now()`
   buried inside (pass time in as an argument so it can be tested).
2. `src/state/`: Zustand store that calls into `game/`, plus context providers (audio,
   settings, auth).
3. `src/scene/` and `src/ui/`: render state and dispatch actions. They contain no rules.

## Data-driven content

Upgrades, jobs and assignments are typed arrays in `src/game/data/`. A new upgrade should be
one object, not new components. Shape example:

```ts
export const computers = [
  { id: "beige-box", name: "Dusty Beige Box", cost: 0, payoutMultiplier: 1 },
  { id: "grey-tower", name: "Grey Tower", cost: 500, payoutMultiplier: 1.4 },
] as const satisfies readonly Upgrade[];
```

The scene picks the model by `id`. Visual variants are looked up in a record keyed by id, and
TypeScript should error if an upgrade has no visual.

## Typing engine

- State: target text, cursor index, mistakes, started-at timestamp.
- Input is one function: `applyKey(state, key) -> state`. Backspace policy is a decision
  (default: mistyped characters must be corrected before continuing).
- **WPM** = (correct characters / 5) / minutes. Show a rolling window (about the last 10 to
  15 seconds) for the live counter, and the full-assignment figure at the end. Best-ever WPM
  uses completed assignments only.
- Ignore modifier keys and non-printable keys. Use `event.key` for text and `event.code`
  only for the keyboard visual.

## Economy

- Payout is a pure function of assignment, accuracy and owned upgrades. Keep the formula in
  one place (`economy.ts`) and unit test it.
- Costs scale geometrically (about 1.15x to 1.5x per level); put the growth factor in data.
- Numbers are plain JS numbers for now. Always display through one `formatNumber()` helper
  (1.2K, 3.4M). Revisit big-number libraries only if values approach 1e15.
- The currency name comes from `src/game/currency.ts`. Never hard-code it in UI strings.

## Time and idle income

- The AI assistant runs on a fixed-step tick, driven by one game loop, not a timer per
  feature. Do not tie game logic to render frames.
- Offline progress: on load, compute `now - lastSavedAt`, cap it (for example 8 hours), and
  credit the assistant's earnings once. Never reward changing the system clock beyond the cap.

## Persistence

- One versioned JSON object: `{ version, savedAt, player, upgrades, stats, settings }`.
- `src/game/save.ts` owns the schema, validation and `migrate(oldSave) -> latest`. Unknown or
  corrupt data falls back to a fresh save without crashing, and keeps a backup copy.
- Access storage only through a `SaveRepository` interface (`load`, `save`). The first
  implementation is localStorage. A cloud implementation replaces it later.
- Autosave on a throttle and on `visibilitychange`, not on every keystroke.

## Backend readiness (later)

- Treat the client as untrusted. The server will recompute or sanity check anything that
  affects the leaderboard (WPM plausibility, rate of earnings).
- Do not add auth, ads or network code until `docs/PLAN.md` reaches that phase.

## Naming and legal

- No real product names in game content. Use the parody names in `docs/GAME_DESIGN.md`.
