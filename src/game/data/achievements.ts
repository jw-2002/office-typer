// The achievements: small goals shown in the Career program. Each is a name, a line of text and a test of the player's
// progress. They are checked after anything that could earn one (see achievements.ts), and once earned they stay earned,
// even through a new career.
import { jobs } from "./jobs";
import { upgrades } from "./upgrades";
import { type Progress } from "@/game/progress/progress";

export type Achievement = {
  id: string;
  name: string;
  description: string;
  /** Whether the progress has earned it. */
  earned: (progress: Progress) => boolean;
};

const owns = (progress: Progress, category: string) =>
  upgrades
    .filter((upgrade) => upgrade.category === category)
    .every((upgrade) => progress.upgrades.includes(upgrade.id));

export const achievements: readonly Achievement[] = [
  {
    id: "first-words",
    name: "First Words",
    description: "Finish an assignment.",
    earned: (p) => p.stats.assignmentsCompleted >= 1,
  },
  {
    id: "moving-up",
    name: "Moving Up",
    description: "Get your first promotion.",
    earned: (p) => p.stats.totalChars >= jobs[1].minChars,
  },
  {
    id: "top-of-the-ladder",
    name: "Chief of Everything",
    description: "Reach the top job.",
    earned: (p) => p.stats.totalChars >= jobs[jobs.length - 1].minChars,
  },
  {
    id: "on-a-roll",
    name: "On a Roll",
    description: "Finish 5 clean assignments in a row.",
    earned: (p) => p.stats.bestStreak >= 5,
  },
  {
    id: "flawless",
    name: "Flawless Fortnight",
    description: "Finish 10 clean assignments in a row.",
    earned: (p) => p.stats.bestStreak >= 10,
  },
  {
    id: "fast-fingers",
    name: "Fast Fingers",
    description: "Finish an assignment at 80 WPM or more.",
    earned: (p) => p.stats.bestWpm >= 80,
  },
  {
    id: "typing-machine",
    name: "Typing Machine",
    description: "Finish an assignment at 120 WPM or more.",
    earned: (p) => p.stats.bestWpm >= 120,
  },
  {
    id: "marathon",
    name: "Marathon Perfectionist",
    description: "Finish a Long assignment with no mistakes at all.",
    earned: (p) => p.stats.perfectLongs >= 1,
  },
  {
    id: "retail-therapy",
    name: "Retail Therapy",
    description: "Buy something from the shop.",
    earned: (p) => p.upgrades.some((id) => upgrades.some((u) => u.id === id && u.cost > 0)),
  },
  {
    id: "big-spender",
    name: "Big Spender",
    description: "Earn a lot of money over a career.",
    earned: (p) => p.stats.totalEarned >= 50_000,
  },
  {
    id: "dj-cubicle",
    name: "DJ Cubicle",
    description: "Own every song.",
    earned: (p) => owns(p, "music"),
  },
  {
    id: "desk-hoarder",
    name: "Desk Hoarder",
    description: "Own every desk extra.",
    earned: (p) => owns(p, "extra"),
  },
  {
    id: "poke-the-goblin",
    name: "Poke the Goblin",
    description: "Find the secret in the office.",
    earned: (p) => p.stats.goblinUses >= 1,
  },
  {
    id: "goblin-regular",
    name: "Goblin Regular",
    description: "Use goblin mode 5 times in one career.",
    earned: (p) => p.stats.goblinUses >= 5,
  },
  {
    id: "sign-here",
    name: "Sign Here",
    description: "Sign a card for a colleague.",
    earned: (p) => p.stats.cardsSigned >= 1,
  },
  {
    id: "whip-round",
    name: "Whip-Round",
    description: "Chip in for a present.",
    earned: (p) => p.stats.presents >= 1,
  },
  {
    id: "second-wind",
    name: "Second Wind",
    description: "Start a second career after being made redundant.",
    earned: (p) => p.legacy >= 1,
  },
];
