# Architecture map

Keep this current when files are added or the flow changes. Each source file also starts with a
one-line comment saying what it does.

## How the app starts

1. `index.html` has `<div id="root">` and loads `src/main.tsx`.
2. `src/main.tsx` mounts `<App />` inside `<AppProviders>` (and `StrictMode`) and imports `index.css`.
3. `src/state/AppProviders.tsx` composes every app-wide provider and starts autosave. Today that is
   `KeyInputProvider`, `AudioProvider` (key sounds and mute), which creates the shared key input and attaches the window `keydown`/`keyup`
   listeners, and `startAutosave`, which loads the save into the game store.
4. `src/App.tsx` renders two siblings: the 3D `<Canvas>` (with `Scene`) and the 2D `Hud`.
   `AppProviders` also includes `AssignmentProvider`, which runs the current assignment once so the
   HUD and the 3D monitor share it.

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

- `src/game` pure rules and data (no React or three.js), with tests beside them. `Progress` has the
  upgrades owned and which one is `equipped` per category; looks and sounds follow the equipped one.
- `src/state` providers, the key input, and (later) the store and save repository.
- `src/hooks` hooks shared by UI.
- `src/audio` key sound recipes and the Web Audio player (impure; the mute setting is in `src/state`).
- `src/scene` everything inside `<Canvas>`: `Scene` (lights, controls) holds `Office`, which places
  `Room`, `Desk`, the live `Computer`, the `Shelf` of old computers, the job `NamePlate` and the
  keyboard. `CameraRig` moves the camera between the seated and standing views in `cameraViews.ts`, and locks it while seated.
  `Solid` makes things block clicks, and `canvasEvents.ts` measures the pointer from the canvas. 1 unit = 1 metre.
- `src/ui` the DOM overlay. `Desktop` (window + task bar tabs) holds `AssignmentPanel`, `ShopPanel`, `CareerPanel` and `SettingsPanel`,
  and shows `Dialog`-based messages (`ConfirmDialog`, `PromotionDialog`) over them;
  it appears on the 3D monitor via `MonitorScreen`, or in the HUD on touch. `osThemes.css` restyles it all.
