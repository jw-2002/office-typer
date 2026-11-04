# Plan

Build a playable prototype first, then layer on. Each phase should leave the game runnable.

## Phase 0 - Foundations (done)

- `git init`, `.gitignore` check, commit the current keyboard demo.
- Add ESLint rules already in the Vite template, Prettier, Vitest, and a `@/` path alias.
- Folder structure:
  ```
  src/
    game/        pure logic: typing engine, wpm, economy, jobs, upgrades data, save schema
    state/       store + providers (game store, audio, settings)
    scene/       everything inside <Canvas> (Room, Desk, Monitor, Keyboard, ...)
    ui/          DOM components (HUD, shop, menus)
    hooks/
    assets/      models, audio, textures
  ```
- Decide world scale (see Decisions). Move the current keyboard under `scene/`.

## Phase 1 - Typing core (done)

Done:

- `src/game/typing.ts`: pure typing state machine (`applyKey`), accuracy, final and live WPM.
  Rule (TypeRacer style): keys keep being accepted after a mistake, but everything typed from
  the first mistake is wrong (shown red) and must be removed with Backspace. Backspace cannot
  undo correct characters. At most 10 wrong characters pile up.
- `src/game/wpm.ts`: WPM maths and the rolling window.
- `src/game/assignments.ts`: `generateAssignment(tier, length, rng)`. Text lives in the app, not
  behind an API. Content is written as **scenarios** (`src/game/data/scenarios.ts`): one coherent
  topic each (a jammed printer, a fire drill...) with opening lines, a pool of body sentences
  and closing lines. An assignment is one scenario: an opening, shuffled body sentences up to the
  length target (Short 120, Standard 250, Long 450 characters), and a closing. `{slot}` values
  (names, days, things) stay the same across the whole assignment, and `{name2}` gives a
  different value from the same list. Seeded rng, so it is repeatable and testable.
  About 5 microseconds to generate, and a few KB of data.
- `src/state/keyInput.ts` plus `KeyInputProvider`: one window key listener shared by the 3D keyboard
  (held keys) and the typing game (typed characters). Ignores auto-repeat and Ctrl/Meta shortcuts.
- `src/hooks/useAssignment.ts` and `src/ui/Hud.tsx`: a plain 2D overlay with live WPM, accuracy,
  time, Short/Standard/Long buttons, and Enter for the next assignment. A "You typed" box shows
  the real keys pressed, with mistakes in red. This moves onto the in-world monitor in Phase 3.

Also done (Phase 1.5):

- **Variety**: 10 scenarios per tier (30 total), bigger slot lists, and a short memory
  (`RECENT_SCENARIO_MEMORY`) so the same scenario does not come up again straight away. The
  memory lives in `useAssignment` for now and moves into the game store in Phase 2.
- **Touch devices**: on a coarse pointer a transparent field (`TypingSink`) covers the assignment
  panel, so tapping it opens the on-screen keyboard. It diffs the field's value instead of reading
  key events, because phone keyboards often report every key as "Unidentified". A "Next
  assignment" button replaces Enter. The panel lifts above the keyboard (`--keyboard-inset`).
  **Not yet tested on a real phone.**
- **Caps Lock** warning in the HUD.
- **Time away** (window blur or hidden tab) is cut out of the assignment's time, so it does not
  hurt WPM. This also helps leaderboard plausibility later.
- **CI**: `.github/workflows/ci.yml` runs tsc, lint, tests, format check and build on push.

Content notes: all text must be typeable ASCII (tests enforce it). Body sentences must make sense
in any order, because they are shuffled (no "Then...", "But..."). More scenarios are the main thing
to add for variety: aim for 20 or more per tier before real players. If content grows large, load
tiers with dynamic `import()` so only the current tier is downloaded.

## Phase 2 - Economy and saving (done)

- **Store**: `src/state/gameStore.ts` (Zustand) holds `player.currency`, owned `upgrades` and
  `stats` (total chars, assignments, best WPM, total earned), with `finishAssignment`, `buy` and
  `load` actions. The rules are pure functions in `src/game/progress.ts`.
