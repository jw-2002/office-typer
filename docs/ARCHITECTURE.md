# Architecture map

Keep this current when files are added or the flow changes. Each source file also starts with a
one-line comment saying what it does.

## How the app starts

1. `index.html` has `<div id="root">` and loads `src/main.tsx`.
2. `src/main.tsx` mounts `<App />` inside `<AppProviders>` (and `StrictMode`) and imports `index.css`.
3. `src/state/AppProviders.tsx` composes every app-wide provider and starts autosave. Today that is
   `KeyInputProvider`, `AudioProvider` (key sounds and mute), which creates the shared key input and attaches the window `keydown`/`keyup`
   listeners, and `startAutosave`, which loads the save into the game store, plus `startAssistantLoop`, the once-a-second game clock.
4. `src/App.tsx` renders two siblings: the 3D `<Canvas>` (with `Scene`) and the 2D `Hud`.
   `AppProviders` also includes `AssignmentProvider`, which runs the current assignment once so the
   HUD and the 3D monitor share it.

## Where the game flow lives

There is no central game loop. Flow is event driven:

`key press` -> `keyInput` (src/state/input) -> `useAssignment` (src/state/assignment) subscribes and dispatches ->
`typing.ts` (src/game/text) applies the rules and returns new state -> `Hud` renders it.

When an assignment finishes, `useAssignment` calls `finishAssignment` on the game store
(`src/state/game/gameStore.ts`), which uses `src/game/progress/gameplay.ts` and `economy.ts` to pay out, update
stats and promote. Buying goes the same way (`ShopPanel` -> `buy` -> `buyUpgrade`). Autosave
(`src/state/game/autosave.ts`) watches the store and writes through a `SaveRepository`.

The 3D `Keyboard` reads the same `keyInput` for which keys are held, so keys animate with no game
logic. Assignment text comes from `assignments.ts` + `data/`.

## Folders

Each folder under `src` is split into subfolders of related files, with each file's test beside it.

- `src/game` pure rules and data (no React or three.js). Subfolders: `text/` (the typing engine `typing.ts`, `wpm.ts`, `assignments.ts`,
  `assistantText.ts`, `random.ts`), `economy/` (`economy.ts`, `currency.ts`, and `simulate.ts`, which plays a whole game with a steady
  typist to check the pacing), `progress/` (`progress.ts` is the shape of the save plus a fresh start, careers and the name; `gameplay.ts` finishes assignments and ticks the clock; `shop.ts` buys, equips and puts away; `goblin.ts` is goblin mode; plus `achievements.ts`, `save.ts`, and `saveCode.ts`, the copy-and-paste save code),
  `office/` (`events.ts`, `ambience.ts`, `time.ts` for the game clock, `toast.ts` for the toaster joke) and `data/` (jobs, upgrades,
  scenarios, events, achievements). `utils/math.ts` holds `clamp01`. `data/scenarios.ts` has the types and pools; the scenario text is in
  `scenariosEveryday1/2/3`, `scenariosWild` and `scenariosExtra`. `Progress` has the upgrades owned and which one is `equipped` per
  category; looks and sounds follow the equipped one.
- `src/state` Zustand stores and providers. `game/` (`gameStore`, `eventStore`, `recordsStore`, `assistantLoop`, `autosave`,
  `localSaveRepository`, `devTools`), `input/` (`keyInput`, `KeyInputProvider`, `useKeyInput`, `diffToKeys`), `assignment/`
  (`AssignmentProvider`, `useCurrentAssignment`, `useAssignment`, `useAssistantTyping`), `sound/` (`audioStore`, `soundCueStore`,
  `KeySounds`), `view/` (`displayStore`, `viewStore`). `AppProviders` composes them, and `storage.ts` reads and writes localStorage safely.
- `src/hooks` small hooks shared by the UI (`useNow`, `useCapsLock`, `useCoarsePointer`, `useKeyboardInset`, `useOsTheme`).
- `src/audio` impure Web Audio code. `sfx/` has the key sound recipes (`keyClicker.ts`, `switchSounds.ts`) and `music/` has the song
  data (`tracks.ts`) and sequencer (`musicPlayer.ts`). The sound settings are in `src/state/sound`.
- `src/scene` everything inside `<Canvas>`. `Scene` (lights, controls) holds `Office`, which places the room and computer. 1 unit = 1 metre.
  `Solid` makes things block clicks, `clickable.ts` has the pointing-hand and click helpers, and `palette.ts` holds the colours and outline
  settings. Subfolders:
  - `camera/` `CameraRig` and `cameraViews` (seated and standing), `useFitCamera`, and `canvasEvents` (measures the pointer from the canvas).
  - `computer/` every computer model: `Computer` (the one in use) and `ComputerSet`, `computerLooks`, `Monitor` and `monitorGeometry`,
    `PcCase`, `LaptopBase` and `laptopSize`, `QuantumToaster` (lever, toast and its joke), `Peripherals`, `Mouse` and `keyboard/` (the keys,
    switch colours, gloved `HelpingHands` and `fingers.ts`).
  - `room/` the scenery: `Room`, `Floor`, `WallDecor` (window, cork board), `Desk`, `DeskClutter`, `Chair`, `Shelf` (old computers),
    `NamePlate` and `nameplateLooks`, and `GoblinPoster` (the goblin mode easter egg).
  - `light/` `Sun` and `daylight.ts`, driven by the game clock in `src/game/office/time.ts`.
  - `effects/` `DustMotes` and `RewardPopups` (the floating pay number).
  - `extras/` the desk and shelf toys you can buy: where each goes is in `Extras.tsx`.
    `Scene` also adds bloom, vignette and tone mapping through `EffectComposer`. Ambient sounds are in `src/audio/sfx/keyClicker.ts`, chosen by
    `src/game/office/ambience.ts` and played from `state/sound/KeySounds.tsx`.
- `src/ui` the DOM overlay. Subfolders: `desktop/` (`Desktop` window and task bar with `TabIcon` pictures, `Window`, `WindowControls`, `Tray`,
  `MonitorScreen`, and `osThemes.css`, which just imports one file per OS from `themes/` and restyles it all, with its tests), `programs/` (what the task bar opens: `AssignmentPanel`,
  `ShopPanel`, `CareerPanel`, `AssistantPanel`, `SettingsPanel`, and their parts), `dialogs/` (`Dialog` and the messages built on it, plus
  `AchievementToast`), `goblin/` (the green goblin mode screen and text), `hud/` (`Hud`, `PostureHint`) and `shared/` (`Button`, `Money`,
  `ProgressBar`, `surface.module.css`). It appears on the 3D monitor via `MonitorScreen`, or in the HUD on touch.
- `scripts/smoke.mjs` (`npm run smoke`) drives the dev server in a real browser: name, an assignment, a purchase, a save code and an office
  event. It needs Playwright's Chromium (`npx playwright install chromium`) and is not part of `npm test`.
