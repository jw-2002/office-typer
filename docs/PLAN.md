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
  Rule: a wrong key blocks progress until Backspace; Backspace cannot undo correct characters.
- `src/game/wpm.ts`: WPM maths and the rolling window.
- `src/game/assignments.ts`: `generateAssignment(tier, length, rng)`. Text lives in the app, not
  behind an API. Sentence pools per tier plus `{slot}` fill-ins (`src/game/data/`), assembled
  to a target length (Short 120, Standard 300, Long 600 characters). Seeded rng, so it is
  repeatable and testable. About 3 KB gzipped for 90 sentences, about 5 microseconds to generate.
- `src/state/keyInput.ts` plus `KeyInputProvider`: one window key listener shared by the 3D keyboard
  (held keys) and the typing game (typed characters). Ignores auto-repeat and Ctrl/Meta shortcuts.
- `src/hooks/useAssignment.ts` and `src/ui/Hud.tsx`: a plain 2D overlay with live WPM, accuracy,
  time, Short/Standard/Long buttons, and Enter for the next assignment. This moves onto the
  in-world monitor in Phase 3.

Content notes: all text must be typeable ASCII (tests enforce it). More sentences per tier are
cheap to add. If content grows large, load tiers with dynamic `import()` so only the current
tier is downloaded.

## Phase 2 - Economy and saving

- Game store: currency, owned upgrades, job level, stats (best WPM, total typed).
- Upgrades and jobs as data. One generic `buy(upgradeId)` action, one generic `UpgradeCard`.
- Payout formula in `src/game/economy.ts`, unit-tested.
- Save/load to localStorage as one versioned JSON object with a migration function.

## Phase 3 - Office scene prototype

- Room, desk, chair, computer and monitor built from primitives.
- Monitor shows the assignment UI using drei `<Html transform>` (real DOM on the 3D screen,
  so text and tabs are normal React and CSS).
- Keyboard sits on the desk and reacts to real typing (already built).
- HUD overlay: WPM, currency, job.

## Phase 4 - Upgrades you can see and hear

- Computer tiers change the monitor model and stats.
- Switch types change key sound and feel (Web Audio, one sample per switch type, pitch jitter).
- Shop UI (decide: a tab on the monitor, or clickable objects in the room).

## Phase 5 - Jobs and promotions

- Promotion thresholds, new assignment tiers, title shown in HUD, a small promotion moment.
- Length choice (Short/Standard/Long) on assignment select.

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
