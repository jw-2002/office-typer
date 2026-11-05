// Tests for building saves and for reading good, old, damaged and unknown ones.
import { describe, expect, it } from "vitest";
import { newProgress } from "./progress";
import { SAVE_VERSION, migrate, toSave } from "./save";

describe("save round trip", () => {
  it("reads back what it wrote", () => {
    const progress = {
      ...newProgress(),
      player: { name: "", currency: 42 },
      upgrades: ["beige-box", "mushy", "track-hold", "strawberry"],
    };
    const saved = toSave(progress, 1234);
    expect(saved.version).toBe(SAVE_VERSION);
    expect(migrate(JSON.parse(JSON.stringify(saved)))).toEqual(saved);
  });
});

describe("migrate", () => {
  it("rejects things that are not saves", () => {
    expect(migrate(null)).toBeNull();
    expect(migrate("hello")).toBeNull();
    expect(migrate([])).toBeNull();
    expect(migrate({})).toBeNull();
    expect(migrate({ version: "1" })).toBeNull();
    expect(migrate({ version: 0 })).toBeNull();
    expect(migrate({ version: 1.5 })).toBeNull();
  });

  it("rejects a save from a newer version of the game", () => {
    expect(migrate({ ...toSave(newProgress(), 0), version: SAVE_VERSION + 1 })).toBeNull();
  });

  it("repairs bad fields instead of discarding the save", () => {
    const result = migrate({
      version: SAVE_VERSION,
      player: { name: "", currency: -5 },
      upgrades: ["strawberry", "strawberry", "not-real", 7],
      stats: { totalChars: "lots", bestWpm: 80, totalEarned: Infinity },
    });
    expect(result).not.toBeNull();
    expect(result?.player.currency).toBe(0);
    expect(result?.upgrades).toEqual(["beige-box", "mushy", "track-hold", "strawberry"]);
    expect(result?.stats).toMatchObject({
      totalChars: 0,
      assignmentsCompleted: 0,
      bestWpm: 80,
      totalEarned: 0,
      secondsPlayed: 0,
      streak: 0,
      goblinUses: 0,
    });
  });

  it("upgrades a version 1 save, which had no equipped choice, to the best owned", () => {
    const old = {
      version: 1,
      savedAt: 5,
      player: { name: "", currency: 12 },
      upgrades: ["beige-box", "grey-tower", "mushy", "strawberry"],
      stats: { totalChars: 10, assignmentsCompleted: 1, bestWpm: 40, totalEarned: 30 },
    };
    const result = migrate(old);
    expect(result?.version).toBe(SAVE_VERSION);
    expect(result?.equipped).toEqual({ computer: "grey-tower", switches: "strawberry", assistant: "" });
    expect(result?.finale).toEqual({ stage: "none", seconds: 0 });
    expect(result?.stats.secondsPlayed).toBe(0);
    expect(result?.player.currency).toBe(12);
  });

  it("keeps a valid equipped choice and repairs an invalid one", () => {
    const base = { version: SAVE_VERSION, upgrades: ["beige-box", "grey-tower", "mushy"] };
    expect(migrate({ ...base, equipped: { computer: "beige-box", switches: "mushy" } })?.equipped.computer).toBe(
      "beige-box",
    );
    expect(migrate({ ...base, equipped: { computer: "gaming-rig" } })?.equipped.computer).toBe("grey-tower");
    expect(migrate({ ...base, equipped: "nonsense" })?.equipped.computer).toBe("grey-tower");
  });

  it("keeps an unfinished ending, and repairs a nonsense one", () => {
    const base = { version: SAVE_VERSION, upgrades: [] };
    expect(migrate({ ...base, finale: { stage: "pending", seconds: 12 } })?.finale).toEqual({
      stage: "pending",
      seconds: 12,
    });
    expect(migrate({ ...base, finale: { stage: "redundant", seconds: 0 } })?.finale.stage).toBe("redundant");
    expect(migrate({ ...base, finale: { stage: "fired", seconds: -3 } })?.finale).toEqual({
      stage: "none",
      seconds: 0,
    });
    expect(migrate({ ...base, finale: "x" })?.finale).toEqual({ stage: "none", seconds: 0 });
  });

  it("always includes the free starting upgrades", () => {
    expect(migrate({ version: SAVE_VERSION, upgrades: [] })?.upgrades).toEqual(["beige-box", "mushy", "track-hold"]);
  });

  it("repairs a missing or bad player name", () => {
    const base = { version: 3, player: { currency: 5 }, upgrades: [], stats: {} };
    expect(migrate(base)?.player.name).toBe("");
    expect(migrate({ ...base, player: { currency: 5, name: 42 } })?.player.name).toBe("");
    expect(migrate({ ...base, player: { currency: 5, name: "  Kevin " } })?.player.name).toBe("Kevin");
  });

  it("keeps goblin mode timers but caps them, and repairs nonsense", () => {
    const save = (goblin: unknown) => migrate({ version: 3, savedAt: 1, player: {}, upgrades: [], stats: {}, goblin });
    expect(save({ active: 10, cooldown: 100 })?.goblin).toEqual({ active: 10, cooldown: 100 });
    expect(save({ active: 99999, cooldown: 99999 })?.goblin).toEqual({ active: 40, cooldown: 300 });
    expect(save({ active: "x", cooldown: -5 })?.goblin).toEqual({ active: 0, cooldown: 0 });
    expect(save(undefined)?.goblin).toEqual({ active: 0, cooldown: 0 });
  });
});

describe("migrate: legacy and achievements", () => {
  const save = (extra: Record<string, unknown>) =>
    migrate({ version: 3, savedAt: 1, player: {}, upgrades: [], stats: {}, ...extra });

  it("keeps real achievements once each, and drops unknown or odd ones", () => {
    expect(save({ achievements: ["first-words", "first-words", "nope", 7] })?.achievements).toEqual(["first-words"]);
    expect(save({ achievements: "x" })?.achievements).toEqual([]);
    expect(save({})?.achievements).toEqual([]);
  });

  it("keeps legacy within range", () => {
    expect(save({ legacy: 3 })?.legacy).toBe(3);
    expect(save({ legacy: 999 })?.legacy).toBe(10);
    expect(save({ legacy: -1 })?.legacy).toBe(0);
    expect(save({})?.legacy).toBe(0);
  });
});

describe("migrate: stowed extras", () => {
  const save = (extra: Record<string, unknown>) => migrate({ version: 3, savedAt: 1, player: {}, stats: {}, ...extra });

  it("keeps only owned ones, once each", () => {
    expect(save({ upgrades: ["plant"], stowed: ["plant", "plant", "tiny-goblin", 3] })?.stowed).toEqual(["plant"]);
    expect(save({ upgrades: [], stowed: "x" })?.stowed).toEqual([]);
    expect(save({ upgrades: [] })?.stowed).toEqual([]);
  });
});
