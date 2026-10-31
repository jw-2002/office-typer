# Game Design

Title: **Office Typer**. Tone: light, silly corporate satire.

## Core loop

1. An assignment appears on the in-world monitor (an email, memo, report, spreadsheet note...).
2. The player types it. Correct keystrokes advance it; mistakes cost accuracy.
3. Finishing pays out currency, scaled by length, accuracy, and upgrades.
4. Currency buys upgrades, which raise future payouts and change how the desk looks and sounds.
5. Enough progress triggers a promotion: new job title, longer/harder/better-paid assignments.

## Currency

Placeholder: **Credits**. Candidate: **Billable Hours**. Defined in one constant
(`src/game/currency.ts`) so renaming is a one-line change.

## Assignments

- Types: emails, memos, reports, spreadsheet notes, "code comments", meeting minutes.
- The player chooses a length per assignment: Short / Standard / Long. Short pays less in total
  but is quicker; the pay per character should be close to equal so it is a real choice.
- Difficulty rises with job level: longer text, punctuation, capitals, numbers, harder words.
- Payout sketch: `base * characters * accuracyMultiplier * jobMultiplier * upgradeMultiplier`.
- Text comes from a data file of templates/snippets, not generated on the fly (for now).

## Progression: job titles

Intern, Data Entry Clerk, Junior Associate, Senior Associate, Team Lead, Manager, Director,
VP of Typing, Chief Typing Executive. Promotion thresholds are data.

## Upgrades (all data-driven, same shape: id, name, cost, effect, visual)

Names below are placeholders that avoid real trademarks.

- **Computer**: Dusty Beige Box, Grey Tower, Slim Silver Laptop, Gaming Rig, Quantum Toaster.
  Affects payout multiplier and what the monitor looks like.
- **Keyboard / IO**: generic board, then better boards, mouse, headset, desk mat, etc.
- **Key switches** (affects multiplier and typing sound): Generic Mushy, Strawberry Linear
  (red-style), Chestnut Tactile (brown-style), Blueberry Clicky (blue-style), later silent and
  "thocky" variants. Keycap colours/materials can follow.
- **Scenery**: plants, posters, a window, better chair, desk lamp, a cat, bigger office.
- **AI assistant** (auto-worker, see below).

## AI assistant (idle income)

A subscription the player buys and upgrades. It gets its own tab on the monitor and types
assignments on its own, slowly at first. Tiers are parodies:
Gippity-1, Drama Llama 7B, Gemstone Flash, Clyde Octet 5. Each tier costs more and works faster.
Active typing should always out-earn it early on so typing stays the main verb.

## Audio

Key sound depends on the equipped switch. Later: ambient office noise, promotion fanfare,
printer sounds. Audio is behind a provider so it can be muted and settings persisted.

## HUD

- Live **WPM** counter (rolling window, not whole-session average) always visible.
- Currency, job title, current assignment progress.
- Best-ever WPM stored in the save (and later the leaderboard).

## Future (not in the prototype)

- Accounts (Google sign-in, maybe email+password), cloud save.
- Leaderboard: total points and highest WPM.
- Freemium: optional rewarded ad for a small currency bonus.
- Real 3D models replacing primitive placeholders.
