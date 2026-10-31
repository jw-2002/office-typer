# Office Typer

A 3D browser idle/grind game about typing. The player sits at an office desk, completes typing
assignments shown on an in-world monitor, earns currency, and spends it on upgrades (computer,
keyboard, key switches, scenery, an AI assistant that works on its own). Completing enough work
earns promotions with harder, better-paid assignments. Main goal: **fun**, not teaching typing.

Full idea: `docs/GAME_DESIGN.md`. Roadmap and decisions: `docs/PLAN.md`. Read both before
starting significant work, and update them when decisions change.

## Stack

Vite, React 19, TypeScript (strict), three.js via @react-three/fiber (R3F) and @react-three/drei.
Package manager: npm. Dev server: `npm run dev`. Imports across folders use the `@/` alias
(`src/`). Before finishing a change run `npx tsc -b`, `npm run lint`, `npm test`,
`npm run format:check` and `npm run build`. `npm run format` fixes formatting.

## The user

Knows React and TSX well, has **no three.js experience**. Explain 3D concepts briefly the first
time they appear in code, and own the three.js best practices (see skills below). Prefers
readable code over clever code.

## Skills (read the relevant one before writing that kind of code)

- `.claude/skills/r3f-best-practices` - anything inside `<Canvas>`, models, lighting, performance.
- `.claude/skills/react-ts-conventions` - components, hooks, providers/context, types, no duplication.
- `.claude/skills/css-conventions` - HUD/overlay styling, tokens, layout.
- `.claude/skills/game-architecture` - game state, economy, persistence, pure game logic.

## Ground rules

- No duplicated logic or data. If something appears twice, extract it. Upgrades, jobs and
  assignments are data (config files), not copy-pasted components.
- Game rules live in `src/game/` as pure TypeScript with no React or three.js imports, so they
  can be unit tested.
- Real names of products (Cherry MX, GPT, Llama, Claude, etc.) must not appear in the game.
  Use the parody names in `docs/GAME_DESIGN.md`. The currency name is a single constant.
- Do not start phases out of order or add backend/ads work until the plan says so.
- Keep this file short. Detail goes in `docs/` and the skills.