- **Data**: `src/game/data/upgrades.ts` (computers and key switches, tiers that must be bought in
  order) and `src/game/data/jobs.ts` (9 jobs). One generic `buy(id)` and one `UpgradeCard`.
- **Economy** (`src/game/economy.ts`): payout = 0.25 per correct char x accuracy squared x job
  multiplier x upgrade multiplier (best owned upgrade per category, multiplied across categories).
  Costs and multipliers are placeholders to balance later.
- **Promotions** come from total correct characters, not assignment count, so choosing Short,
  Standard or Long cannot game it. A job also sets which scenario tier is used.
- **Saving**: `src/game/save.ts` (versioned object, `migrate` repairs bad fields and rejects
  unusable saves) and `src/state/localSaveRepository.ts` (async `SaveRepository`, backs up a
  damaged save). `src/state/autosave.ts` loads on start, saves 5 seconds after a change, and on
  tab hide.
- **UI**: HUD shows credits, job, characters to promotion and best WPM; a Shop button opens a
  simple panel. The shop moves to the monitor or room in Phase 4.
- The scenario history (`recentIds`) stayed in `useAssignment`. It is not saved and is cheap, so
  moving it into the store would only add impure state to a reducer.
- **Not done on purpose**: no reset-save button, no offline progress (needs the AI assistant), no
  settings in the save yet.

## Phase 3 - Office scene prototype (done)

- **Scale decided**: 1 unit = 1 metre. The keyboard keeps its own 1-unit-per-keycap model and is
  scaled by `KEY_UNIT` (0.019) where it is placed on the desk (`src/scene/Office.tsx`).
