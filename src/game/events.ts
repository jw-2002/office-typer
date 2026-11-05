// The rules for office events: what they cost or give (scaled by your pay multiplier), what choosing does to your
// progress, and when the next one happens. Pure, so it can be tested.
import type { EventChoice, OfficeEvent } from "./data/events";
import { officeEvents } from "./data/events";
import type { Progress } from "./progress";
import { pick, type Rng } from "./random";

/** Credits for a factor of 1 at a multiplier of 1. At a multiplier of x30 the same factor is 30 times as much. */
export const EVENT_BASE_CREDITS = 8;
/** Seconds of play between one event and the next: a random time between these. */
export const EVENT_MIN_SECONDS = 150;
export const EVENT_MAX_SECONDS = 300;
/** The first event never comes sooner than this after the game starts. */
export const FIRST_EVENT_SECONDS = 90;

/** Credits for a factor, scaled by your overall pay multiplier and never less than 1. */
export function eventAmount(factor: number, multiplier: number): number {
  return Math.max(1, Math.round(EVENT_BASE_CREDITS * factor * multiplier));
}

/** How long to wait before the next event. */
export function nextEventDelay(rng: Rng): number {
  return EVENT_MIN_SECONDS + rng() * (EVENT_MAX_SECONDS - EVENT_MIN_SECONDS);
}

/** An event to show next, never the same one twice in a row (unless there is only one). */
export function pickEvent(rng: Rng, lastId: string | null): OfficeEvent {
  const options = officeEvents.filter((event) => event.id !== lastId);
  return pick(rng, options.length > 0 ? options : officeEvents);
}

/** What a choice costs and gives right now, in credits. */
export function choiceAmounts(choice: EventChoice, multiplier: number): { cost: number; gain: number } {
  return {
    cost: choice.cost ? eventAmount(choice.cost, multiplier) : 0,
    gain: choice.gain ? eventAmount(choice.gain, multiplier) : 0,
  };
}

/** Whether the player has enough credits to make a choice. */
export function canAfford(progress: Progress, choice: EventChoice, multiplier: number): boolean {
  return progress.player.currency >= choiceAmounts(choice, multiplier).cost;
}

/** Applies a choice: pays or is paid, and adds to the counters. Returns the same progress if it cannot be afforded. */
export function applyChoice(progress: Progress, choice: EventChoice, multiplier: number): Progress {
  if (!canAfford(progress, choice, multiplier)) return progress;
  const { cost, gain } = choiceAmounts(choice, multiplier);
  const stats = (choice.stats ?? []).reduce<Progress["stats"]>(
    (current, stat) => ({ ...current, [stat]: current[stat] + 1 }),
    progress.stats,
  );
  return {
    ...progress,
    player: { ...progress.player, currency: progress.player.currency - cost + gain },
    stats: { ...stats, eventsHandled: stats.eventsHandled + 1, totalEarned: stats.totalEarned + gain },
  };
}
