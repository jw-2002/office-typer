# Architecture map

Keep this current when files are added or the flow changes. Each source file also starts with a
one-line comment saying what it does.

## How the app starts

1. `index.html` has `<div id="root">` and loads `src/main.tsx`.
2. `src/main.tsx` mounts `<App />` inside `<AppProviders>` (and `StrictMode`) and imports `index.css`.
3. `src/state/AppProviders.tsx` composes every app-wide provider and starts autosave. Today that is
   `KeyInputProvider`, which creates the shared key input and attaches the window `keydown`/`keyup`
   listeners, and `startAutosave`, which loads the save into the game store.
4. `src/App.tsx` renders two siblings: the 3D `<Canvas>` (with `Scene`) and the 2D `Hud`.

## Where the game flow lives

There is no central game loop. Flow is event driven:

`key press` -> `keyInput` (src/state) -> `useAssignment` (src/hooks) subscribes and dispatches ->
`typing.ts` (src/game) applies the rules and returns new state -> `Hud` renders it.

When an assignment finishes, `useAssignment` calls `finishAssignment` on the game store
(`src/state/gameStore.ts`), which uses `src/game/progress.ts` and `economy.ts` to pay out, update
stats and promote. Buying goes the same way (`ShopPanel` -> `buy` -> `buyUpgrade`). Autosave
(`src/state/autosave.ts`) watches the store and writes through a `SaveRepository`.

The 3D `Keyboard` reads the same `keyInput` for which keys are held, so keys animate with no game
logic. Assignment text comes from `assignments.ts` + `data/`.

## Folders

- `src/game` pure rules and data (no React or three.js), with tests beside them.
- `src/state` providers, the key input, and (later) the store and save repository.
- `src/hooks` hooks shared by UI.
- `src/scene` everything inside `<Canvas>`.
- `src/ui` the DOM overlay.
