---
name: game-architecture
description: Architecture rules for the typing idle game's rules, economy, state and persistence. Use before writing game logic, the Zustand store, upgrades/jobs data, WPM, payouts, the game clock, the ending or save/load code.
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

Upgrades, jobs and assignment text are typed arrays in `src/game/data/`. Assignment text is
written as scenarios (opening, body, closing) so documents read coherently; body sentences are
shuffled, so each must make sense in any order. A new upgrade should be
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
- Input is one function: `applyKey(state, key, now) -> state`. Decided policy (TypeRacer
  style): keys keep being accepted after a mistake, but everything typed from the first
  mistake is wrong and must be removed with Backspace before progress continues. Backspace
  cannot undo correct characters, and wrong characters are capped.
- **WPM** = (correct characters / 5) / minutes. Show a rolling window (about the last 10 to
  15 seconds) for the live counter, and the full-assignment figure at the end. Best-ever WPM
  uses completed assignments only.
- Ignore modifier keys and non-printable keys. Use `event.key` for text and `event.code`
  only for the keyboard visual.

## Economy

- Promotions use total correct characters, not assignment count, so assignment length cannot game them.
- Payout is a pure function of assignment, accuracy and owned upgrades. Keep the formula in
  one place (`economy.ts`) and unit test it.
- Costs scale geometrically (about 1.15x to 1.5x per level); put the growth factor in data.
- Numbers are plain JS numbers for now. Always display through one `formatNumber()` helper
  (1.2K, 3.4M). Revisit big-number libraries only if values approach 1e15.
- The currency name comes from `src/game/economy/currency.ts`. Never hard-code it in UI strings.

## Time and the ending

- Everything that happens by itself (AI assistants earning, the redundancy countdown) runs from one game clock
  (`src/state/game/assistantLoop.ts`, once a second, calling the pure `tickGame`). Do not tie game logic to render frames or
  add a timer per feature. The clock skips hidden tabs and caps long gaps.
- **No offline progress**, by design. Nothing earns while the tab is hidden or the game is closed.
- The game ends through `Progress.finale` (`none`, `pending`, `redundant`). Once redundant, `tickGame`, buying and
  payouts do nothing. Keep new systems behind that check.

## Persistence

- One versioned JSON object (see `src/game/progress/save.ts`): `version`, `savedAt`, `player`, `upgrades`, `equipped`, `finale` and
  `stats`. Bump `SAVE_VERSION` and add a `migrations` entry whenever the shape changes.
- `src/game/progress/save.ts` owns the schema, validation and `migrate(oldSave) -> latest`. Unknown or
  corrupt data falls back to a fresh save without crashing, and keeps a backup copy.
- Access storage only through the async `SaveRepository` interface (`load`, `save`). The implementation is
  localStorage. There is no cloud save planned.
- Autosave on a throttle and on `visibilitychange`, not on every keystroke.

## Naming and legal

- No real product names in game content. Use the parody names in `docs/GAME_DESIGN.md`.
