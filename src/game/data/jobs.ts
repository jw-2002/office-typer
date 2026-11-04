// The job ladder. Promotion happens when the player's total correct characters reach `minChars`. The whole game is
// meant to last about 30 minutes (a 100 WPM typist) to 80 minutes (40 WPM), so the top job is 9,600 characters.
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
  { id: "data-entry-clerk", title: "Data Entry Clerk", minChars: 200, payoutMultiplier: 1.2, assignmentTier: 0 },
  { id: "junior-associate", title: "Junior Associate", minChars: 600, payoutMultiplier: 1.5, assignmentTier: 0 },
  { id: "senior-associate", title: "Senior Associate", minChars: 1_275, payoutMultiplier: 2, assignmentTier: 1 },
  { id: "team-lead", title: "Team Lead", minChars: 2_200, payoutMultiplier: 2.6, assignmentTier: 1 },
  { id: "manager", title: "Manager", minChars: 3_400, payoutMultiplier: 3.4, assignmentTier: 1 },
  { id: "director", title: "Director", minChars: 5_000, payoutMultiplier: 4.5, assignmentTier: 2 },
  { id: "vp-of-typing", title: "VP of Typing", minChars: 7_000, payoutMultiplier: 6, assignmentTier: 2 },
  {
    id: "chief-typing-executive",
    title: "Chief Typing Executive",
    minChars: 9_600,
    payoutMultiplier: 8,
    assignmentTier: 2,
  },
] as const satisfies readonly Job[];

export type JobId = (typeof jobs)[number]["id"];

/** What kind of work each assignment tier is, for the career screen. Index is `Job.assignmentTier`. */
export const assignmentTierNames: readonly string[] = ["Everyday notices", "Office business", "Executive paperwork"];
