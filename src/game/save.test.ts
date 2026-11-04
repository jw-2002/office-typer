// Tests for building saves and for reading good, old, damaged and unknown ones.
import { describe, expect, it } from "vitest";
import { newProgress } from "./progress";
import { SAVE_VERSION, migrate, toSave } from "./save";

describe("save round trip", () => {
  it("reads back what it wrote", () => {
    const progress = { ...newProgress(), player: { currency: 42 }, upgrades: ["beige-box", "mushy", "strawberry"] };
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
      player: { currency: -5 },
      upgrades: ["strawberry", "strawberry", "not-real", 7],
      stats: { totalChars: "lots", bestWpm: 80, totalEarned: Infinity },
    });
    expect(result).not.toBeNull();
    expect(result?.player.currency).toBe(0);
    expect(result?.upgrades).toEqual(["beige-box", "mushy", "strawberry"]);
    expect(result?.stats).toEqual({ totalChars: 0, assignmentsCompleted: 0, bestWpm: 80, totalEarned: 0 });
  });

  it("upgrades a version 1 save, which had no equipped choice, to the best owned", () => {
    const old = {
      version: 1,
      savedAt: 5,
      player: { currency: 12 },
      upgrades: ["beige-box", "grey-tower", "mushy", "strawberry"],
      stats: { totalChars: 10, assignmentsCompleted: 1, bestWpm: 40, totalEarned: 30 },
    };
    const result = migrate(old);
    expect(result?.version).toBe(SAVE_VERSION);
    expect(result?.equipped).toEqual({ computer: "grey-tower", switches: "strawberry" });
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

  it("always includes the free starting upgrades", () => {
    expect(migrate({ version: SAVE_VERSION, upgrades: [] })?.upgrades).toEqual(["beige-box", "mushy"]);
  });
});
