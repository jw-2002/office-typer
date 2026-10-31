---
name: react-ts-conventions
description: React and TypeScript conventions for this project, including components, hooks, providers and context, typing, file layout and avoiding duplication. Use before writing or refactoring any .ts or .tsx file.
---

# React and TypeScript conventions

## Principles
- **No duplication.** If code or data appears twice, extract it. Similar things (upgrades,
  jobs, assignments, key definitions) are one data array rendered by one component.
- **Single source of truth.** Derive values instead of storing them (for example, WPM and
  accuracy come from the typing state, level multipliers come from owned upgrades).
- Prefer clear and boring over clever. The reader is fluent in TSX.

## TypeScript
- `strict` stays on. No `any`; use `unknown` and narrow. Avoid `as` casts unless unavoidable,
  and comment why.
- Model variants with discriminated unions, not optional-field bags.
- Export types next to the thing they describe. Use `type` for shapes and unions.
- Config data uses `as const satisfies Type` so ids are literal types and checked.
- Name props `<Component>Props`. Prefer explicit return types on exported non-component functions.

## Components
- Function components only. One exported component per file, file name matches the component.
- Small and focused. If a component has more than one reason to change, split it.
- Logic goes into hooks (`useAssignment`, `useWpm`) or pure functions in `src/game/`, not
  inline in JSX.
- Do not memoise (`useMemo`, `useCallback`, `memo`) by default. Add it where there is a
  measured problem or a stable identity is required (for example shared three.js geometry).
- Lists need stable `key`s from ids, never array index for reorderable data.
- Effects: only for syncing with the outside world (event listeners, audio, timers). Always
  return cleanup. Do not use an effect to derive state.

## State, providers, context
- Context is for slow-changing, app-wide dependencies: audio, settings, auth, save repository.
  Expose through a custom hook (`useAudio()`) that throws if used outside its provider.
- High-frequency or large game state lives in the Zustand store, accessed with selectors
  (`useGameStore(s => s.currency)`). Context would re-render every consumer.
- Providers are composed in one place (`src/state/AppProviders.tsx`) and wrap the app and
  `<Canvas>` from outside.
- Never put server or persistence calls inside components. Go through an interface
  (`SaveRepository`).

## Folder layout
`src/game` pure logic and data, `src/state` store and providers, `src/scene` 3D, `src/ui` DOM,
`src/hooks` shared hooks. `game/` must not import React, three, or anything from `ui/scene`.
Use the `@/` alias for imports across folders.

## Testing
- Vitest for `src/game/`. Test the typing engine, WPM, payout, promotion thresholds and save
  migration. Tests sit beside the file as `*.test.ts`.
- Do not unit test R3F scenes. Keep them thin by keeping logic in `game/`.

## Naming and style
- Components `PascalCase`, hooks `useThing`, constants `SCREAMING_SNAKE` only for true
  constants, everything else `camelCase`.
- Match the surrounding file's formatting. The repo uses Prettier.
- Comments explain why, not what. Add a short comment where a 3D or math idea would surprise a
  React developer.

## Before finishing
`npx tsc -b`, `npm run build`, and `npx vitest run` (once tests exist) all pass.
