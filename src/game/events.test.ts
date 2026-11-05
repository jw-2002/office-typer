// Tests for office events: the data is valid, what they cost scales with your multiplier, and choices change progress.
import { describe, expect, it } from "vitest";
import { slotBase } from "./assignments";
import { officeEvents } from "./data/events";
import { slots } from "./data/slots";
import {
  EVENT_BASE_CREDITS,
  EVENT_MAX_SECONDS,
  EVENT_MIN_SECONDS,
  applyChoice,
  canAfford,
  choiceAmounts,
  eventAmount,
  nextEventDelay,
  pickEvent,
} from "./events";
import { newProgress, type Progress } from "./progress";
import { createRng } from "./random";

const withCredits = (currency: number): Progress => ({ ...newProgress(), player: { name: "Bo", currency } });
const card = officeEvents.find((event) => event.id === "birthday-card")!;
const chipIn = card.choices[1];
const signOnly = card.choices[0];

describe("event data", () => {
  const texts = officeEvents.flatMap((event) => [
    event.title,
    event.text,
    ...event.choices.flatMap((choice) => [choice.label, choice.result]),
  ]);

  it("only uses slots that exist, and plain typeable text", () => {
    for (const text of texts) {
      expect(text).toMatch(/^[\x20-\x7e]+$/);
      for (const [, name] of text.matchAll(/\{(\w+)\}/g)) expect(slots, text).toHaveProperty(slotBase(name));
    }
  });

  it("gives every event a unique id, a free way out, and sentences that end properly", () => {
    expect(new Set(officeEvents.map((event) => event.id)).size).toBe(officeEvents.length);
    for (const event of officeEvents) {
      expect(event.choices.length, event.id).toBeGreaterThanOrEqual(2);
      expect(
        event.choices.some((choice) => !choice.cost),
        event.id,
      ).toBe(true);
      expect(event.text).toMatch(/[.!?]$/);
      for (const choice of event.choices) expect(choice.result, choice.label).toMatch(/[.!?]$/);
    }
  });

  it("includes signing a card and chipping in for a present", () => {
    expect(signOnly.stats).toContain("cardsSigned");
    expect(chipIn.cost).toBeGreaterThan(0);
    expect(chipIn.stats).toContain("presents");
  });
});

describe("eventAmount", () => {
  it("scales with your pay multiplier, so generosity keeps up with how well you are doing", () => {
    expect(eventAmount(1, 1)).toBe(EVENT_BASE_CREDITS);
    expect(eventAmount(1, 10)).toBe(EVENT_BASE_CREDITS * 10);
    expect(eventAmount(1, 30)).toBeGreaterThan(eventAmount(1, 3));
    expect(eventAmount(1.5, 2)).toBe(EVENT_BASE_CREDITS * 3);
  });

  it("is never less than 1", () => {
    expect(eventAmount(0.01, 0.01)).toBe(1);
  });
});

describe("applying a choice", () => {
  it("takes the cost and counts the card and the present", () => {
    const { cost } = choiceAmounts(chipIn, 2);
    const after = applyChoice(withCredits(100), chipIn, 2);
    expect(after.player.currency).toBe(100 - cost);
    expect(after.stats).toMatchObject({ presents: 1, cardsSigned: 1, eventsHandled: 1 });
  });

  it("does nothing if it cannot be afforded, but a free choice always works", () => {
    const poor = withCredits(1);
    expect(canAfford(poor, chipIn, 5)).toBe(false);
    expect(applyChoice(poor, chipIn, 5)).toBe(poor);
    expect(applyChoice(poor, signOnly, 5).stats.cardsSigned).toBe(1);
  });

  it("pays out gains, and counts them as earned", () => {
    const windfall = officeEvents.find((event) => event.id === "vending-windfall")!.choices[0];
    const after = applyChoice(withCredits(0), windfall, 3);
    expect(after.player.currency).toBe(choiceAmounts(windfall, 3).gain);
    expect(after.stats.totalEarned).toBe(after.player.currency);
  });
});

describe("timing and choosing events", () => {
  it("waits a random time between the minimum and maximum", () => {
    for (let seed = 0; seed < 30; seed++) {
      const delay = nextEventDelay(createRng(seed));
      expect(delay).toBeGreaterThanOrEqual(EVENT_MIN_SECONDS);
      expect(delay).toBeLessThanOrEqual(EVENT_MAX_SECONDS);
    }
  });

  it("never picks the same event twice in a row", () => {
    for (let seed = 0; seed < 50; seed++)
      expect(pickEvent(createRng(seed), "birthday-card").id).not.toBe("birthday-card");
  });
});
