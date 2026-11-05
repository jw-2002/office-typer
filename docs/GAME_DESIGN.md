# Game Design

Title: **Office Typer**. Tone: light, silly corporate satire. A short game: about 20 to 55 minutes, depending on how
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
- The player chooses a length per assignment: Tiny / Short / Standard / Long. Tiny is a single line and pays
  25% less per character; Short is the base rate; longer ones pay clearly more (+25% and +50%), so it is a real choice
  rather than a free upgrade.
- **Goblin mode** (hidden): poke the goblin poster for 40 seconds of goblin emails, a green screen and x10 pay on goblin
  assignments. Once every 5 minutes. **Document of the day**: the first assignment each day pays +50%.
- **Clean streak**: finishing assignments at 98% accuracy or better in a row adds 4% pay per assignment, up to +40%. One
  sloppy assignment resets it. The streak shows next to the accuracy and a rising ping plays as it grows.
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

## Time of day

The office has a day and night. The clock runs fast, three clock minutes per real second, so a day is 8 minutes of play (the
game starts at 8 in the morning). The sun crosses the sky, its shadows move across the desk, light turns orange at
dawn and dusk, and the room goes blue at night. The desk lamp glows after dark and the desk clock shows the time.

## Desk extras

Things to buy just for fun, in any order, with no effect on pay: Gerald the Plant, a Desk Lamp, a Desk Clock, a Tiny
Goblin who watches you, and Helping Hands, two gloves that press the keys while you type. Nobody asked for the hands.

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

- Still more scenarios, and real 3D models replacing the primitive placeholders.
- More decorations on the shelf and desk.

Not planned: accounts, cloud saves, leaderboards, ads and offline earnings.
