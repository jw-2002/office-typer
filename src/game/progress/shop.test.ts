// Tests for buying, equipping and putting away upgrades and desk extras.
import { describe, expect, it } from "vitest";
import { upgrades } from "@/game/data/upgrades";
import { upgradeMultiplier } from "@/game/economy/economy";
import { equippedUpgrade, newProgress, normaliseEquipped, type Progress } from "./progress";
import { buyStatus, buyUpgrade, equipUpgrade, isOnDesk, toggleStowed } from "./shop";

const upgrade = (id: string) => upgrades.find((candidate) => candidate.id === id)!;
const withCredits = (currency: number): Progress => ({ ...newProgress(), player: { name: "", currency: currency } });

describe("buyStatus and buyUpgrade", () => {
  it("starts owning the free upgrades", () => {
    expect(buyStatus(newProgress(), upgrade("beige-box"))).toBe("owned");
    expect(buyStatus(newProgress(), upgrade("mushy"))).toBe("owned");
  });

  it("reports too-expensive, ok and locked", () => {
    expect(buyStatus(withCredits(10), upgrade("strawberry"))).toBe("too-expensive");
    expect(buyStatus(withCredits(60), upgrade("strawberry"))).toBe("ok");
    expect(buyStatus(withCredits(99999), upgrade("chestnut"))).toBe("locked");
  });

  it("buys an upgrade, taking the cost", () => {
    const bought = buyUpgrade(withCredits(100), "strawberry");
    expect(bought.upgrades).toContain("strawberry");
    expect(bought.player.currency).toBe(40);
  });

  it("will not buy twice, when poor, when locked, or an unknown id", () => {
    const start = withCredits(100);
    const once = buyUpgrade(start, "strawberry");
    expect(buyUpgrade(once, "strawberry")).toBe(once);
    expect(buyUpgrade(withCredits(10), "strawberry").upgrades).not.toContain("strawberry");
    expect(buyUpgrade(withCredits(99999), "chestnut").upgrades).not.toContain("chestnut");
    expect(buyUpgrade(start, "nope")).toBe(start);
  });

  it("lets tiers be bought in order", () => {
    let progress = withCredits(1000);
    progress = buyUpgrade(progress, "strawberry");
    expect(buyStatus(progress, upgrade("chestnut"))).toBe("ok");
    progress = buyUpgrade(progress, "chestnut");
    expect(progress.upgrades).toContain("chestnut");
  });
});

describe("equipping", () => {
  it("starts with the free upgrades in use", () => {
    const progress = newProgress();
    expect(equippedUpgrade(progress, "computer")?.id).toBe("beige-box");
    expect(equippedUpgrade(progress, "switches")?.id).toBe("mushy");
  });

  it("puts a new purchase to use straight away", () => {
    const bought = buyUpgrade(withCredits(100), "grey-tower");
    expect(bought.equipped.computer).toBe("grey-tower");
    expect(bought.equipped.switches).toBe("mushy");
  });

  it("swaps between owned upgrades without changing what is owned or paid", () => {
    const bought = buyUpgrade(withCredits(100), "grey-tower");
    const back = equipUpgrade(bought, "beige-box");
    expect(back.equipped.computer).toBe("beige-box");
    expect(back.upgrades).toEqual(bought.upgrades);
    expect(back.player.currency).toBe(bought.player.currency);
  });

  it("will not equip something not owned, unknown, or already in use", () => {
    const start = newProgress();
    expect(equipUpgrade(start, "gaming-rig")).toBe(start);
    expect(equipUpgrade(start, "nope")).toBe(start);
    expect(equipUpgrade(start, "beige-box")).toBe(start);
  });

  it("normaliseEquipped repairs missing, unknown and unowned choices with the best owned", () => {
    const owned = ["beige-box", "grey-tower", "mushy"];
    expect(normaliseEquipped(owned, {})).toEqual({ computer: "grey-tower", switches: "mushy", assistant: "" });
    expect(normaliseEquipped(owned, { computer: "beige-box", switches: "blueberry" })).toEqual({
      computer: "beige-box",
      switches: "mushy",
      assistant: "",
    });
    // A switch is not a valid computer, even though it is owned.
    expect(normaliseEquipped(owned, { computer: "mushy" }).computer).toBe("grey-tower");
  });
});

describe("desk extras", () => {
  const extras = ["plant", "desk-lamp", "desk-clock", "tiny-goblin", "helping-hands"];

  it("can be bought in any order, with no tiers to unlock", () => {
    for (const id of extras) expect(buyStatus(withCredits(99999), upgrade(id)), id).toBe("ok");
    expect(buyStatus(withCredits(10), upgrade("helping-hands"))).toBe("too-expensive");
  });

  it("are owned once bought, and do not change what is in use or the pay", () => {
    const start = withCredits(1000);
    const bought = buyUpgrade(start, "tiny-goblin");
    expect(bought.upgrades).toContain("tiny-goblin");
    expect(bought.equipped).toEqual(start.equipped);
    expect(buyStatus(bought, upgrade("tiny-goblin"))).toBe("owned");
    expect(upgradeMultiplier(bought.upgrades)).toBe(upgradeMultiplier(start.upgrades));
  });

  it("have nothing to switch to", () => {
    const bought = buyUpgrade(withCredits(1000), "plant");
    expect(equipUpgrade(bought, "plant")).toBe(bought);
  });

  it("are not bought twice", () => {
    const once = buyUpgrade(withCredits(1000), "plant");
    expect(buyUpgrade(once, "plant")).toBe(once);
  });

  it("do not stop the game ending, and are all cheap compared with the top assistant", () => {
    for (const id of extras) expect(upgrade(id).cost).toBeLessThan(upgrade("clyde-octet-5").cost / 10);
  });
});

describe("putting desk extras away", () => {
  const owning = (ids: string[]): Progress => ({ ...newProgress(), upgrades: [...newProgress().upgrades, ...ids] });

  it("puts an owned extra away and back out again, and it stays owned", () => {
    const start = owning(["plant"]);
    expect(isOnDesk(start, "plant")).toBe(true);
    const away = toggleStowed(start, "plant");
    expect(isOnDesk(away, "plant")).toBe(false);
    expect(away.upgrades).toContain("plant");
    expect(isOnDesk(toggleStowed(away, "plant"), "plant")).toBe(true);
  });

  it("only works for extras you own", () => {
    const start = owning(["plant"]);
    expect(toggleStowed(start, "tiny-goblin")).toBe(start);
    expect(toggleStowed(start, "grey-tower")).toBe(start);
    expect(toggleStowed(start, "nope")).toBe(start);
  });
});