- **Models**: all built from boxes in code, no asset files. `Room` (floor, three walls), `Desk`,
  `Monitor`, composed in `Office`. Each is its own component so a real `.glb` can replace it later.
  No chair yet (the camera is the player's eyes) and no shadows (flat lighting for now).
- **Monitor**: drei `<Html transform>` puts the real `AssignmentPanel` on the screen. It draws a
  CSS pixel as `distanceFactor / 400` metres, so `DISTANCE_FACTOR` maps the 800 x 450 px page onto
  the 0.64 x 0.36 m screen. `zIndexRange={[0, 0]}` keeps it under the HUD.
- **Gotcha**: `<Html>` renders in a separate React root, so React context does not reach inside.
  The Monitor reads the assignment from context outside and passes it as props; the Zustand store
  works inside. `AssignmentPanel` therefore takes props only.
- **Shared assignment state**: `AssignmentProvider` runs `useAssignment` once, and the HUD and the
  monitor both read it with `useCurrentAssignment()`.
- **Touch**: on a coarse pointer the monitor screen stays dark and the panel (with the typing
  field) is shown in the HUD instead, because an input inside CSS-3D DOM is unreliable on phones.
  `useFitCamera` widens the field of view on narrow screens.
- **Camera**: starts at seated eye height, with limited orbit (no walking behind the monitor).
- **HUD**: credits, job, characters to promotion, WPM, accuracy, time, best WPM, Shop, and the
  "You typed" box. Stat tiles shrink on phones.
- **Checked in a headless browser** (desktop and a phone profile): scene renders, buttons on the
  3D monitor click, typing, mistakes, payout and autosave all work. Real devices still untested.
- Known rough edges: the open Shop panel covers the right of the monitor (it moves in Phase 4);
  the monitor's perspective looks tall and stretched at the default camera, and the room is bare.

## Phase 4 - Upgrades you can see and hear (done)

- **Shop is a tab on the monitor** (decided). The monitor shows a fake desktop (`src/ui/Desktop.tsx`):
  one window with a title bar, and a task bar with Assignment and Shop tabs. On touch devices the
  same desktop sits in the HUD. The old floating shop panel and Shop button are gone.
- **OS themes**: each computer upgrade has an `os` (`src/game/data/upgrades.ts`). The best computer
  owned sets `<html data-os="...">` (`useOsTheme`), and `src/ui/osThemes.css` restyles everything
  through CSS tokens: HUD tiles, buttons, text boxes, the window, title bar, task bar and wallpaper.
  Beige Box = grey bevelled 90s style ("Wundows 95"), Grey Tower = blue and green ("Wundows XQ", id
  `sky`), Silver Laptop = light and rounded with traffic-light buttons and a top menu bar ("Pear OS"),
  Gaming Rig = dark with cyan and magenta glow ("Neon OS"), Quantum Toaster = glassy, warm and
  pill-shaped ("Quantum OS"). A test checks every theme sets the same tokens. Adding an OS means a
  new block in that file plus an entry in `src/game/data/os.ts`.
- **3D computers**: `src/scene/computerLooks.ts` (keyed by computer id, so a new computer will not
  compile without a look) sets the monitor frame (a deep CRT for the Beige Box, slim for later
  ones) and the PC case beside it (beige tower, grey tower, black tower with a glow strip, a toaster;
  laptops have none).
- **Key sounds**: `src/audio/switchSounds.ts` has a synthesis recipe per switch (clack, thock, and
  a click for tactile and clicky ones) and `keyClicker.ts` plays it with Web Audio, with random pitch
  jitter, so there are no sound files. `AudioProvider` plays it for every typed key using the best
  switches owned, and holds the mute setting (a Sound button in the HUD, remembered in localStorage).
  Checked in a headless browser that sounds are created, Shift is silent, and mute works. **How it
  actually sounds has not been heard yet.**
- Also fixed: the Time readout showed a negative number just after the first keystroke.
- **Switch colours** (`src/scene/keyboard/switchColors.ts`): the switch housing shows under each
  keycap, and a pressed key flashes the same colour (Mushy yellow, Strawberry red, Chestnut brown,
  Blueberry blue).
- **Swapping**: the player can switch between any computers and switches they own (the shop shows
  Use / In use). `Progress.equipped` holds the choice per category and is saved (save version 2,
  with a migration from 1). It only changes looks and sound: **pay always uses the best upgrade
  owned**, so going back to an old computer costs nothing. Buying something equips it at once.
- **Tab change animation** per OS (`--tab-animation` token plus keyframes in `osThemes.css`): the
  90s window redraws top down in steps, the blue one pops open, the light one settles with a spring,
  the neon one glitches, the glassy one comes into focus. Turned off for `prefers-reduced-motion`.
- **HUD corners** follow `--hud-radius`, which is square for the first two looks.
- The first computer is now a flat 90s desktop case under a CRT (not a tower).
- **Shelf** (`src/scene/Shelf.tsx`): the computers you own but are not using sit on a shelf on the
  back wall at 30% size, each in a fixed spot at the sides of the monitor. Click one to swap to it.
  This needed the monitor split into `MonitorBody` (model) and `Monitor` (adds the live screen), and a
  shared `ComputerSet` layout used by both the desk and the shelf. A plain scenery shelf is easy to
  extend later (the real scenery work is still Phase 7).
- **Working window buttons**: minimise hides the window until a task bar program is picked,
  maximise makes it fill the screen (toggle), close returns to the assignment (or hides it if you are
  already there). Their colours, glyphs and order (close first on the light look) come from tokens.
- **Settings program** (third task bar tab): your record (assignments, characters, best WPM, total
  earned) and a **Reset game** button. Reset opens an "Are you sure?" box (Escape or Cancel backs out)
  with a red `variant="danger"` button, then erases progress; autosave overwrites the saved game.
- New shared pieces: `Window` (title bar and body), `ConfirmDialog`, and a danger style on `Button`.
- Known gap: the game captures every key (it has to, to type), so buttons cannot be reached or
  pressed with the keyboard, only with the mouse or touch. Worth fixing before real players (for
  example only capture keys when nothing is open).
- **HUD moved onto the monitor** (the 2D HUD is now just a "Look around / Back to desk" button, plus the whole
  desktop on touch devices). Where things went: credits and live WPM in a **tray** in the task bar;
  accuracy, time, Caps Lock warning and the "You typed" box inside the assignment window; highest WPM
  (renamed from Best WPM), job, characters to promotion, and the sound toggle in **Settings**.
  Because the monitor cannot see React context, the sound setting is now a Zustand store
  (`audioStore.ts`), key sounds are a context-free `KeySounds` component, and Caps Lock travels inside
  the assignment object.
- **Two camera views** (`viewStore`, `CameraRig`, `cameraViews.ts`): Desk (close, screen fills about
  two thirds of the width, keyboard along the bottom) is the default, and Office (pulled back to see the
  shelf, name plate and whole desk). The camera glides between them; between moves the player can
  orbit and zoom. The monitor leans back about 11 degrees so the screen faces the camera.
- **Name plate** (`NamePlate.tsx`, `nameplateLooks.ts`): a wedge on the desk showing your job title.
  It upgrades with **promotion, not money** (plain grey plastic for the Intern, through wood, black
  acrylic, bronze, steel and brass, to a big glowing gold plate for the Chief Typing Executive).
- **Cursors**: each OS look has its own mouse pointer (arrow and pointing hand), set by the
  `--cursor-default` and `--cursor-pointer` tokens (small inline SVGs): black arrow and white glove for the
  90s look, white arrow for the blue one, clean black arrow for the light one, glowing cyan and orange
  for the last two. Buttons use the hand.
- **Bug fixed later (clicks on the monitor swapped the computer):** R3F computed the pointer from
  `event.offsetX/Y`, which is relative to the clicked DOM element, so clicks on the monitor text landed near the
  top-left of the 3D view, on the shelf. Fixed with `createCanvasEvents` (pointer from `clientX/Y`) plus `Solid`
  (the desk, monitor and keyboard block clicks to what is behind them).
- **Camera reworked** (renames the earlier "desk" and "office" views): **Seated** is locked in place (no orbit or
  zoom, framed a bit further back so the monitor, name plate, keyboard and a peek at the shelf all fit) and
  **Standing** is reached with the **Stand up** button (**Sit down** to return). The camera rises, then steps back
  along a smooth path (`CameraRig`), and only while standing can you look around and zoom a little.
- **Camera facing bug fixed**: while the orbit controls were off (seated, and during stand and sit) nothing aimed
  the camera, so it moved to the right place facing the wrong way, then snapped round when the controls came back
  (standing up), or stayed facing the wrong way for good (sitting down). `CameraRig` now aims it itself. Verified
  by measuring the facing error (0 degrees throughout) and by sitting down giving a picture identical to the start.
- **Posture hint**: the stand up / sit down control is no longer a boxed button. `PostureHint` is faint text with
  a small icon (a sneaker for Stand up, a chair for Sit down) low on the screen (half see-through, fully visible on hover), still a real `<button>` underneath
  for screen readers. On phones it moves to the top, because the bottom is the desktop.
- Not done on purpose: no keyboard or other upgrade categories yet, and no sound for the room (ambience) or promotions.

## Phase 5 - Jobs and promotions (done)

- **Promotion moment**: finishing the assignment that crosses a threshold opens a themed
  "Promotion!" message on the desktop (`PromotionDialog`) listing the new pay, any new kind of work, and
  the name plate. Enter, Escape or the button dismisses it. A four-note **fanfare** plays (respects mute),
  and the desk **name plate pops in** with a bounce when the job changes (`NamePlate`, animated in `useFrame`).
  The store keeps the promotion in `lastReward.promotedTo`, cleared by `dismissPromotion`.
- **Career program** (fourth task bar tab, `CareerPanel`): your job, pay multiplier and kind of work, a
  progress bar to the next promotion (`promotionProgress` in `economy.ts`), and the whole ladder with
  done, current and to-do rows. The job rows moved out of Settings.
- **Length is a real choice**: longer assignments pay more per character (`LENGTH_PAY` in `economy.ts`:
  Short x1, Standard x1.25, Long x1.5), and the buttons show the bonus. Promotion progress counts characters, so
  every length counts the same toward promotions. `AssignmentResult` now carries the length.
- **Assignment tiers** (everyday notices, office business, executive paperwork) come from the job
  (`Job.assignmentTier`, named in `assignmentTierNames`), unchanged from Phase 2. There are 9 jobs; 180K
  characters (hours of typing) reaches the top, and thresholds are plain data in `jobs.ts` to tune.
- New shared UI: `Dialog` (backdrop, window, Escape), used by both the reset confirmation and the
  promotion message, and `ProgressBar`.
- The task bar wraps onto two rows on phones, because four programs and the tray do not fit in one.
- **Not done**: no leaderboard-style comparison yet (Phase 8), and the job ladder's difficulty ramp is only
  the three scenario tiers. More scenarios per tier is still the best way to add variety.

## Phase 6 - AI assistant tab

- Tab on the monitor, auto-worker driven by a fixed-step game tick, tier upgrades.
- Offline progress: on load, credit capped idle earnings from time since last save.

## Phase 7 - Scenery shop and polish

- Buyable decor, replace primitives with real models, lighting pass, sound pass, balance pass.

## Phase 8 - Backend (later)

- Auth, cloud save, leaderboard. See hosting notes below.

## Phase 9 - Monetisation (last)

- Optional rewarded ad. Only after there are real players.

## Feasibility

Yes, this is feasible, and none of it needs exotic tech. Rough risk ranking:

1. **3D assets** are the biggest time sink, not the code. Mitigation: ship with primitive
   shapes (a stylised low-poly look from boxes/cylinders is a legitimate art style), then swap
   in free CC0 models (Kenney, Quaternius, Poly Pizza) or make a few in Blender and export as
   `.glb`. `gltfjsx` turns a `.glb` into an R3F component.
2. **Balance** of an idle economy takes iteration. Keep all numbers in data files so tuning
   does not mean editing components.
3. **Leaderboard cheating**: any score sent from the browser can be faked. Plan to validate
   server-side with plausibility checks (for example reject impossible WPM). Do not treat the
   leaderboard as trustworthy until then.
4. **Rewarded ads on the web** are harder than on mobile. Ad networks need approval and traffic.
   Another route is publishing on a games portal that provides an ad SDK. Check current terms
   when you get there.
5. Scope. Phases 0-5 are a complete, fun game on their own.

## Hosting and database (free or cheap)

Re-check free-tier limits when you get there, since they change.

- **Frontend hosting**: Cloudflare Pages, Vercel or Netlify. All have free tiers and deploy
  from git. It is a static site, so this is trivial.
- **Backend recommendation: Supabase.** Hosted Postgres plus built-in auth (Google sign-in and
  email+password, with hashing handled for you, so do not write your own). Row Level Security
  lets the browser talk to the database directly and safely for per-user saves, so you may need
  no custom backend at first. Leaderboard is a table or view. Score validation can go in an
  Edge Function. Free-tier projects may pause when inactive.
- **Alternative: Firebase** (Auth plus Firestore). Also generous free tier and easy leaderboards,
  but NoSQL and more lock-in.
- **Alternative: Cloudflare Workers plus D1** (SQLite). Very cheap and fast, but you write the
  backend and auth yourself.
- Keep persistence behind a small interface (`SaveRepository` with `load` and `save`), so
  localStorage now and Supabase later is a swap, not a rewrite.

## Decisions still open

- Currency name (Credits vs Billable Hours vs other).
- State library: plan is Zustand for game state (fine-grained subscriptions, readable from
  inside `useFrame`), with React context providers for audio, settings and auth.
- World scale: the keyboard currently uses 1 unit = one keycap (about 19 mm). Easiest path is
  to build the desk at real-world scale in metres and scale the Keyboard group down when it
  is placed on the desk.
- Shop as a monitor tab or physical objects.
- Whether the AI tab and the shop share one "apps" UI on the monitor.
