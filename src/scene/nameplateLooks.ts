// How the desk name plate looks for each job. It upgrades with each promotion (not with money): plain plastic for
// the Intern, up to a big gold plate for the Chief Typing Executive. Keyed by job id, so a new job will not compile
// until it has a plate.
import type { JobId } from "@/game/data/jobs";

export type NameplateLook = {
  /** Colour of the plate. */
  color: string;
  /** Colour of the lettering. */
  textColor: string;
  /** Width of the plate in metres. Higher jobs get a bigger plate. */
  width: number;
  /** 0 is plastic or wood, 1 is shiny metal. */
  metalness: number;
  /** A glow, for the very top plates. */
  glow?: string;
};

export const nameplateLooks = {
  intern: { color: "#4b5563", textColor: "#ffffff", width: 0.16, metalness: 0 },
  "data-entry-clerk": { color: "#d1d5db", textColor: "#1f2937", width: 0.17, metalness: 0 },
  "junior-associate": { color: "#6b4423", textColor: "#fdf3dc", width: 0.18, metalness: 0 },
  "senior-associate": { color: "#111827", textColor: "#e5e7eb", width: 0.19, metalness: 0.2 },
  "team-lead": { color: "#92400e", textColor: "#fff7ed", width: 0.2, metalness: 0.5 },
  manager: { color: "#9ca3af", textColor: "#111827", width: 0.21, metalness: 0.6 },
  director: { color: "#c9a227", textColor: "#2b1d00", width: 0.23, metalness: 0.7 },
  "vp-of-typing": { color: "#e5b400", textColor: "#2b1d00", width: 0.25, metalness: 0.8 },
  "chief-typing-executive": { color: "#f2c94c", textColor: "#2b1d00", width: 0.28, metalness: 0.9, glow: "#ffcf4a" },
} as const satisfies Record<JobId, NameplateLook>;

const looksById: Readonly<Record<string, NameplateLook>> = nameplateLooks;

/** The plate for a job id, falling back to the Intern's for an unknown one. */
export function nameplateLook(id: string): NameplateLook {
  return looksById[id] ?? nameplateLooks.intern;
}
