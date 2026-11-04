# Game Design

Title: **Office Typer**. Tone: light, silly corporate satire. A short game: about 30 to 80 minutes, depending on how
fast you type, ending when an AI assistant takes your job.

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
- The player chooses a length per assignment: Short / Standard / Long. Short is quick; longer ones pay a
  clearly more per character (+25% and +50%), so it is a real choice rather than a free upgrade.
- Difficulty rises with job level: longer text, punctuation, capitals, numbers, harder words.
- Payout sketch: `base * characters * accuracyMultiplier * jobMultiplier * upgradeMultiplier`.
- Text comes from a data file of templates/snippets, not generated on the fly (for now).

## Promotion moment

Crossing a promotion threshold interrupts you with a themed message (new pay, new kind of work), a short
fanfare, and a bouncing new name plate on the desk. The Career program shows the ladder and the progress bar.

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

## Operating systems

Each computer runs its own fake OS, and the whole UI (HUD, the monitor desktop, the shop) looks like
it: Wundows 95 (grey, bevelled), Wundows XQ (blue and green, glossy), Pear OS (light, rounded, menu bar
on top), Neon OS (dark with glowing edges), Quantum OS (glassy and warm). Names are parodies.
Upgrading the computer is therefore also a style change, which is part of the reward. Old computers
and switches stay owned and can be swapped back to at any time (looks and sound only; pay always uses
the best owned).

## AI assistants

You buy AI assistants in order. They type on their own while you work, earning credits at their own speed and accuracy
(their mistakes cost pay, just like yours), using your job and upgrade multipliers. They never count toward
promotions, which are about your own typing. The tiers are parodies, and you can swap back to an older one:

- **Gippity-1** (8 WPM, 80%): slow, sloppy and obsessed with goblins, which keep turning up in what it types.
- **Drama Llama 7B** (20 WPM, 88%): quick, but sulks.
- **Gemstone Flash** (45 WPM, 94%): sparkly and easily distracted. About as good as a casual typist.
- **Clyde Octet 5** (100 WPM, 99%): never tires, never complains, never needs you.

## The ending

Buying Clyde Octet 5 gets you made redundant: after the next assignment you finish (or a minute of waiting), a
redundancy notice shows your time at the company, assignments, highest WPM, credits earned and fastest ever
redundancy. "Start a new career" begins again. A faster run (better typing, earlier upgrades) is a better run.

## Audio

Key sound depends on the equipped switch. Later: ambient office noise, promotion fanfare,
printer sounds. Audio is behind a provider so it can be muted and settings persisted.

## Desk name plate

A wedge on the desk shows the player's job title, and it is upgraded by promotion, not by buying anything:
plain plastic for the Intern, up to a big gold plate for the Chief Typing Executive.

## Screen and HUD

Almost everything is on the 3D monitor, in the fake OS: credits and live WPM in the task bar tray, accuracy,
time and the "You typed" box in the assignment window, and the highest WPM, career progress and sound in
Settings. The only 2D overlay is a faint Stand up / Sit down hint low on the screen. Seated, the camera is locked on the screen; standing, you can look around
the office. On touch devices the same desktop sits in the HUD instead.

- Live **WPM** is a rolling window, not a whole-session average.
- The highest WPM is stored in the save, and the fastest redundancy time is kept between runs.

## Possible later

- More scenarios per tier, and real 3D models replacing the primitive placeholders.
- More decorations on the shelf and desk.

Not planned: accounts, cloud saves, leaderboards, ads and offline earnings.
