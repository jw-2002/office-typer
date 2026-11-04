// The job ladder. Promotion happens when the player's total correct characters reach `minChars`.
// Characters (not assignments) are counted so picking Short, Standard or Long cannot be gamed.

export type Job = {
  id: string;
  title: string;
  /** Total correct characters needed to hold this job. */
  minChars: number;
  /** Multiplies every payout. */
  payoutMultiplier: number;
  /** Which tier of assignment scenarios this job gets (see `scenarioPools`). */
  assignmentTier: number;
};

export const jobs = [
  { id: "intern", title: "Intern", minChars: 0, payoutMultiplier: 1, assignmentTier: 0 },
  { id: "data-entry-clerk", title: "Data Entry Clerk", minChars: 1_000, payoutMultiplier: 1.2, assignmentTier: 0 },
  { id: "junior-associate", title: "Junior Associate", minChars: 3_000, payoutMultiplier: 1.5, assignmentTier: 0 },
  { id: "senior-associate", title: "Senior Associate", minChars: 8_000, payoutMultiplier: 2, assignmentTier: 1 },
  { id: "team-lead", title: "Team Lead", minChars: 18_000, payoutMultiplier: 2.6, assignmentTier: 1 },
  { id: "manager", title: "Manager", minChars: 35_000, payoutMultiplier: 3.4, assignmentTier: 1 },
  { id: "director", title: "Director", minChars: 65_000, payoutMultiplier: 4.5, assignmentTier: 2 },
  { id: "vp-of-typing", title: "VP of Typing", minChars: 110_000, payoutMultiplier: 6, assignmentTier: 2 },
  {
    id: "chief-typing-executive",
    title: "Chief Typing Executive",
    minChars: 180_000,
    payoutMultiplier: 8,
    assignmentTier: 2,
  },
] as const satisfies readonly Job[];

export type JobId = (typeof jobs)[number]["id"];

/** What kind of work each assignment tier is, for the career screen. Index is `Job.assignmentTier`. */
export const assignmentTierNames: readonly string[] = ["Everyday notices", "Office business", "Executive paperwork"];
